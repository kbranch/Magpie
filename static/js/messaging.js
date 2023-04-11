function processCheckMessage(message) {
    if (!message.diff) {
        console.log('Receiving full autotracker checks');
        resetChecks();
    }

    for (const check of message.checks) {
        let metadata = coordDict[check.id];
        let key = getCheckedKey(metadata.area, metadata.name);

        if (check.checked) {
            checkedChecks[key] = {
                name: metadata.name,
                area: metadata.area,
            };
        }
        else {
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

    if (!message.diff) {
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
    if (!message.diff) {
        console.log('Receiving full autotracker entrances');
        // resetEntrances();
    }

    pushUndoState();

    for (const outdoor in message.entranceMap) {
        if (outdoor in entranceMap) {
            continue;
        }

        let indoor = message.entranceMap[outdoor];

        if (Entrance.isConnector(indoor)) {
            connectOneEndConnector(outdoor, indoor, refresh=false);
            updateReverseMap();
        }
        else {
            connectEntrances(outdoor, indoor, refresh=false);
        }
    }

    if (message.refresh) {
        refreshCheckList();
    }
}

function processLocationMessage(message) {
    let room = message.room;
    let oldMap = mapFromRoom(currentRoom);
    let newMap = mapFromRoom(room);

    if (newMap != oldMap 
        && newMap != null
        && oldMap != null
        && localSettings.followMap) {
        openTab(newMap);
    }

    if (newMap == 'overworld') {
        overworldRoom = room;
    }

    currentRoom = room;
    currentX = message.x;
    currentY = message.y;

    drawLocation();
}

function processHandshAckMessage(message) {
    let remoteVersion = 'Unknown';

    if ('version' in message) {
        remoteVersion = message.version;
    }

    addAutotrackerMessage(`Local v${protocolVersion}, remote v${remoteVersion}`);

    if (remoteVersion != protocolVersion) {
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
                $("#shortString")[0].value = message.settings;
                loadShortString(saveOnLoad=true)
                break;
            case 'spoiler':
                loadLogContents(message.log, false);
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