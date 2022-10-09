function saveSettingsToStorage(args, localSettings) {
    localStorage.setItem('args', JSON.stringify(args));
    localStorage.setItem('settings', JSON.stringify(localSettings));
}

function getInputValues(dataAttrName, values) {
    for (const input of document.querySelectorAll(`[data-${dataAttrName}]`)) {
        let name = input.dataset[dataAttrName];
        let value = input.value;

        if (input.type == 'checkbox') {
            value = input.checked;
        }

        values[name] = value;
    }

    return values;
}

function setInputValues(dataAttrName, values) {
    for (const input of document.querySelectorAll(`[data-${dataAttrName}]`)) {
        let name = input.dataset[dataAttrName];

        if (name in values) {
            if (input.type == 'checkbox') {
                input.checked = values[name];
            }
            else {
                input.value = values[name];
            }
        }
    }
}

function saveSettings() {
    args = getInputValues('flag', args);
    localSettings = getInputValues('setting', localSettings);

    resetUndoRedo()

    fixArgs(args);
    saveSettingsToStorage(args, localSettings);

    applySettings();

    skipNextAnimation = true;

    refreshItems();
}

function loadSettings() {
    try {
        args = JSON.parse(localStorage.getItem('args'));
    }
    catch (err) {
    }

    try {
        localSettings = JSON.parse(localStorage.getItem('settings'));
    }
    catch (err) {
    }

    try {
        if (!('logic' in args)) {
            args = defaultArgs;
        }
    }
    catch (err) {
        args = defaultArgs;
    }

    try {
        if (!('checkSize' in localSettings)) {
            localSettings = defaultSettings;
        }
    }
    catch (err) {
        localSettings = defaultSettings;
    }

    for (let setting in defaultSettings) {
        if (!(setting in localSettings)) {
            localSettings[setting] = defaultSettings[setting];
        }
    }

    fixArgs(args);

    setInputValues('flag', args);
    setInputValues('setting', localSettings);

    applySettings();

    refreshItems();
}

function applySettings() {
    let children = $('#firstRow').children()
    let firstElement = $(children)[0].id;
    
    if (localSettings.swapItemsAndMap && firstElement == 'mapContainer'
        || !localSettings.swapItemsAndMap && firstElement != 'mapContainer') {
            $(children[1]).insertBefore($(children[0]));
    }

    $('.map').css('filter', `brightness(${localSettings.mapBrightness}%)`);

    if (!args.rooster) {
        inventory['ROOSTER'] = 0;
        saveInventory();
    }

    tradeEntrances = ['writes_house', 'banana_seller', 'animal_house5', 'animal_house3'];
    for (const entrance of tradeEntrances) {
        entranceDict[entrance].type = args.tradequest ? 'single' : 'dummy';
    }
}

function fixArgs(args) {
    if (['', 'undefined', 'null', '8'].includes(String(args.goal))) {
        args.goal = 'egg';
    }

    if (args.logic == 'normal') {
        args.logic = '';
    }

    if (args.dungeon_items == 'standard') {
        args.dungeon_items = '';
    }

    if (args.dungeon_items == 'localnightmarekey') {
        args.dungeon_items = 'nightmarekey';
    }

    if (args.owlstatues == 'none') {
        args.owlstatues = '';
    }
}

function exportState() {
    let state = new Object();
    state.inventory = inventory;
    state.settings = localSettings;
    state.args = args;
    state.checkedChecks = checkedChecks;
    state.entranceMap = entranceMap;

    download(`Magpie-state-${(new Date()).toISOString()}.json`, JSON.stringify(state));
}

async function importState() {
    let errorMessage = "The selected file does not appear to be a valid Magpie state file";

    try {
        let data = await getFile();
        let state = JSON.parse(data);

        if ('BOMB' in state.inventory
            && 'checkSize' in state.settings
            && 'logic' in state.args) {
                inventory = state.inventory;
                checkedChecks = state.checkedChecks;
                entranceMap = state.entranceMap;
                saveLocations();
                saveInventory();
                saveSettingsToStorage(state.args, state.settings);
                location.reload();
        }
        else {
            alert(errorMessage);
        }
    }
    catch (ex) {
        if (ex.name != 'AbortError') {
            alert(errorMessage);
        }
    }
}

function setStartLocation(entranceId) {
    pushUndoState();

    if (args.entranceshuffle == 'none') {
        for (const start of startLocations) {
            if (entranceMap[start] == startHouse && start != startHouse) {
                entranceMap[start] = entranceMap[startHouse];
                break;
            }
        }

        entranceMap[entranceId] = startHouse;
        entranceMap[startHouse] = entranceId;
    }
    else {
        for (const start of startLocations) {
            if (entranceMap[start] == startHouse) {
                delete entranceMap[start];
            }
        }

        entranceMap[entranceId] = startHouse;
    }

    saveEntrances();
    closeAllCheckTooltips();
    refreshCheckList();
}

function clearEntranceMapping(entranceId) {
    pushUndoState();

    if (args.entranceshuffle == 'none'
        && entranceMap[entranceId] == startHouse) {
        delete entranceMap[startHouse];
    }

    if (Entrance.isConnected(entranceId)) {
        let conn = Entrance.mappedConnection(entranceId);
        if (conn.entrances.length == 2) {
            delete entranceMap[conn.otherSide(entranceId)];
        }
    }

    Connection.disconnect(entranceId);
    delete entranceMap[entranceId];

    saveEntrances();
    closeAllCheckTooltips();
    refreshCheckList();
}

function mapToLandfill(entranceId) {
    pushUndoState();

    let otherSide = null;
    let connector = Connection.findConnector({ exterior: entranceId });
    let connection = Connection.existingConnection(connector);

    if (connection != null && connection.entrances.length == 2) {
        otherSide = connection.otherSide(entranceId);
    }

    Connection.disconnect(entranceId);

    entranceMap[entranceId] = 'landfill';

    if (otherSide != null) {
        entranceMap[otherSide] = 'landfill';
    }

    saveEntrances();
    closeAllCheckTooltips();
    refreshCheckList();
}

function connectExteriors(from, fromInterior, to, toInterior) {
    pushUndoState();

    let connector = Connection.findConnector({ interior: fromInterior });
    let connection = Connection.existingConnection(connector);
    
    if (connection == null || connector.id == 'outer_rainbow') {
        entranceMap[from] = fromInterior;
        entranceMap[to] = toInterior;
    }
    else {
        if (connection.entrances.includes(from)) {
            entranceMap[to] = toInterior;
        }
        else {
            entranceMap[from] = fromInterior;
        }
    }

    Connection.createConnection([from, to]);

    skipNextAnimation = true;

    saveEntrances();
    closeAllCheckTooltips();
    refreshCheckList();
}

function connectEntrances(from, to) {
    pushUndoState();

    console.assert(to != 'clear');
    // if (to == 'clear') {
    //     delete entranceMap[from];
    // }
    // else {
    entranceMap[from] = to;
    // }

    skipNextAnimation = true;

    saveEntrances();
    closeAllCheckTooltips();
    refreshCheckList();
}

function resetUndoRedo() {
    undoStack = [];
    redoStack = [];
}

function getUndoState() {
    let state = new Object();
    state.checkedChecks = Object.assign({}, checkedChecks);
    state.entranceMap = Object.assign({}, entranceMap);
    state.connections = connections.map(x => x.clone());

    return state;
}

function applyUndoState(state) {
    checkedChecks = state.checkedChecks;
    entranceMap = state.entranceMap;
    connections = state.connections;

    pruneEntranceMap();
    saveLocations();
    refreshCheckList();
}

function pushUndoState() {
    undoStack.push(getUndoState());
    redoStack = [];
}

function undo() {
    if (undoStack.length == 0) {
        return;
    }

    redoStack.push(getUndoState());
    let state = undoStack.pop();
    applyUndoState(state);
}

function redo() {
    if (redoStack.length == 0) {
        return;
    }

    undoStack.push(getUndoState());
    let state = redoStack.pop();
    applyUndoState(state);
}

function keyDown(e) {
    if (e.ctrlKey && e.key == 'z') {
        undo();
    }
    else if ((e.ctrlKey && e.shiftKey && e.key == 'Z')
             || (e.ctrlKey && e.key == 'y')) {
        redo();
    }
    else if (e.key == 'Escape' && graphicalMapSource != null) {
        endGraphicalConnection();
    }
}