function saveCheckContents() {
    localStorage.setItem('checkContents', JSON.stringify(checkContents));
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