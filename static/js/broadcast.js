"use strict"

let channel = new BroadcastChannel('magpie');

function channelHandler(e) {
    let msg = e.data;

    console.log(msg);
    
    if (!('type' in msg) || !('data' in msg)) {
        console.log(`Invalid broadcast message: ${msg}`);
        return;
    }

    if (broadcastMode == 'receive') {
        if (msg.type == 'items') {
            receiveItems(msg.data);
        }
        else if (msg.type == 'map') {
            receiveMap(msg.data, msg.refresh == true);
        }
        else if (msg.type == 'args') {
            receiveArgs(msg.data);
        }
        else if (msg.type == 'mapTab') {
            openTab(msg.data);
        }
    }
    else if (broadcastMode == 'send') {
        if (msg.type == 'send') {
            broadcastItems();
            broadcastMap();
            broadcastArgs();
        }
    }
}

function receiveItems(data) {
    inventory = data;

    saveInventory();
    refreshImages();
}

function receiveMap(data, refresh) {
    for (const attr in data) {
        let value = data[attr];

        if (!value) {
            window[attr] = value;
            continue;
        }

        if (attr == 'checkAccessibility') {
            value = value.map(x => {
                let check = new Check(x);
                checksById[x.id] = check;
                return check;
            });
        }
        else if (attr == 'logicHintAccessibility') {
            value = value.map(x => new LogicHint(x));
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

    if (refresh) {
        drawActiveTab();
    }
}

function receiveArgs(data) {
    setInputValues('flag', data);
    saveSettings();
}

function broadcastItems() {
    channel.postMessage({type: 'items', data: inventory});
}

function broadcastMap() {
    channel.postMessage({type: 'map',
    data: {
        startLocations: startLocations,
        randomizedEntrances: randomizedEntrances,
        entranceMap: entranceMap,
        reverseEntranceMap: reverseEntranceMap,
        connections: connections,
        bossMap: bossMap,
        checkedChecks: checkedChecks,
        checkContents: checkContents,
    }});

    channel.postMessage({type: 'map',
    refresh: true,
    data: {
        entranceAccessibility: entranceAccessibility,
        checkAccessibility: checkAccessibility?.map(x => x.source),
        logicHintAccessibility: logicHintAccessibility?.map(x => x.source),
    }});
}

function broadcastMapTab(tabName) {
    channel.postMessage({type: 'mapTab', data: tabName});
}

function broadcastArgs() {
    channel.postMessage({type: 'args', data: args});
}

function requestUpdate() {
    channel.postMessage({type: 'send', data: null});
}

function broadcastInit() {
    channel.onmessage = channelHandler

    if (broadcastMode == 'receive') {
        requestUpdate();
    }
    else if (broadcastMode == 'send') {
        broadcastArgs();
        broadcastItems();
        broadcastMap();
    }
}

window.broadcastInit = broadcastInit;
window.broadcastItems = broadcastItems;
window.broadcastMap = broadcastMap;
window.broadcastArgs = broadcastArgs;
window.broadcastMapTab = broadcastMapTab;