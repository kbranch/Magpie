"use strict"

function saveSettingsToStorage(args, localSettings) {
    if (argsAreValid(args)) {
        setLocalStorage('args', JSON.stringify(args));
    }

    if (settingsAreValid(localSettings)) {
        setLocalStorage('settings', JSON.stringify(localSettings));
    }
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

function saveQuickSettings() {
    quickSettingsToSettings();
    localSettings = getInputValues('setting', localSettings);
    saveSettingsToStorage(args, localSettings);
    applySettings();
    skipNextAnimation = true;
    drawActiveTab();
    setTimeout(refreshTextChecks, 20);
}

function quickSettingsToSettings() {
    $('#mainEnableAutotracking').prop('checked', $('#enableAutotracking').prop('checked'));
    $('#showOutOfLogic').prop('checked', $('#showOutOfLogicQuick').prop('checked'));
    $('#showHigherLogic').prop('checked', $('#showHigherLogicQuick').prop('checked'));
    $('#showChecked').prop('checked', $('#showCheckedQuick').prop('checked'));
    $('#showVanilla').prop('checked', $('#showVanillaQuick').prop('checked'));
    $('#showOwned').prop('checked', $('#showOwnedQuick').prop('checked'));
    $('#showVanillaEntrances').prop('checked', $('#showVanillaEntrancesQuick').prop('checked'));
    $('#showLogicHints').prop('checked', $('#showLogicHintsQuick').prop('checked'));
}

function settingsToQuickSettings() {
    $('#enableAutotracking').prop('checked', $('#mainEnableAutotracking').prop('checked'));
    $('#showOutOfLogicQuick').prop('checked', $('#showOutOfLogic').prop('checked'));
    $('#showHigherLogicQuick').prop('checked', $('#showHigherLogic').prop('checked'));
    $('#showCheckedQuick').prop('checked', $('#showChecked').prop('checked'));
    $('#showVanillaQuick').prop('checked', $('#showVanilla').prop('checked'));
    $('#showOwnedQuick').prop('checked', $('#showOwned').prop('checked'));
    $('#showVanillaEntrancesQuick').prop('checked', $('#showVanillaEntrances').prop('checked'));
    $('#showLogicHintsQuick').prop('checked', $('#showLogicHints').prop('checked'));
}

function saveSettings() {
    if (skipApplySettings) {
        skipApplySettings = false;
        return;
    }

    settingsToQuickSettings();

    let oldArgs = structuredClone(args);
    args = getInputValues('flag', args);
    localSettings = getInputValues('setting', localSettings);

    resetUndoRedo()

    fixArgs(args);
    saveSettingsToStorage(args, localSettings);

    applySettings(oldArgs);

    skipNextAnimation = true;

    refreshItems();
}

function argsAreValid(tempArgs) {
    return tempArgs != null && typeof tempArgs != 'undefined' && 'logic' in tempArgs;
}

function settingsAreValid(tempSettings) {
    return tempSettings != null && typeof tempSettings != 'undefined' && 'checkSize' in tempSettings;
}

function loadSettings() {
    let errors = [];

    try {
        args = JSON.parse(getLocalStorage('args'));
    }
    catch (err) {
        errors.push(err);
    }

    try {
        localSettings = JSON.parse(getLocalStorage('settings'));
    }
    catch (err) {
        errors.push(err);
    }

    try {
        if (!argsAreValid(args)) {
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
        if (!settingsAreValid(localSettings)) {
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

    if (!keepQueryArgs) {
        window.history.replaceState(null, null, window.location.pathname);
    }

    updateSettings();

    saveSettingsToStorage(args, localSettings);

    fixArgs(args);

    setInputValues('flag', args);
    setInputValues('setting', localSettings);

    applySettings();

    refreshItems();

    if (localStorage.getItem("importedUndos")) {
        undoStack = JSON.parse(localStorage.getItem("importedUndos")).reverse();
        undoStack.map(x => {
            try {
                x.checkedChecks = new Set(x.checkedChecks);
            }
            catch {
                x.checkedChecks = new Set();
            }

            let dehydratedConnections = x.connections;
            x.connections = []
            for (const conn of dehydratedConnections) {
                x.connections.push(new Connection(conn.entrances, null, conn.label, conn.vanilla, conn.map));
            }
        });
        localStorage.removeItem("importedUndos");
    }

    if (localStorage.getItem("importedSpoilerLog")) {
        spoilerLog = JSON.parse(localStorage.getItem("importedSpoilerLog"));
        localStorage.removeItem("importedSpoilerLog");
    }
    
    return errors;
}

function updateSettings() {
    if (!("followToUnderworld" in localSettings)) {
        updateInsideEntrances = true;
    }
    if ('ignoreHigherLogic' in localSettings) {
        localSettings.showHigherLogic = !localSettings.ignoreHigherLogic;
        delete localSettings['ignoreHigherLogic'];
    }
    if ('hideChecked' in localSettings) {
        localSettings.showChecked = !localSettings.hideChecked;
        delete localSettings['hideChecked'];
    }
    if ('hideVanilla' in localSettings) {
        localSettings.showVanilla = !localSettings.hideVanilla;
        delete localSettings['hideVanilla'];
    }
    if ('ndiItems' in localSettings) {
        localSettings.broadcastItems = localSettings.ndiItems ? 'ndi' : 'none';
        delete localSettings['ndiItems'];
    }
    if ('ndiMap' in localSettings) {
        localSettings.broadcastMap = localSettings.ndiMap ? 'ndi' : 'none';
        delete localSettings['ndiMap'];
    }
    if (localSettings.followToUnderworld === true) {
        localSettings.followToUnderworld = 'always';
    } else if (localSettings.followToUnderworld === false) {
        localSettings.followToUnderworld = 'never';
    }
}

function fixArgs(args) {
    if (['egg', 'random', '5-8', 'maze'].includes(args.goal)) {
        args.goal = '8';
    }

    if (args.goal == 'open-4') {
        args.goal = '4';
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

    args.nagmessages = false;

    if (args.entranceshuffle == 'none' && !args.randomstartlocation) {
        startHouse = 'start_house';
    }
    else {
        startHouse = 'start_house:inside';
    }
}

function getState(addAp=true) {
    let state = new Object();
    state.inventory = inventory;
    state.settings = localSettings;
    state.args = args;
    state.checkedChecks = [...checkedChecks];
    state.entranceMap = entranceMap;
    state.connections = connections;
    state.checkContents = checkContents;
    state.errorLog = errorLog;
    state.version = document.querySelector('.version span')?.innerHTML.replace('Version: ', '');

    if (!addAp) {
        delete state.settings.apServer;
        delete state.settings.apSlot;
        delete state.settings.apPassword;
    }

    return state;
}

function openExportStateDialog() {
    document.getElementById('exportFilename').value = localSettings.exportFilename;
    document.getElementById('exportAddTime').checked = localSettings.exportTimestamp;
    document.getElementById('exportAddAp').checked = localSettings.exportAp;

    new bootstrap.Modal('#exportModal', null).show();
}

function exportState(filename, addTime, addAp) {
    localSettings.exportFilename = filename;
    localSettings.exportAp = addAp;
    localSettings.exportTimestamp = addTime;

    saveSettingsToStorage(args, localSettings);

    let state = getState(addAp);

    if (addTime) {
        filename += `-${(new Date()).toISOString()}`;
    }

    filename += '.json';

    download(filename, JSON.stringify(state));
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
                updateState();
                saveCheckContents();
                saveLocations();
                saveInventory();
                saveSettingsToStorage(state.args, state.settings);

                if ('undos' in state) {
                    setLocalStorage('importedUndos', JSON.stringify(state.undos));
                }

                if ('spoilerLog' in state) {
                    setLocalStorage('importedSpoilerLog', JSON.stringify(state.spoilerLog));
                }

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

var skipApplySettings = false;
function importLogicDiff(data) {
    let errorMessage = "The selected file does not appear to be a valid logic diff file";

    try {
        let diff = JSON.parse(data);

        if ('items' in diff
            && 'common' in diff) {
                for (const item in inventory) {
                    if (item in diff.items) {
                        inventory[item] = diff.items[item];
                    }
                    else {
                        inventory[item] = 0;
                    }
                }

                for (const check of checkAccessibility) {
                    if (diff.new.includes(check.id)) {
                        check.difficulty = 0;
                    }
                    else if (diff.common.includes(check.id)) {
                        check.difficulty = 1;
                    }
                    else if (diff.old.includes(check.id)) {
                        check.difficulty = 2;
                    }
                    else {
                        check.difficulty = 9;
                    }
                }

                skipApplySettings = true;

                refreshImages();
                drawActiveTab();

                document.getElementById('argsCloseButton').click();
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
        "diff0Alpha": 1,
        "diff0VAlpha": 1,
        "diff1Alpha": 1,
        "diff1VAlpha": 1,
        "diff2Alpha": 1,
        "diff2VAlpha": 1,
        "diff3Alpha": 1,
        "diff3VAlpha": 1,
        "diff8Alpha": 1,
        "diff8VAlpha": 1,
        "diff9Alpha": 1,
        "diff9VAlpha": 1,
        "diffCheckedAlpha": 1,
        "bgColor": "#212529",
        "textColor": "#f8f9fa",
        "highlightColor": "#444444",
    });
}

function vanillaConnectors() {
    return !['split', 'mixed', 'wild', 'chaos', 'insane'].includes(args.entranceshuffle);
}

function connectorsMixed() {
    return ['mixed', 'wild', 'chaos', 'insane'].includes(args.entranceshuffle);
}

function coupledEntrances() {
    return ['none', 'simple', 'split', 'mixed', 'wild'].includes(args.entranceshuffle);
}

function inOutEntrances() {
    return ['none', 'simple', 'split', 'mixed', 'chaos'].includes(args.entranceshuffle);
}

function advancedER() {
    return !inOutEntrances() || !coupledEntrances();
}

function resetSession() {
    resetInventory();
    resetLocations();
    resetCheckContents();
    resetBosses();
    applySettings();

    refreshImages();
    refreshCheckList();
}

function updateState() {
    if (checkedChecks.constructor == Array) {
        checkedChecks = new Set(checkedChecks);
    }
    else {
        let keys = Object.keys(checkedChecks);
        if (keys.length > 0 && keys[0].includes('-')) {
            // We've got an old-style dictionary
            let set = new Set();
            for (const key in checkedChecks) {
                let lastDash = key.indexOf('-');
                let area = key.substring(0, lastDash);
                let name = key.substring(lastDash + 1, key.length);

                Object.keys(coordDict).filter(id => coordDict[id].area == area && coordDict[id].name == name)
                                      .map(id => set.add(id));
            }

            checkedChecks = set;
        }
        else {
            checkedChecks = new Set();
        }

        saveChecked();
    }
}

function setApLogic(value) {
    args.ap_logic = value;
    setInputValues('flag', args);
    saveSettings();
}

function setCustomDungeonItemsVisibility() {
    let e = document.getElementById("arg-dungeon_items");
    let custom = document.getElementById('customDungeonItems');

    if (e.value == 'custom') {
        custom.classList.remove('hidden');
    }
    else {
        custom.classList.add('hidden');

        let small = document.getElementById("arg-shuffle_small");
        let nightmare = document.getElementById("arg-shuffle_nightmare");
        let maps = document.getElementById("arg-shuffle_maps");
        let compasses = document.getElementById("arg-shuffle_compasses");
        let beaks = document.getElementById("arg-shuffle_beaks");

        small.checked = false;
        nightmare.checked = false;
        maps.checked = false;
        compasses.checked = false;
        beaks.checked = false;

        if (['smallkeys', 'keysanity', 'localnightmarekey'].includes(e.value)) {
            small.checked = true;
        }
        if (['nightmarekeys', 'keysanity'].includes(e.value)) {
            nightmare.checked = true;
        }
        if (['localkeys', 'keysanity', 'localnightmarekey'].includes(e.value)) {
            maps.checked = true;
            compasses.checked = true;
            beaks.checked = true;
        }
    }
}