"use strict"

function resetUndoRedo() {
    undoStack = [];
    redoStack = [];
}

function getUndoState() {
    let state = new Object();
    state.checkedChecks = new Set(checkedChecks);
    state.entranceMap = Object.assign({}, entranceMap);
    state.entranceBackup = Object.assign({}, entranceBackup);
    state.connections = connections.map(x => x.clone());
    state.checkContents = Object.assign({}, checkContents);

    return state;
}

function applyUndoState(state) {
    checkedChecks = state.checkedChecks;
    copyToEntranceMap(state.entranceMap);
    connections.length = 0;
    state.connections?.map(x => connections.push(x));
    entranceBackup = state.entranceBackup;
    checkContents = state.checkContents;

    pruneEntranceMap();
    saveLocations();
    saveCheckContents();
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