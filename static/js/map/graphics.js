function drawActiveTab() {
    drawNodes(getMapNameFromButton($('.tab-button.active button')), true);
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
    $('.tab.active').removeClass('active');
    $('.tab-button.active').removeClass('active');
    $(`.tab-button[data-mapname=${mapName}]`).addClass('active');
    $(`.tab [data-mapname=${mapName}]`).closest('.map-container').addClass('active');

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