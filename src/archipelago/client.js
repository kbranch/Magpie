import { itemMap, checkMap } from './tables';
import { useStateStore } from '@/stores/stateStore';
import { processMessage, alertModal, autotrackerConnected, setCheckContents } from '@/moduleWrappers';
import { Client, itemsHandlingFlags, } from "/node_modules/archipelago.js/dist/index.js";

let state;

export const client = new Client({ autoFetchDataPackage: false });

export function archipelagoInit() {
    state = useStateStore();
    client.items
        .on("itemsReceived", receivedItems)
        .on("hintReceived", processHint)
        .on("hintsInitialized", initHints)
        .on("hintFound", processHint);

    client.room
        .on("locationsChecked", roomUpdate);

    window.archipelagoConnect = archipelagoConnect;
    window.archipelagoDisconnect = archipelagoDisconnect;
    window.archipelagoClient = client;
}

function clearApHints() {
    for (const hint of [... state.hints]) {
        if (hint.source == 'AP') {
            state.removeHint(hint);
        }
    }
}

function initHints(hints) {
    clearApHints();

    hints.map(processHint);
}

function processHint(hint) {
    try {
        if (hint.item.sender.slot != client.players.self.slot) {
            return;
        }

        let item = itemMap[hint.item.id] ?? 'GOOD';
        let locationId = checkMap[hint.item.locationId];

        if (!locationId || !(locationId in coordDict)) {
            console.log(`Invalid hint, item '${hint.item.id}', location '${hint.item.locationId}'/${locationId}`);
            return;
        }

        let locationName = coordDict[locationId].name;
        let existingHints = state.hints.filter(x => x.item == item && x.location == locationName);

        if (item != 'GOOD' || hint.item.progression) {
            setCheckContents(locationId, item);
        }

        if (hint.found && existingHints.length) {
            existingHints.map(state.removeHint);
        }
        else if (!hint.found && hint.item.progression && !existingHints.length) {
            state.checkContents[locationId] = item;
            state.hints.push({ item: item, location: locationName, source: 'AP', locationId: locationId });
        }
    }
    catch(err) {
        console.log(`Invalid hint, item '${hint.item.id}', location '${hint.item.locationId}'`, err);
    }
}

function connected(slotData) {
    console.log("Connected to AP server: ", slotData);

    try {
        parseSlotData(slotData)
        parseCheckedChecks(client.room.checkedLocations, false);
    }
    catch(err) {
        console.log(`Error processing AP slot data: ${err}`);
    }
}

function receivedItems(items, index) {
    if (autotrackerConnected()) {
        return;
    }

    console.log("AP Item packet: ", items);

    try {
        let apItems = {};
        for (const item of items) {
            let ladxItem = itemMap[item.id];

            if (!(ladxItem in apItems)) {
                apItems[ladxItem] = 0;
            }

            apItems[ladxItem]++;
        }

        let message = {
            type: "item",
            refresh: true,
            source: "archipelago",
            diff: index > 0,
            items: [],
        };

        for (const item in apItems) {
            message.items.push({
                id: item,
                qty: apItems[item],
            });
        }

        processMessage(JSON.stringify(message));
    }
    catch(err) {
        console.log(`Error processing AP items: ${err}`);
    }
}

function parseSlotData(slotData) {
    let message = {
        type: "slot_data",
        source: "archipelago",
        slot_data: slotData,
    };

    processMessage(JSON.stringify(message));
}

function roomUpdate(checkedLocations) {
    if (autotrackerConnected()) {
        return;
    }

    console.log("AP room update packet: ", checkedLocations);
    
    try {
        if (checkedLocations) {
            parseCheckedChecks(checkedLocations, true);
        }
    }
    catch(err) {
        console.log(`Error processing AP items: ${err}`);
    }
}

function parseCheckedChecks(apCheckIds, diff) {
    let checked = apCheckIds.map(x => checkMap[x]);

    let message = {
        type: "check",
        refresh: true,
        source: "archipelago",
        diff: diff,
        checks: [],
    };

    for (const check of checked) {
        message.checks.push({
            id: check,
            checked: true,
        });
    }

    processMessage(JSON.stringify(message));
}

function archipelagoConnect(hostname, port, slotName, password) {
    client.login(
        `${hostname}:${port}`,
        slotName,
        "Links Awakening DX",
        {
            password: password,
            tags: ['Tracker'],
            items: itemsHandlingFlags.all,
        },
    )
    .then(connected)
    .catch((err) => {
            console.error("Failed to connect to AP:", err);
            alertModal("Archipelago Error", `Error connecting to Archipelago: ${err}`);
    });
}

function archipelagoDisconnect() {
    // if (client.status == "Connected") {
    //     addAutotrackerMessage("Disconnecting from Archipelago");
    // }

    // client.disconnect();
}