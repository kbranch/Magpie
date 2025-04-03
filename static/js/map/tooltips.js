"use strict"

function closeOtherTooltips(element) {
    let id = $(element).attr('data-node-id');
    let secondaries = $('.helper');

    $(secondaries).tooltip('hide');

    Object.values(nodes).map(x => {
        if (x.id != id) {
            x.pinned = false;
        }
    });
}

function closeAllCheckTooltips(stopEntrances=true) {
    let secondaries = $('.helper');

    if (secondaries.length) {
        $(secondaries).tooltip('hide');
    }

    $('connection.connector-line').connections('remove');


    Object.values(nodes).map(x => x.pinned = false);


    if (pickingEntrances() && stopEntrances) {
        endGraphicalConnection();
    }
}

function closeUnpinnedTooltips() {
    let tooltipElements = $('[data-bs-toggle="tooltip"]:not([data-pinned])');
    for (const element of tooltipElements) {
        let tooltip = bootstrap.Tooltip.getInstance(element);
        tooltip?.hide();
    }
}

function closeAllTooltips(stopEntrances=true) {
    closeAllCheckTooltips(stopEntrances);

    // Nuke everything else to be safe
    let tooltipElements = $('[data-bs-toggle="tooltip"]');
    for (const element of tooltipElements) {
        let tooltip = bootstrap.Tooltip.getInstance(element);
        tooltip?.hide();
    }

    // No, really, everything
    $('.tooltip').remove();
}

function getPopperConfig(config) {
    config.onFirstUpdate = scaleTooltip;
    config.modifiers.push({
        name: 'eventListeners',
        options: {
            scroll: false,
            resize: false,
        }
    });

    return config;
}

function scaleTooltip(event) {
    let transform = $(event.elements.popper).css('transform');
    let arrowWidth = $(event.elements.arrow).width();
    let arrowPos = event.modifiersData.arrow.x;
    let yOrigin = event.placement == "top" ? "bottom" : "top";
    let origin = `${arrowPos + arrowWidth / 2}px ${yOrigin}`;

    if (['left', 'right'].includes(event.placement)) {
        let arrowHeight = $(event.elements.arrow).height();
        let arrowPos = event.modifiersData.arrow.y;
        let xOrigin = event.placement == "left" ? "right" : "left";
        origin = `${xOrigin} ${arrowPos + arrowHeight / 2}px`;
    }

    transform = `${transform} scale(${1 / window.visualViewport.scale})`;

    $(event.elements.popper).css('transform-origin', origin);
    $(event.elements.popper).css('transform', transform);
}