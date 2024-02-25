"use strict"

function processCheckMessage(message) {
    if (!autotrackerFeatures.includes('checks')) {
        console.log("Checks feature disabled, ignoring")
        return;
    }

    let addedItem = false;

    if (!message.diff) {
        console.log('Receiving full autotracker checks');
        resetChecks();
    }

    for (const check of message.checks) {
        let metadata = coordDict[check.id];

        if (check.checked) {
            if (metadata.linkedItem && metadata.linkedItem.endsWith('_CHECKED')) {
                addItem(metadata.linkedItem, 1, false, false, '', false);
                addedItem = true;
            }

            checkedChecks.add(check.id);
        }
        else {
            if (metadata.linkedItem && metadata.linkedItem.endsWith('_CHECKED')) {
                addItem(metadata.linkedItem, -1, false, false, '', false);
                addedItem = true;
            }

            checkedChecks.delete(check.id);
        }
    }

    saveChecked();
    updateDungeonItems();

    if (message.refresh) {
        drawActiveTab();
        refreshTextChecks();

        if (addedItem) {
            refreshCheckList();
        }
    }
}

function processItemMessage(message) {
    if (!autotrackerFeatures.includes('items')) {
        console.log("Items feature disabled, ignoring")
        return;
    }

    if (!message.diff) {
        console.log('Receiving full autotracker inventory');
        resetInventory();
    }

    for (const item of message.items) {
        addItem(item.id, item.qty, false, false);
    }

    if (message.refresh) {
        refreshCheckList();
    }
}

function processEntranceMessage(message) {
    if (!autotrackerFeatures.includes('entrances')) {
        console.log("Entrances feature disabled, ignoring")
        return;
    }

    if (!message.diff) {
        console.log('Receiving full autotracker entrances');
        // resetEntrances();
    }

    pushUndoState();

    for (const from in message.entranceMap) {
        if (from in entranceMap) {
            continue;
        }

        let outdoor = from;
        let indoor = message.entranceMap[outdoor];

        if (coupledEntrances() && inOutEntrances()) {
            if (Entrance.isInside(outdoor)) {
                outdoor = indoor;
                indoor = from;
            }
        }

        if (coupledEntrances() && inOutEntrances() && Entrance.isConnector(indoor)) {
            connectOneEndConnector(outdoor, indoor, false);
            updateReverseMap();
        }
        else {
            connectEntrances(outdoor, indoor, false);
            updateReverseMap();
            if (!coupledEntrances() || !inOutEntrances()) {
                Connection.advancedErConnection([outdoor, indoor], 'overworld');
            }
        }
    }

    if (message.refresh) {
        refreshCheckList();
    }
}

var lastValidMap = null;
function processLocationMessage(message) {
    if (!autotrackerFeatures.includes('gps')) {
        console.log("GPS feature disabled, ignoring")
        return;
    }

    let room = message.room;
    let newMap = mapFromRoom(room);

    if (newMap != lastValidMap
        && newMap != null
        && localSettings.followMap
        && (newMap != 'underworld'
            || localSettings.followToUnderworld == 'always'
            || (localSettings.followToUnderworld == 'advanced'
                && advancedER()))) {
        openTab(newMap);
    }

    if (!message.drawFine) {
        message.x = 4.5;
        message.y = 3.625;
    }

    if (newMap == 'overworld') {
        overworldRoom = room;
        overworldX = message.x;
        overworldY = message.y;
    }

    currentRoom = room;
    currentX = message.x;
    currentY = message.y;

    if (newMap != null) {
        lastValidMap = newMap;
    }

    drawLocation();
}

function processHandshAckMessage(message) {
    const breakingVersions = [
        ["Unknown", "1.3"],
    ];
    
    let remoteVersion = 'Unknown';
    let remoteName = 'Unknown';

    if ('version' in message) {
        remoteVersion = message.version;
    }

    if ('name' in message) {
        remoteName = message.name;
    }

    addAutotrackerMessage(`Local v${protocolVersion}, remote v${remoteVersion} name: ${remoteName}`);

    if (remoteVersion != protocolVersion) {
        if (breakingVersions.some(x => x[0] == remoteName && versionIsOlder(x[1], remoteVersion))) {
            alertModal('Old Autotracker', `The connected autotracker is using protocol version ${remoteVersion}, which may not work correctly with the current version (${protocolVersion})<br><br>Consider updating if you encounter problems`);
        }

        addAutotrackerMessage('Consider updating');
    }

    loadFromAutotracker();
    console.log('Sent request to send full autotracker inventory');
}

function connectToAutotracker() {
    if (!localSettings.enableAutotracking || typeof maxInventory == 'undefined' || typeof randomizedEntrances == 'undefined') {
        return;
    }

    if (autotrackerSocket == null || autotrackerSocket.readyState == 3) {
        addAutotrackerMessage('Connecting...');
        const defaultAddress = '127.0.0.1';
        let address = localSettings.autotrackerAddress ? localSettings.autotrackerAddress : defaultAddress;

        autotrackerSocket = new WebSocket(`ws://${address}:17026/`);

        autotrackerSocket.onopen = autotrackerConnected;
        autotrackerSocket.onmessage = (event) => processMessage(event.data);
        autotrackerSocket.onerror = (event) => console.log(event);
        autotrackerSocket.onclose = (event) => {
            if (localSettings.enableAutotracking) {
                addAutotrackerMessage('Disconnected');
            }

            currentRoom = null;
            currentX = null;
            currentY = null;

            drawLocation();

            console.log(event);
        };
    }
}

function autotrackerIsConnected() {
    return autotrackerSocket?.readyState == 1;
}

function addAutotrackerMessage(status) {
    // I cannot believe the state of vanilla javascript date formatting
    let now = new Date();
    let hours = now.getHours().toString(10).padStart(2, '0');
    let minutes = now.getMinutes().toString(10).padStart(2, '0');
    let seconds = now.getSeconds().toString(10).padStart(2, '0');
    let textArea = $('#autotrackerMessages');
    textArea.append(`\n${hours}:${minutes}:${seconds}: ` + status);
    textArea.scrollTop(textArea[0].scrollHeight);

    if (status != 'ROM Requested') {
        $('#romRow').removeClass('animate__flash');
    }
}

function processMessage(messageText) {
    let message;

    messageLog.push({time: Date.now(), message: messageText});
    if (messageLog.length > maxMessageLogSize) {
        messageLog.splice(0, 1);
    }

    if (settingsPending) {
        messageQueue.push(messageText);
        return;
    }

    try {
        message = JSON.parse(messageText);
        console.log(`Received a '${message.type}' message`);
    }
    catch(err) {
        console.log(`Invalid message JSON: ${err}`);
        console.log(messageText);
        return;
    }
    
    try {
        switch (message.type) {
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
            case 'location':
                processLocationMessage(message);
                break;
            case 'romAck':
                romRequested = false;
                $('#romRow').hide();

                addAutotrackerMessage('ROM Received');

                break;
            case 'romRequest':
                romRequested = true;
                console.log('Autotracker requested a copy of the ROM');

                $('#romInput')[0].value = null;
                $('#romRow').show();
                $('#romRow').removeClass('hidden');
                $('#romRow').addClass('animate__animated')
                $('#romRow').addClass('animate__flash')
                quickSettingsTab($('#autotrackerTab'))

                addAutotrackerMessage('ROM Requested');

                break;
            case 'settings':
                if (autotrackerFeatures.includes('settings')) {
                    $("#shortString")[0].value = message.settings;
                    settingsPending = true;
                    loadShortString(true);
                }
                else {
                    console.log("Settings feature disabled, ignoring")
                }
                break;
            case 'spoiler':
                if (autotrackerFeatures.includes('spoilers')) {
                    loadLogContents(message.log, false);
                }
                else {
                    console.log("Spoilers feature disabled, ignoring")
                }
                break;
            case 'gfx':
                setGraphicsPack(message.gfx);
                break;
            case 'handshAck':
                processHandshAckMessage(message);
                break;
            default:
                console.log(`Unrecognized message type: ${message.type}`)
                break;
        }
    }
    catch (err) {
        addAutotrackerMessage('Error, see console');
        console.log(`Message text: ${messageText}`);
        console.log(err);
    }
}

function setGraphicsPack(gfx) {
    if (!autotrackerFeatures.includes('gfx')) {
        console.log("GFX feature disabled, ignoring")
        return;
    }

    localSettings.graphicsPack = '/' + gfx;
    setInputValues('setting', localSettings);
    saveSettingsToStorage();
    // refreshItems();
    refreshImages();
    drawActiveTab();
}

function loadRom(element) {
    if (element.files.length == 0) {
        return;
    }

    let file = element.files[0];
    let reader = new FileReader();

    reader.onload = () => sendRom(reader.result);
    reader.readAsBinaryString(file);
}

function sendRom(bytes) {
    sendMessage({
        'type': 'rom',
        'rom': btoa(bytes),
    });
}

function sendHandshake() {
    sendMessage({
        'type': 'handshake',
        'version': protocolVersion,
        'features': autotrackerFeatures,
        'flags': args,
        'name': 'magpie',
    });
}

function loadFromAutotracker() {
    sendMessage({
        'type': 'sendFull',
    });
}

function sendMessage(message) {
    if (autotrackerSocket != null && autotrackerSocket.readyState == 1) {
        let messageText = JSON.stringify(message);
        autotrackerSocket.send(messageText);
    }
}

function autotrackerConnected(event) {
    console.log("Connected to autotracker");
    addAutotrackerMessage('Connected');
    sendHandshake();
}