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

function getLocationCoords(room, x, y) {
    let roomMap = mapFromRoom(room);

    let roomX;
    let roomY;
    
    if (roomMap == 'overworld') {
        let coords = room.split('0x')[1];
        let xCoord = Number('0x' + coords[1]);
        let yCoord = Number('0x' + coords[0]);

        if (args.overworld == 'dungeondive') {
            yCoord -= 6;
            xCoord -= 1;
        }

        roomX = xCoord * 162 + x * 16;// + 72;
        roomY = yCoord * 130 + y * 16;// + 58;

        if (xCoord < 0 || yCoord < 0) {
            roomX = 0;
            roomY = 0;
        }
    }
    else {
        if (!(room in roomDict)) {
            return { x: 0, y: 0, map: 'unknown' };
        }

        let roomInfo = roomDict[room];
        roomX = roomInfo.x * 160 + x * 16;// + 72;
        roomY = roomInfo.y * 128 + y * 16;// + 58;

        if (roomMap == 'underworld') {
            roomX += 2 + roomInfo.x * 2;
            roomY += 2 + roomInfo.y * 2;
        }
    }

    return { x: roomX, y: roomY, map: roomMap };
}

function drawLocation() {
    let roomMap = mapFromRoom(currentRoom);
    let activeMap = getActiveMap();

    vueApp.updateLinkFace(localSettings.linkFace && (!allowAutotracking || localSettings.enableAutotracking));

    if ((roomMap != activeMap
         && (activeMap != 'overworld'
             || overworldRoom == null))
        || !localSettings.linkFace
        || (allowAutotracking && !localSettings.enableAutotracking)) {

        $('#linkFace').remove();

        return;
    }

    let mapContainer = $(`img[data-mapname=${activeMap}]`).closest('.map-container');
    let scaling = getMapScaling(mapContainer);
    let coords = getLocationCoords(currentRoom, currentX, currentY);

    if (activeMap == 'overworld') {
        coords = getLocationCoords(overworldRoom, overworldX, overworldY);
    }

    let linkFace = $('#linkFace');

    if (linkFace.length == 0) {
        linkFace = $('<img>', {
            'id': 'linkFace',
            'draggable': false,
        });

        $(mapContainer).find('div.map-wrapper').append(linkFace);
    }

    linkFace.attr('src', `/images${localSettings.graphicsPack}/linkface.png`);

    linkFace.css({
                'top': Math.round(coords.y * scaling.y + scaling.offset.y),
                'left': Math.round(coords.x * scaling.x + scaling.offset.x),
                'width': checkSize,
                'max-width': checkSize,
                'min-width': checkSize,
                'height': checkSize,
                'max-height': checkSize,
                'min-height': checkSize,
            });
    
    if (broadcastMode == 'send') {
        broadcastLocation();
    }
}