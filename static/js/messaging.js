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

    pushUndoState();

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
        addAutotrackerMessage('Connecting...');
        autotrackerSocket = new WebSocket("ws://127.0.0.1:17026/");

        autotrackerSocket.onopen = autotrackerConnected;
        autotrackerSocket.onmessage = (event) => processMessage(event.data);
        autotrackerSocket.onerror = (event) => console.log(event);
        autotrackerSocket.onclose = (event) => {
            if (localSettings.enableAutotracking) {
                addAutotrackerMessage('Disconnected');
            }

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
            loadLogContents(message.log);
            break;
        default:
            console.log(`Unrecognized message category: ${message.category}`)
            break;
    }
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
    let message = {}
    message.type = 'rom';
    message.rom = btoa(bytes);
    messageText = JSON.stringify(message);

    autotrackerSocket.send(messageText);
}

function reloadFromAutotracker() {
    if (autotrackerSocket != null && autotrackerSocket.readyState == 1) {
        console.log('Sent request to send full autotracker inventory');
        autotrackerSocket.send(JSON.stringify({ type: 'handshake', features: autotrackerFeatures }));
    }
}

function autotrackerConnected(event) {
    console.log("Connected to autotracker");
    addAutotrackerMessage('Connected');
    reloadFromAutotracker();
}