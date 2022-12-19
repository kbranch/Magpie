function processCheckMessage(message) {
    if (message.type == 'set') {
        console.log('Receiving full autotracker checks');
        resetChecks();
    }

    for (const check of message.items) {
        let metadata = coordDict[check.id];
        let key = getCheckedKey(metadata.area, metadata.name);

        if (check.qty > 0) {
            checkedChecks[key] = {
                name: metadata.name,
                area: metadata.area,
            };
        }
        else if (check.qty < 0) {
            delete checkedChecks[key];
        }
    }

    saveChecked();

    if (message.refresh) {
        refreshChecked();
        drawActiveTab();
    }
}

function processItemMessage(message) {
    if (typeof maxInventory == 'undefined') {
        return;
    }

    if (message.type == 'set') {
        console.log('Receiving full autotracker inventory');
        resetInventory();
    }

    for (const item of message.items) {
        addItem(item.id, item.qty, wrap=false, refresh=false);
    }

    if (message.refresh) {
        refreshCheckList();
    }
}

function processEntranceMessage(message) {
    if (message.type == 'set') {
        console.log('Receiving full autotracker entrances');
        // resetEntrances();
    }

    for (const outdoor in message.entranceMap) {
        if (outdoor in entranceMap) {
            continue;
        }

        if (Entrance.isConnector(outdoor)) {
            connectOneEndConnector(outdoor, message.entranceMap[outdoor], refresh=false);
            updateReverseMap();
        }
        else {
            connectEntrances(outdoor, message.entranceMap[outdoor], refresh=false);
        }
    }

    if (message.refresh) {
        refreshCheckList();
    }
}

function connectToAutotracker() {
    if (!localSettings.enableAutotracking) {
        return;
    }

    if (autotrackerSocket == null || autotrackerSocket.readyState == 3) {
        autotrackerSocket = new WebSocket("ws://127.0.0.1:17026/");

        autotrackerSocket.onopen = autotrackerConnected;
        autotrackerSocket.onmessage = (event) => processMessage(event.data);
        autotrackerSocket.onerror = (event) => console.log(event);
        autotrackerSocket.onclose = (event) => console.log(event);
    }
}

function processMessage(messageText) {
    let message;

    try {
        message = JSON.parse(messageText);
    }
    catch(err) {
        console.log(`Invalid message JSON: ${err}`);
        console.log(messageText);
        return;
    }
    
    switch (message.category) {
        case 'item':
            processItemMessage(message);
            break;
        case 'check':
            processCheckMessage(message);
            break;
        case 'entrance':
            processEntranceMessage(message);
            break;
        case 'refresh':
            refreshCheckList();
            break;
        default:
            console.log(`Unrecognized message category: ${message.category}`)
            break;
    }
}

function reloadFromAutotracker() {
    if (autotrackerSocket != null && autotrackerSocket.readyState == 1) {
        console.log('Sent request to send full autotracker inventory');
        autotrackerSocket.send("sendFull");
    }
}

function autotrackerConnected(event) {
    console.log("Connected to autotracker");
    reloadFromAutotracker();
}