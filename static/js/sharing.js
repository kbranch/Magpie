"use strict"

function shareState() {
    liveUpdate = document.getElementById('liveUpdate').checked;
    localSettings.playerName = document.getElementById('playerName').value;
    localSettings.eventName = document.getElementById('eventName').value;

    saveSettingsToStorage(args, localSettings);

    sendState();
}

function sendState() {
    let state = getState();

    delete state.errorLog;

    $.ajax({
        type: "POST",
        url: "/playerState",
        contentType: "application/json",
        data: JSON.stringify(state),
    });
}

function sharingLiveUpdate() {
    if (liveUpdate) {
        sendState();
    }
}

function prepShareModal() {
    document.getElementById('playerName').value = localSettings.playerName;
    document.getElementById('eventName').value = localSettings.eventName;

    updateShareUrls();
}

function updateShareUrls() {
    document.getElementById('playerUrl').href = `/player?playerName=${document.getElementById('playerName').value}`;
    document.getElementById('eventUrl').href = `/event?eventName=${document.getElementById('eventName').value}`;
}