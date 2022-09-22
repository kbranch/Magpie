function checkGraphicMouseEnter(element) {
    if ($(element).hasClass('animate__fadeOut')) {
        return;
    }

    let tooltip = bootstrap.Tooltip.getInstance(element);

    if (tooltip._isShown()) {
        return;
    }

    tooltip.show();
}

function checkGraphicMouseLeave(element) {
    if (!hasAttr(element, 'data-pinned')) {
        let tooltip = bootstrap.Tooltip.getInstance(element);
        tooltip.hide();
    }
}

function nodePrimary(element) { 
    toggleNode(element);
}

function nodeSecondary(element) {
    closeOtherTooltips(element);

    if (hasAttr(element, 'data-pinned')) {
        $(element).removeAttr('data-pinned');
    }
    else {
        $(element).attr('data-pinned', true);
    }

    updateTooltip(element);

}

function checkGraphicLeftClick(element) {
    if ($(element).hasClass('animate__fadeOut')) {
        return;
    }

    if (graphicalMapSource != null) {
        endGraphicalConnection(destId=$(element).attr('data-entrance-id'));
        return;
    }

    if (localSettings.swapMouseButtons) {
        nodeSecondary(element);
    }
    else {
        nodePrimary(element);
    }
}

function checkGraphicRightClick(element) {
    if ($(element).hasClass('animate__fadeOut')) {
        return;
    }

    if (graphicalMapSource != null) {
        endGraphicalConnection(destId=$(element).attr('data-entrance-id'));
        return;
    }

    if (localSettings.swapMouseButtons) {
        nodePrimary(element);
    }
    else {
        nodeSecondary(element);
    }
}

function connectorMouseMove(event) {
    let mouseTracker = $('#mouseTracker');

    if (mouseTracker.length == 0) {
        mouseTracker = $('<div>', {
            id: 'mouseTracker',
            css: {
                left: event.pageX,
                top: event.pageY,
                position: 'absolute',
                'pointer-events': 'none',
                width: 1,
                height: 1,
            }
        });

        $('#firstRow').append(mouseTracker);

        let source = $(`[data-entrance-id="${graphicalMapSource}"]`);
        $(source).connections({ class: 'entrance-from', to: $(mouseTracker) });
        $(source).connections({ class: 'outer-entrance-connection', to: $(mouseTracker) });
    }

    $(mouseTracker).css({
        left: event.pageX,
        top: event.pageY,
    });

    $(mouseTracker).connections('update');
}