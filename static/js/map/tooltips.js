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
    $(secondaries).tooltip('hide');
    $(nodes).tooltip('hide');
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

// function closeAllTooltips() {
//     $('.tooltip').tooltip('hide');
// }

function removeNodeTooltips() {
    $('.check-graphic').each((i, e) => {
        let oldTooltip = bootstrap.Tooltip.getInstance(e);
        oldTooltip.dispose();
    });
}

function updateTooltip(checkGraphic, reshow=false) {
    let node = nodes[$(checkGraphic).attr('data-node-id')]

    if (node == undefined) {
        return;
    }

    let pinned = $(checkGraphic).attr('data-pinned');

    let connectionType = 'none';

    if (pickingEntrances()) {
        if (Entrance.isConnector(graphicalMapSource)) {
            connectionType = 'connector';
        }
        else {
            connectionType = 'simple';
        }
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

        if (reshow) {
            tooltip.hide();
            tooltip.show();
        }
    }
    else {
        tooltip = new bootstrap.Tooltip(checkGraphic, {popperConfig:getPopperConfig});
        checkGraphic[0].addEventListener('inserted.bs.tooltip', (x) => {
            $('.tooltip').attr('oncontextmenu', 'return false;');
            const helpers = document.querySelectorAll('.helper');
            const helperTips = [...helpers].map(x => new bootstrap.Tooltip(x));
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
        xOrigin = event.placement == "left" ? "right" : "left";
        origin = `${xOrigin} ${arrowPos + arrowHeight / 2}px`;
    }

    transform = `${transform} scale(${1 / window.visualViewport.scale})`;

    $(event.elements.popper).css('transform-origin', origin);
    $(event.elements.popper).css('transform', transform);
}