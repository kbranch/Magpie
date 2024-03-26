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

function updateTooltip(checkGraphic, hoveredCheckId=null) {
    if (!checkGraphic) {
        return;
    }

    let node = nodes[checkGraphic.dataset.nodeId]

    if (node == undefined) {
        return;
    }

    let pinned = checkGraphic.dataset.pinned;

    let connectionType = 'none';

    if (pickingEntrances()) {
        connectionType = graphicalMapType;
    }

    let title = node.tooltipHtml(pinned, connectionType, hoveredCheckId);
    let activated = checkGraphic.dataset.bsTitle != "";

    checkGraphic.dataset.bsTitle = title;

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
        tooltip = new bootstrap.Tooltip(checkGraphic, {popperConfig:getPopperConfig, sanitize: false});
        checkGraphic.addEventListener('inserted.bs.tooltip', (e) => {
            let tooltips = document.querySelectorAll('div.tooltip');
            tooltips.forEach(tip => {
                tip.addEventListener('contextmenu', () => { return false; });

                const helpers = tip.querySelectorAll('.helper, button[data-bs-custom-class="secondary-tooltip"]');
                [...helpers].forEach(helper => { 
                    let helperTip = new bootstrap.Tooltip(helper, { popperConfig: getPopperConfig, animation: false, sanitize: false });

                    // Janky fix for tooltips positioning themselves before the images load
                    // Relies on animation being off
                    helperTip.show();
                    helperTip.hide();
                })
            });
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