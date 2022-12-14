function saveCheckContents() {
    localStorage.setItem('checkContents', JSON.stringify(checkContents));
    updateItemLocations();
}

function loadCheckContents() {
    try {
        checkContents = JSON.parse(localStorage.getItem('checkContents'));
    }
    catch (err) {
    }

    if (checkContents == null) {
        checkContents = {};
    }

    updateItemLocations();
}

function updateItemLocations() {
    itemLocations = {};

    for (checkId in checkContents) {
        let item = checkContents[checkId];

        if (!(item in itemLocations)) {
            itemLocations[item] = [];
        }

        itemLocations[item].push(checkId);
    }
}

function resetCheckContents() {
    checkContents = {};

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

    if (housekeeping) {
        drawActiveTab();
    }
}

function getCheckContents(checkId) {
    if (checkId in checkContents) {
        return checkContents[checkId];
    }

    return null;
}