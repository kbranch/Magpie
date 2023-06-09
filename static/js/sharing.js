"use strict"

function shareState() {
    liveUpdate = document.getElementById('liveUpdate').checked;
    localSettings.playerName = document.getElementById('playerName').value;
    localSettings.eventName = document.getElementById('eventName').value;

    saveSettingsToStorage(args, localSettings);

    sendState();
}

function sendState() {
    if (!localSettings.playerName) {
        return;
    }

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

    setElementHidden(document.getElementById('playerIdWarning'), true);

    updateShareUrls();
}

function checkPlayerId() {
    $.ajax({
        type: "POST",
        url: "/playerId",
        data: {
            'playerName': document.getElementById('playerName').value
        },
        success: (response) => {
            setElementHidden(document.getElementById('playerIdWarning'),
                             response == 'None' || response == localSettings.playerId);
        }
    });

    playerIdTimeout = null;
}

var playerIdTimeout = null;
function updateShareUrls() {
    let playerUrl = document.getElementById('playerUrl');
    let eventUrl = document.getElementById('eventUrl');
    let playerName = document.getElementById('playerName').value;
    let eventName = document.getElementById('eventName').value;

    playerUrl.href = `/player?playerName=${playerName}`;
    playerUrl.innerHTML = playerUrl.href;
    eventUrl.href = `/event?eventName=${eventName}`;
    eventUrl.innerHTML = eventUrl.href;

    setElementHidden(document.getElementById('playerLink'), !playerName);
    setElementHidden(document.getElementById('eventLink'), !eventName);

    if (playerIdTimeout) {
        clearTimeout(playerIdTimeout);
    }

    playerIdTimeout = setTimeout(checkPlayerId, 250);
}