"use strict"

function checkGraphicMouseEnter(element) {
    closeUnpinnedTooltips();

    if ($(element).hasClass('animate__fadeOut')) {
        return;
    }

    if (!isVue) {
        let tooltip = bootstrap.Tooltip.getInstance(element);

        if (tooltip._isShown()) {
            return;
        }

        tooltip.show();
    }

    let node = nodes[element.id];
    let connection = node.entrance?.mappedConnection();
    if (connection && !coupledEntrances()) {
        let connectionNodes = sortByKey(Object.values(nodes).filter(x => connection.entrances.includes(x.entrance?.id)),
                                        x => connection.entrances.indexOf(x.entrance?.id));

        for (let i = 0; i < connectionNodes.length - 1; i++) {
            let current = connectionNodes[i];
            let next = connectionNodes[i + 1];
            let selector = `.check-graphic[data-entrance-id="${current.entrance.id}"], .check-graphic[data-entrance-id="${next.entrance.id}"]`;
            $(selector).connections({ class: `${current == node || next == node ? 'entrance-from' : 'entrance-to'} connector-line` });
            $(selector).connections({ class: 'outer-entrance-connection connector-line' });
        }
    }
    else if(($(element).hasClass('connector') || !inOutEntrances())
       && $(element).is('[data-connected-to')) {
        let child = $(element).find('[data-connector-label]')[0];
        let label = $(child).attr('data-connector-label');
        let selector = `[data-connector-label="${label}"]`;
        $(selector).connections({ class: 'entrance-to connector-line' });
        $(selector).connections({ class: 'outer-entrance-connection connector-line' });
    }
}

function checkGraphicMouseLeave(element) {
    if (!hasAttr(element, 'data-pinned')) {
        if (!isVue) {
            let tooltip = bootstrap.Tooltip.getInstance(element);
            tooltip.hide();
        }

        $('connection.connector-line').connections('remove');
    }

    closeUnpinnedTooltips();
}

function entranceClicked(element) {
    let destId = $(element).attr('data-entrance-id');

    if (graphicalMapType == 'connector') {
        openConnectorDialog(destId);
    }
    else {
        let targetInside = true;

        if (graphicalMapType == 'overworld'
            || (graphicalMapType == 'simple' && Entrance.isInside(graphicalMapSource))) {
            targetInside = false;
        }

        if (Entrance.isInside(destId) != targetInside) {
            destId = Entrance.getInsideOut(destId);
        }

        let entrances = [graphicalMapSource, destId];

        connectEntrances(graphicalMapSource, destId);

        if (['overworld', 'underworld'].includes(graphicalMapType)) {
            Connection.advancedErConnection(entrances, graphicalMapType);
        }
    }
}

function nodePrimary(element, event) { 
    if (pickingEntrances()) {
        entranceClicked(element);
        return;
    }

    let node = nodeFromElement(element);
    if (event.ctrlKey && node.isDungeon(pickingEntrances())) {
        let tabName = node.dungeonName().toLowerCase();
        openTab(tabName);
    }
    else {
        toggleNode(node);
        let tooltip = bootstrap.Tooltip.getInstance(element);
        tooltip.hide();
    }
}

function nodeSecondary(element) {
    closeOtherTooltips(element);

    if (pickingEntrances()) {
        entranceClicked(element);
        return;
    }

    let node = nodes[element.dataset.nodeId];
    node.pinned = !node.pinned;

    if (node.pinned) {
        $(element).attr('data-pinned', true);
    }
    else {
        $(element).removeAttr('data-pinned');
    }

    updateTooltip(element);
}

function nodeMiddle(element) {
    let node = nodeFromElement(element);
    if (node.isDungeon(pickingEntrances())) {
        let tabName = node.dungeonName().toLowerCase();
        openTab(tabName);
    }
}

function checkGraphicLeftClick(event) {
    let element = event.currentTarget;
    if ($(element).hasClass('animate__fadeOut')) {
        return;
    }

    if (localSettings.swapMouseButtons) {
        nodeSecondary(element);
    }
    else {
        nodePrimary(element, event);
    }
}

function checkGraphicRightClick(event) {
    let element = event.currentTarget;
    if ($(element).hasClass('animate__fadeOut')) {
        return;
    }

    if (localSettings.swapMouseButtons) {
        nodePrimary(element, event);
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

        $('#mapContainer').append(mouseTracker);

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

function keyDown(e) {
    if (e.ctrlKey && e.key == 'z') {
        undo();
    }
    else if ((e.ctrlKey && e.shiftKey && e.key == 'Z')
             || (e.ctrlKey && e.key == 'y')) {
        redo();
    }
    else if (e.key == 'Escape' && pickingEntrances()) {
        endGraphicalConnection();
    }
}

function mapFromRoom(room) {
    if (room?.length == 4) {
        return 'overworld';
    }

    if (room in roomDict) {
        return roomDict[room].map;
    }

    return null;
}

function openTab(map) {
    let button = getButtonFromMapName(map);
    button.click();
}