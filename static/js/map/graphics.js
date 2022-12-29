function drawActiveTab() {
    drawNodes(getMapNameFromButton($('#mapContainer .tab-button.active button')), true);
}

function getMapNameFromButton(button) {
    return $(button).parent('li').attr('data-mapname')
}

function drawTab(button, clear=false) {
    if (clear) {
        removeNodes();
        closeAllCheckTooltips();
    }

    let mapName = getMapNameFromButton(button);
    $('#mapContainer .tab.active').removeClass('active');
    $('#mapContainer .tab-button.active').removeClass('active');
    $(`#mapContainer .tab-button[data-mapname=${mapName}]`).addClass('active');
    $(`#mapContainer .tab [data-mapname=${mapName}]`).closest('.map-container').addClass('active');

    drawNodes(mapName, false);
}

function drawConnectorLines() {
    $('connection').connections('remove');
}

function getMapScaling(map) {
    let scaling = {};

    scaling.x = Math.min(1, $(map).width() / $(map).find('.map').prop('naturalWidth'));
    scaling.y = Math.min(1, $(map).height() / $(map).find('.map').prop('naturalHeight'));

    scaling.offset = {};

    scaling.offset.x = (16 * scaling.x - localSettings.checkSize) / 2;
    scaling.offset.y = (16 * scaling.y - localSettings.checkSize) / 2;

    return scaling;
}

function drawLocation() {
    if (currentRoom == null || currentRoom.length != 4) {
        $('#linkFace').remove();
        return;
    }

    let map = $('#overworldTabContent');
    let scaling = getMapScaling(map);
    let coords = currentRoom.split('0x')[1];
    let roomX = Number('0x' + coords[1]) * 160;
    let roomY = Number('0x' + coords[0]) * 128;

    // Why these magic numbers? Trial and error!
    let mapX = roomX + 94;
    let mapY = roomY + 70;

    let linkFace = $('#linkFace');

    if (linkFace.length == 0) {
        linkFace = $('<img>', {
            'id': 'linkFace',
            'src': 'static/images/linkface.png',
            'draggable': false,
        });

        map.append(linkFace);
    }

    linkFace.css({
                'top': Math.round(mapY * scaling.y + scaling.offset.y),
                'left': Math.round(mapX * scaling.x + scaling.offset.x),
                'width': localSettings.checkSize,
                'max-width': localSettings.checkSize,
                'min-width': localSettings.checkSize,
                'height': localSettings.checkSize,
                'max-height': localSettings.checkSize,
                'min-height': localSettings.checkSize,
            });
}