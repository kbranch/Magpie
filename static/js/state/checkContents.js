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

function setCheckContents(checkId, contents) {
    pushUndoState();

    if (contents == '') {
        delete checkContents[checkId];
    }
    else {
        checkContents[checkId] = contents;
    }

    saveCheckContents();
    drawActiveTab();
}