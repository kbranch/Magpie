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

function loadLogContents(logText) {
    log = JSON.parse(logText);

    if (!log.seed) {
        return;
    }

    spoilerLog = log;

    items = [...log.accessibleItems].concat(log.inaccessibleItems);

    itemsByLocation = items.reduce((dict, x) => {
        dict[x.id] = x.itemName;
        return dict;
    });

    $('#spoilerSeed').html(`Loaded seed: ${log.seed}`);
    $('#spoilAllButton').show();
}

function spoilAll() {
    pushUndoState();

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

    if (Entrance.isConnector(entranceId)) {
        connectOneEndConnector(entranceId, spoilerLog.entrances[entranceId], housekeeping);
    }
    else {
        entranceMap[entranceId] = spoilerLog.entrances[entranceId];

        saveEntrances();

        if (housekeeping) {
            closeAllCheckTooltips();
            refreshCheckList();
        }
    }

    updateReverseMap();
}