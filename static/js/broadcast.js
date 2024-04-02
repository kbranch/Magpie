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
            receiveMap(msg.data);
        }
        else if (msg.type == 'args') {
            receiveArgs(msg.data);
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

function receiveMap(data) {
    console.log(data);
}

function receiveArgs(data) {
    setInputValues('flag', data);
    saveSettings();
}

function broadcastItems() {
    channel.postMessage({type: 'items', data: inventory});
}

function broadcastMap() {
    // channel.postMessage({type: 'items', data: inventory});
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