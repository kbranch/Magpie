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

    for (const input of document.querySelectorAll(`#quicksettings [data-${dataAttrName}]`)) {
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

function saveQuickSettings() {
    $('#mainEnableAutotracking').prop('checked', $('#enableAutotracking').prop('checked'));
    localSettings = getInputValues('setting', localSettings);
    saveSettingsToStorage(args, localSettings);
    applySettings();
    skipNextAnimation = true;
    drawActiveTab();
}

function enableAutotrackerChanged() {
    $('#enableAutotracking').prop('checked', $('#mainEnableAutotracking').prop('checked'));
    saveQuickSettings();
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
    let errors = [];

    try {
        args = JSON.parse(localStorage.getItem('args'));
    }
    catch (err) {
        errors.push(err);
    }

    try {
        localSettings = JSON.parse(localStorage.getItem('settings'));
    }
    catch (err) {
        errors.push(err);
    }

    try {
        if (!('logic' in args)) {
            args = defaultArgs;
        }
    }
    catch (err) {
        if (args != null) {
            errors.push(err);
        }

        args = defaultArgs;
    }

    try {
        if (!('checkSize' in localSettings)) {
            localSettings = defaultSettings;
        }
    }
    catch (err) {
        if (localSettings != null) {
            errors.push(err);
        }

        localSettings = defaultSettings;
    }

    for (let setting in defaultSettings) {
        if (!(setting in localSettings)) {
            localSettings[setting] = defaultSettings[setting];
        }
    }

    if (Object.keys(settingsOverrides).length > 0) {
        for (let key in settingsOverrides) {
            let value = settingsOverrides[key];

            switch (value) {
                case 'true':
                    value = true;
                    break;
                case 'false':
                    value = false;
                    break;
                case 'null':
                    value = null;
                    break;
            }

            localSettings[key] = value;
        }

        settingsOverrides = {};
    }

    if (Object.keys(argsOverrides).length > 0) {
        for (let key in argsOverrides) {
            let value = argsOverrides[key];

            switch (value) {
                case 'true':
                    value = true;
                    break;
                case 'false':
                    value = false;
                    break;
                case 'null':
                    value = null;
                    break;
            }

            args[key] = value;
        }

        argsOverrides = {};
    }

    window.history.replaceState(null, null, window.location.pathname);

    saveSettingsToStorage(args, localSettings);

    fixArgs(args);

    setInputValues('flag', args);
    setInputValues('setting', localSettings);

    applySettings();

    refreshItems();
    
    return errors;
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

function getState() {
    let state = new Object();
    state.inventory = inventory;
    state.settings = localSettings;
    state.args = args;
    state.checkedChecks = checkedChecks;
    state.entranceMap = entranceMap;
    state.connections = connections;
    state.checkContents = checkContents;

    return state;
}

function exportState() {
    let state = getState();
    download(`Magpie-state-${(new Date()).toISOString()}.json`, JSON.stringify(state));
}

function importState(data) {
    let errorMessage = "The selected file does not appear to be a valid Magpie state file";

    try {
        let state = JSON.parse(data);

        if ('BOMB' in state.inventory
            && 'checkSize' in state.settings
            && 'logic' in state.args) {
                inventory = state.inventory;
                checkedChecks = state.checkedChecks;
                entranceMap = state.entranceMap;
                connections = state.connections;
                checkContents = state.checkContents;
                saveCheckContents();
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

function pickCustomItemsPath(data) {
    localSettings.customItems = data;
    localSettings.itemsTemplate = "custom";
    saveSettings();
    applySettings();
}

function pickCustomDungeonItemsPath(data) {
    localSettings.customDungeonItems = data;
    localSettings.dungeonItemsTemplate = "custom";
    saveSettings();
    applySettings();
}

function resetColors() {
    setInputValues('setting', {
        "diff0Color": "#0066ff",
        "diff0VColor": "#ffffff",
        "diff1Color": "#ffff00",
        "diff1VColor": "#ffffff",
        "diff2Color": "#ff8800",
        "diff2VColor": "#ffffff",
        "diff3Color": "#ff0000",
        "diff3VColor": "#ffffff",
        "diff8Color": "#0066ff",
        "diff8VColor": "#ffffff",
        "diff9Color": "#444444",
        "diff9VColor": "#aaaaaa",
        "diffCheckedColor": "#00ff00",
        'bgColor': "#212529",
        'textColor': "#f8f9fa",
    });
}