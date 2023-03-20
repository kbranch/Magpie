let spoilerLog = null;
let itemsByLocation = {};

function loadLogFile(element) {
    if (element.files.length == 0) {
        return;
    }

    let file = element.files[0];

    if (file.name.endsWith(".json")) {
        getFile(element, loadLogContents);
        return;
    }

    getBinaryFile(element, loadSpoilerLog);
}

function setSpoilerLabel(text) {
    $('#spoilerSeed').html(text);
}

function loadLogContents(logText, loadSettings=true) {
    log = JSON.parse(logText);

    if (log.raceRom) {
        setSpoilerLabel("Can't spoil race ROMs");
        return;
    }

    if (!log.seed) {
        setSpoilerLabel('Invalid spoiler file');
        return;
    }

    spoilerLog = log;

    fillVanillaLogEntrances();

    items = [...log.accessibleItems].concat(log.inaccessibleItems);

    itemsByLocation = {};
    for (const location of items) {
        itemsByLocation[location.id] = location.itemName;
    }

    setSpoilerLabel(`Loaded seed: ${log.seed}`);
    $('#spoilAllButton').show();

    if ('shortSettings' in spoilerLog && loadSettings) {
        $("#shortString")[0].value = spoilerLog.shortSettings;
        loadShortString(true);
    }
}

function fillVanillaLogEntrances() {
    if (!spoilerLog) {
        return;
    }

    missingEntrances = randomizedEntrances.filter(x => !(x in spoilerLog.entrances));
    for (const entrance of missingEntrances) {
        spoilerLog.entrances[entrance] = entrance;
    }
}

function spoilAll() {
    pushUndoState();

    // Everything gets confused if we try to connect entrances that are already connected
    resetEntrances();

    for (const checkId in coordDict) {
        if (checkId in itemsByLocation) {
            spoilLocation(checkId, housekeeping=false);
        }
    }

    for (entranceId in spoilerLog.entrances) {
        spoilEntrance(entranceId, housekeeping=false);
    }

    drawActiveTab();
    refreshCheckList();
}

function spoilLocation(checkId, housekeeping=true) {
    setCheckContents(checkId, itemsByLocation[checkId], housekeeping);
}

function spoilEntrance(entranceId, housekeeping=true) {
    if (!(entranceId in spoilerLog.entrances)) {
        return;
    }

    clearEntranceMapping(entranceId, false);

    if (Entrance.isConnector(spoilerLog.entrances[entranceId])) {
        connectOneEndConnector(entranceId, spoilerLog.entrances[entranceId], housekeeping);
    }
    else {
        entranceMap[entranceId] = spoilerLog.entrances[entranceId];

        saveEntrances();

        if (housekeeping) {
            closeAllTooltips();
            refreshCheckList();
        }
    }

    updateReverseMap();
}