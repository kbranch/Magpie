"use strict"

function closeOtherTooltips(element) {
    let id = $(element).attr('data-node-id');
    let nodes = $(`.check-graphic[data-node-id!="${id}"]:not(.animate__fadeOut)`);
    let secondaries = $('.helper');

    $(secondaries).tooltip('hide');
    $(nodes).tooltip('hide');
    $(nodes).removeAttr('data-pinned');

    for (const node of nodes) {
        updateTooltip(node);
    }
}

function closeAllCheckTooltips() {
    let secondaries = $('.helper');
    let nodes = $('.check-graphic');

    if (secondaries.length) {
        $(secondaries).tooltip('hide');
    }
    if (nodes.length) {
        $(nodes).tooltip('hide');
    }

    $('connection.connector-line').connections('remove');

    let pinnedNodes = $('.check-graphic[data-pinned]');
    pinnedNodes.removeAttr('data-pinned');

    for (const node of pinnedNodes) {
        updateTooltip(node);
    }

    if (pickingEntrances()) {
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

function closeAllTooltips() {
    closeAllCheckTooltips();

    // Nuke everything else to be safe
    let tooltipElements = $('[data-bs-toggle="tooltip"]');
    for (const element of tooltipElements) {
        let tooltip = bootstrap.Tooltip.getInstance(element);
        tooltip?.hide();
    }

    // No, really, everything
    $('.tooltip').remove();
}

function removeNodeTooltips() {
    $('.check-graphic').each((i, e) => {
        let oldTooltip = bootstrap.Tooltip.getInstance(e);
        oldTooltip.dispose();
    });
}

function updateTooltip(checkGraphic) {
    let node = nodes[$(checkGraphic).attr('data-node-id')]

    if (node == undefined) {
        return;
    }

    let pinned = $(checkGraphic).attr('data-pinned');

    let connectionType = 'none';

    if (pickingEntrances()) {
        connectionType = graphicalMapType;
    }

    let title = node.tooltipHtml(pinned, connectionType);
    let activated = $(checkGraphic).attr('data-bs-toggle') == "tooltip";

    $(checkGraphic).attr({
        'data-bs-toggle': 'tooltip',
        'data-bs-trigger': 'manual',
        'data-bs-html': 'true',
        'data-bs-title': title,
        'data-bs-animation': 'false',
        'data-bs-container': 'body',
    });

    let tooltip;

    if (activated) {
        tooltip = bootstrap.Tooltip.getInstance(checkGraphic);
        tooltip._config.title = title;

        if (tooltip._isShown()) {
            closeOtherTooltips(checkGraphic);
            tooltip.hide();
            tooltip.show();
        }
    }
    else {
        tooltip = new bootstrap.Tooltip(checkGraphic, {popperConfig:getPopperConfig});
        checkGraphic[0].addEventListener('inserted.bs.tooltip', (x) => {
            $('.tooltip').attr('oncontextmenu', 'return false;');
            const helpers = document.querySelectorAll('.helper, button[data-bs-custom-class="secondary-tooltip"]');
            const helperTips = [...helpers].map(x => new bootstrap.Tooltip(x, {popperConfig:getPopperConfig, animation:false}));
            // Janky fix for tooltips positioning themselves before the images load
            // Relies on animation being off
            for (const tip of helperTips) {
                tip.show();
                tip.hide();
            }
        })
    }
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