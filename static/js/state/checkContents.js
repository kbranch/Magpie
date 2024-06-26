"use strict"

function saveCheckContents() {
    setLocalStorage('checkContents', JSON.stringify(checkContents));
    updateItemLocations();
}

function loadCheckContents() {
    let errors = [];

    try {
        checkContents = JSON.parse(getLocalStorage('checkContents'));
    }
    catch (err) {
        errors.push(err);
    }

    if (checkContents == null) {
        checkContents = {};
    }

    updateItemLocations();

    return errors
}

function updateItemLocations() {
    itemLocations = {};

    for (const checkId in checkContents) {
        let item = checkContents[checkId];

        if (!(item in itemLocations)) {
            itemLocations[item] = [];
        }

        itemLocations[item].push(checkId);
    }
}

function resetCheckContents() {
    for (const checkId in checkContents) {
        if (!coordDict[checkId].vanillaItem) {
            delete checkContents[checkId];
        }
    }

    for (const checkId in checksById) {
        if (!(checkId in checkContents)) {
            checksById[checkId].item = null;
        }
    }

    saveCheckContents();
}

function setCheckContents(checkId, contents, housekeeping=true) {
    if (housekeeping) {
        pushUndoState();
    }

    if (contents == '') {
        delete checkContents[checkId];
    }
    else {
        checkContents[checkId] = contents;
    }

    saveCheckContents();

    if (checksById[checkId]) {
        checksById[checkId].item = contents;
    }

    if (housekeeping) {
        drawActiveTab();
        setTimeout(refreshTextChecks, 20);
    }
}

function getCheckContents(checkId) {
    if (checkId in checkContents) {
        return checkContents[checkId];
    }

    return null;
}