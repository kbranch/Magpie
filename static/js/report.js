"use strict"

function sendSuggestion() {
    $.ajax({
        type: "POST",
        url: "https://magpietracker.us/suggestion",
        data: {
            email: $('#suggestionEmail')[0].value,
            body: $('#bodyTextArea').summernote('code'),
            state: JSON.stringify(getState()),
        },
    });
}

function sendError() {
    let payload = JSON.parse($('#errorModalPayload').text());
    payload['userComments'] = $('#errorTextArea').summernote('code');

    $.ajax({
        type: "POST",
        url: "https://magpietracker.us/suggestion",
        data: {
            email: $('#errorEmail')[0].value,
            body: '<pre>' + JSON.stringify(payload, null, 3) + '</pre>',
            state: JSON.stringify(getState()),
        },
    });
}

function showErrorDialog(message, payload) {
    $('#errorModalMessage').text(message);
    $('#errorModalPayload').text(payload);
    new bootstrap.Modal('#errorModal', null).show();
}