"use strict"

function drawActiveTab(updateNdi=true) {
    if (!allowMap) {
        return;
    }

    drawNodes(getActiveMap(), true, updateNdi);
}

function getActiveMap() {
    return getMapNameFromButton($('#mapContainer .tab-button.active button'));
}

function underworldActive() {
    return getActiveMap() == 'underworld';
}

function getMapNameFromButton(button) {
    return $(button).parent('li').attr('data-mapname')
}

function getButtonFromMapName(map) {
    return $(`li[data-mapname=${map}] button`)[0];
}

function pickingEntrances() {
    return graphicalMapSource != null;
}

function drawConnectorLines() {
    $('connection').connections('remove');
}

function getMapScaling(map, offsetCheckSize=true) {
    let scaling = {};
    let img = $(map).find('.map')[0];
    let elementAspect = img.width / img.height;
    let nativeAspect = img.naturalWidth / img.naturalHeight;
    let w = img.width;
    let h = img.height;
    let x = 0;
    let y = 0;

    if (elementAspect - nativeAspect < 0) {
        let imgH = w / nativeAspect;

        y = (h - imgH) / 2;
        h = imgH;
    }
    else {
        let imgW = h * nativeAspect;

        x = (w - imgW) / 2;
        w = imgW;
    }

    scaling.x = w / img.naturalWidth;
    scaling.y = h / img.naturalHeight;

    scaling.offset = {};

    let checkOffset = offsetCheckSize ? checkSize : 0;
    scaling.offset.x = (16 * scaling.x - checkOffset) / 2 + x;
    scaling.offset.y = (16 * scaling.y - checkOffset) / 2 + y;

    return scaling;
}

