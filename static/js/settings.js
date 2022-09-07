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

    fixGoal(args);
    saveSettingsToStorage(args, localSettings);

    applySettings();

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

    fixGoal(args);

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
}

function fixGoal(args) {
    if (['', 'undefined', 'null', '8'].includes(String(args.goal))) {
        args.goal = 'egg';
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
    const startHouse = 'start_house';

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
    if (args.entranceshuffle == 'none'
        && entranceMap[entranceId] == 'start_house') {
        delete entranceMap['start_house'];
    }

    delete entranceMap[entranceId];

    saveEntrances();
    closeAllCheckTooltips();
    refreshCheckList();
}