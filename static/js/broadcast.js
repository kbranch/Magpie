"use strict"

let channel = null;
let broadcastSocket = null;
let receiving = false;
let skipNextBroadcast = false;

function handleBroadcastMessage(msg) {
    if (!('type' in msg) || !('data' in msg)) {
        console.log(`Invalid broadcast message: ${msg}`);
        return;
    }

    receiving = true;

    // console.log(`receiving ${msg.type} ID ${msg.id}`);
    // console.log(msg);

    try {
        if (msg.type == 'items' && broadcastMode == 'receive') {
            receiveItems(msg.data);
        }
        else if (msg.type == 'map' && broadcastMode == 'receive') {
            receiveMap(msg.data);
        }
        else if (msg.type == 'args' && broadcastMode == 'receive') {
            receiveArgs(msg.data);
        }
        else if (msg.type == 'mapTab' && broadcastMode == 'receive') {
            openTab(msg.data);
        }
        else if (msg.type == 'location' && broadcastMode == 'receive') {
            receiveLocation(msg.data);
        }
        else if (msg.type == 'send' && broadcastMode == 'send') {
            broadcastItems(false, true);
            broadcastMap(false, true);
            broadcastArgs(false, true);
        }
    }
    catch(e) {
        console.log(`Error processing broadcast message '${msg}': ${e}`);
    }

    receiving = false;
}

function receiveItems(data) {
    inventory = data;

    saveInventory();
    refreshImages();

    if (allowMap) {
        refreshCheckList();
    }
}

function receiveMap(data) {
    processMapPart(data.meFirst);
    processMapPart(data.thenMe);

    drawActiveTab();

    if (allowMap) {
        skipNextBroadcast = true;
        refreshCheckList();
    }
}

function processMapPart(data) {
    for (const attr in data) {
        let value = data[attr];

        if (!value) {
            window[attr] = value;
            continue;
        }

        if (attr == 'checkAccessibility') {
            allChecksById = {};

            value = value.map(x => {
                let check = new Check(x);
                checksById[x.id] = check;
                return check;
            });
        }
        else if (attr == 'logicHintAccessibility') {
            value = value.map(x => new LogicHint(x));
        }
        else if (attr == 'checkedChecks') {
            value = new Set(value);
        }
        else if (attr == 'connections') {
            let newConnections = [];

            for (const conn of value) {
                newConnections.push(new Connection(conn.entrances, conn.connector, conn.label, conn.vanilla, conn.map));
            }

            value = newConnections;
        }

        window[attr] = value;
    }
}

function receiveLocation(data) {
    for (const attr in data) {
        window[attr] = data[attr];
    }

    drawLocation();
}

function receiveArgs(data) {
    for (const attr in data) {
        args[attr] = data[attr];
    }
    saveSettings();
}

var itemTimeout = null;
function broadcastItems(buffer=true, force=false) {
    if (receiving && !force) {
        return;
    }

    if (buffer) {
        if (itemTimeout) {
            clearTimeout(itemTimeout);
        }

        itemTimeout = setTimeout(() => broadcastItems(false), 100);
        return;
    }

    broadcastMessage({type: 'items', data: inventory});
}

var mapTimeout = null;
function broadcastMap(buffer=true, force=false) {
    if ((receiving && !force) || skipNextBroadcast) {
        if (!buffer) {
            skipNextBroadcast = false;
        }

        return;
    }

    if (buffer) {
        if (mapTimeout) {
            clearTimeout(mapTimeout);
        }

        mapTimeout = setTimeout(() => broadcastMap(false), 100);
        return;
    }

    let contents = {};
    Object.assign(contents, checkContents);

    broadcastMessage({
        type: 'map',
        data: {
            meFirst: {
                startLocations: startLocations,
                randomizedEntrances: randomizedEntrances,
                entranceMap: entranceMap,
                reverseEntranceMap: reverseEntranceMap,
                connections: connections,
                bossMap: bossMap,
                checkedChecks: Array.from(checkedChecks),
                checkContents: contents,
            },
            thenMe: {
                entranceAccessibility: entranceAccessibility,
                checkAccessibility: checkAccessibility?.map(x => x.source),
                logicHintAccessibility: logicHintAccessibility?.map(x => x.source),
            }
        }
    });
}

export function broadcastMapTab(tabName) {
    if (receiving) {
        return;
    }

    broadcastMessage({type: 'mapTab', data: tabName});
}

var argsTimeout = null;
function broadcastArgs(buffer=true, force=false) {
    if (receiving && !force) {
        return;
    }

    if (buffer) {
        if (argsTimeout) {
            clearTimeout(argsTimeout);
        }

        argsTimeout = setTimeout(() => broadcastArgs(false), 100);
        return;
    }

    broadcastMessage({type: 'args', data: args});
}

function broadcastLocation() {
    if (receiving) {
        return;
    }

    broadcastMessage({type: 'location', data: {
        overworldRoom: overworldRoom,
        overworldX: overworldX,
        overworldY: overworldY,
        currentRoom: currentRoom,
        currentX: currentX,
        currentY: currentY,
    }});
}

function requestUpdate() {
    broadcastMessage({type: 'send', data: null});
}

function broadcastInit() {
    if (broadcastMode == 'none') {
        return;
    }

    if (local) {
        connectToBroadcaster();
        setInterval(connectToBroadcaster, 3 * 1000);
    }
    else {
        channel = new BroadcastChannel('magpie');
        channel.onmessage = (e) => handleBroadcastMessage(e.data);
    }

    if (broadcastMode == 'receive') {
        requestUpdate();
    }
    else if (broadcastMode == 'send') {
        broadcastArgs();
        broadcastItems();
        broadcastMap();
    }
}

function broadcastMessage(msg) {
    if (!channel && !broadcastSocket) {
        return;
    }

    msg.id = String(Math.random());

    // console.log(`sending ${msg.type} ID ${msg.id}`);

    if (local) {
        if (broadcastSocket != null && broadcastSocket.readyState == 1) {
            let messageText = JSON.stringify(msg);
            broadcastSocket.send(messageText);
        }
    }
    else {
        msg.data = vueApp.stripProxy(msg.data);

        channel.postMessage(msg);
    }
}

function connectToBroadcaster() {
    if (typeof maxInventory == 'undefined' || typeof randomizedEntrances == 'undefined') {
        return;
    }

    if (broadcastSocket == null || broadcastSocket.readyState == 3) {
        broadcastSocket = new WebSocket(`ws://127.0.0.1:17025/`);

        broadcastSocket.onmessage = (event) => handleBroadcastMessage(JSON.parse(event.data));
        broadcastSocket.onerror = (event) => console.log(event);
        broadcastSocket.onclose = (event) => {
            currentRoom = null;
            currentX = null;
            currentY = null;

            drawLocation();
        };
    }
}

window.broadcastInit = broadcastInit;
window.broadcastItems = broadcastItems;
window.broadcastMap = broadcastMap;
window.broadcastArgs = broadcastArgs;
window.broadcastMapTab = broadcastMapTab;
window.broadcastLocation = broadcastLocation;