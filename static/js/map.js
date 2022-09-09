var nodes = {};

function drawChecks(mapName, animate=true) {
    let mapImg = $(`.map[data-mapname="${mapName}"`);

    if ($(mapImg).width() <= 100) {
        $(mapImg).on('load', function () { drawChecks(mapName, animate); });
        return;
    }

    animate = animate
              && localSettings.animateChecks
              && !skipNextAnimation;
    
    skipNextAnimation = false;

    $('.checkGraphic.animate__fadeOut').remove();

    let oldNodes = new Set();
    $('.checkGraphic').each(function () {
        oldNodes.add($(this).attr('data-node-id'));
    });

    updateReverseMap();

    let map = $(mapImg).closest('div.tab-pane');
    let parent = $(map).find('div.map-wrapper');
    createNodes(map, mapName);

    for (const nodeId in nodes) {
        let node = nodes[nodeId];
        let animationClass = animate ? 'animate__bounceInDown' : '';
        let classes = ['checkGraphic', 'animate__animated'];

        classes = classes.concat(pickNodeIconClasses(node));

        let graphic = $(`[data-node-id="${nodeId}"]`);
        if (graphic.length > 0) {
            let currentDiff = $(graphic).attr('data-difficulty');

            if (currentDiff == "9" && node.difficulty >= 0 && node.difficulty < 9) {
                classes.push(animationClass);
            }
            else {
                $(graphic).removeClass('animate__bounceInDown');
            }
        }
        else {
            classes.push(animationClass);

            graphic = buildNewCheckGraphic(nodeId);

            $(parent).append(graphic);
        }

        if (node.entrance != null) {
            $(graphic).attr('data-entrance-id', node.entrance.id);

            if (node.entrance.id in entranceMap
                && entranceMap[node.entrance.id] != node.entrance.id) {
                $(graphic.attr('data-connected-to', entranceMap[node.entrance.id]));
            }
            else {
                $(graphic).removeAttr('data-connected-to');
            }

            if (node.entrance.id in reverseEntranceMap
                && reverseEntranceMap[node.entrance.id] != node.entrance.id) {
                $(graphic.attr('data-connected-from', reverseEntranceMap[node.entrance.id]));
            }
            else {
                $(graphic).removeAttr('data-connected-from');
            }
        }
        else {
            $(graphic).removeAttr('data-entrance-id');
        }

        $(graphic).attr({
            'class': classes.join(' '),
            'data-difficulty': node.difficulty,
        })

        addTooltip(graphic);

        oldNodes.delete(nodeId);
    }

    drawConnectorLines();

    for (const staleNode of oldNodes) {
        let node = $(`[data-node-id="${staleNode}"]`);
        $(node).tooltip('hide');
        $(node).removeClass('animate__bounceInDown');
        $(node).addClass('animate__fadeOut');
    }
}

function pickNodeIconClasses(node) {
    let classes = [];

    if (node.behindKeys) {
        classes.push('behind-keys');
    }

    if (node.isVanilla) {
        classes.push('vanilla');
    }

    if (node.entrance != null) {
        if (node.entrance.id in entranceMap) {
            let mappedEntrance = entranceDict[entranceMap[node.entrance.id]];

            if (args.randomstartlocation 
                && mappedEntrance.id == 'start_house') {
                classes.push('start-location');
            }

            if (mappedEntrance.entranceType == 'connector') {
                if (node.isChecked || node.checks.length == 0) {
                    classes.push('entrance-only');
                }
                else {
                    classes.push(`difficulty-${node.difficulty}`);
                }
            }
            else if (node.checks.length > 0) {
                classes.push(`difficulty-${node.difficulty}`);
            }
            else if (mappedEntrance.id == 'landfill') {
                classes.push('difficulty-checked');
            }
            else {
                classes.push('entrance-only');
            }
        }
        else {
            classes.push('unmapped-entrance');
        }
    }
    else {
        classes.push(`difficulty-${node.difficulty}`);
    }

    return classes;
}

function addTooltip(checkGraphic) {
    let node = nodes[$(checkGraphic).attr('data-node-id')]

    if (node == undefined) {
        return;
    }

    let title = node.tooltipHtml($(checkGraphic).attr('data-pinned'));

    let activated = $(checkGraphic).attr('data-bs-toggle') == "tooltip";

    $(checkGraphic).attr({
        'data-bs-toggle': 'tooltip',
        'data-bs-trigger': 'manual',
        'data-bs-html': 'true',
        'data-bs-title': title,
        'data-bs-animation': 'false',
    });

    if (activated) {
        let oldTooltip = bootstrap.Tooltip.getInstance(checkGraphic);
        oldTooltip.setContent({'.tooltip-inner': title});
    }
    else {
        let tooltip = new bootstrap.Tooltip(checkGraphic);
        checkGraphic[0].addEventListener('inserted.bs.tooltip', (x) => {
            $('.tooltip').attr('oncontextmenu', 'return false;');
        })
    }

}

function createNodes(map, mapName) {
    nodes = {};

    let xScale = Math.min(1, $(map).width() / $(map).find('.map').prop('naturalWidth'));
    let yScale = Math.min(1, $(map).height() / $(map).find('.map').prop('naturalHeight'));

    let xOffset = (16 * xScale - localSettings.checkSize) / 2;
    let yOffset = (16 * yScale - localSettings.checkSize) / 2;

    if (graphicalMapSource != null) {
        for (const entrance of graphicalMapChoices) {
            let entranceData = entranceDict[entrance];
            let x = Math.round(entranceData.locations[0].x * xScale + xOffset);
            let y = Math.round(entranceData.locations[0].y * yScale + yOffset);
            let coordString = MapNode.nodeId(x, y);

            if (!(coordString in nodes)) {
                let node = new MapNode(x, y, entranceData);
                nodes[coordString] = node;
                node.update();
            }
        }
    }
    else {
        if (entrances.length > 0 && mapName == 'overworld') {
            for (const entrance of entrances) {
                let entranceData = entranceDict[entrance];
                let x = Math.round(entranceData.locations[0].x * xScale + xOffset);
                let y = Math.round(entranceData.locations[0].y * yScale + yOffset);
                let coordString = MapNode.nodeId(x, y);

                if (!(coordString in nodes)) {
                    nodes[coordString] = new MapNode(x, y, entranceData);
                }
            }
        }

        let checks = $('li[data-logic]');
        for (const check of checks) {
            let id = $(check).attr('data-check-id');
            let checkMaps = coordDict[id].locations.map(function(x) { return x.map; });
            let difficulty = Number($(check).attr('data-difficulty'));
            let vanilla = $(check).attr('data-vanilla') == 'true';

            if (localSettings.ignoreHigherLogic && difficulty > 0) {
                difficulty = 9;
            }

            if (!(checkMaps.includes(mapName))
                || (difficulty == 9
                    && !localSettings.showOutOfLogic)
                || (vanilla
                    && localSettings.hideVanilla)) {
                continue;
            }

            let checkData = coordDict[id];
            let behindKeys = $(check).attr('data-behind_keys') == 'True'
            let coords = checkData.locations;

            for (const coord of coords) {
                if (coord.map != mapName) {
                    continue;
                }

                let x = Math.round(coord.x * xScale + xOffset);
                let y = Math.round(coord.y * yScale + yOffset);
                let coordString = MapNode.nodeId(x, y);

                if (!(coordString in nodes)) {
                    nodes[coordString] = new MapNode(x, y);
                }

                nodes[coordString].addCheck(id, behindKeys, difficulty, vanilla);
            }
        }

        let checksByEntrance = {'landfill': []};
        let remappedNodes = [];
        for (const key in nodes) {
            let node = nodes[key];
            if (node.entrance == null) {
                continue;
            }

            let entranceId = node.entrance.id;
            checksByEntrance[entranceId] = node.checks;

            if (!(entranceId in entranceMap)) {
                if (args.entranceshuffle != 'none'
                    || !(entranceId in startLocations)) {
                    node.checks = [];
                }
            }

            if (!(entranceId in entranceMap)
                || entranceMap[entranceId] == entranceId) {
                continue;
            }

            remappedNodes.push(node);
        }

        for (const node of remappedNodes) {
            node.checks = checksByEntrance[entranceMap[node.entrance.id]];
        }

        for (const key in nodes) {
            let node = nodes[key];
            node.update();

            if (node.canBeHidden()) {
                delete nodes[key];
            }
        }
    }
}

function buildNewCheckGraphic(id) {
    let coords = MapNode.coordsFromId(id);

    graphic = $('<div>', {
        'data-node-id': id,
        'draggable': false,
        css: {
            'top': coords.y,
            'left': coords.x,
            'width': localSettings.checkSize,
            'height': localSettings.checkSize,
        },
        onclick: 'checkGraphicLeftClick(this);',
        oncontextmenu: 'checkGraphicRightClick(this); return false;',
        onmouseenter: 'checkGraphicMouseEnter(this)',
        onmouseleave: 'checkGraphicMouseLeave(this)',
    });

    return graphic;
}

function deleteAllCheckTooltips() {
    $('.checkGraphic').each((i, e) => {
        let oldTooltip = bootstrap.Tooltip.getInstance(e);
        oldTooltip.dispose();
    });
}

function clearCheckImages() {
    deleteAllCheckTooltips();
    $('.checkGraphic').remove();
}

function closeOtherTooltips(element) {
    let id = $(element).attr('data-node-id');
    let nodes = $(`.checkGraphic[data-node-id!="${id}"]:not(.animate__fadeOut)`);
    $(nodes).tooltip('hide');
    $(nodes).removeAttr('data-pinned');

    for (const node of nodes) {
        addTooltip(node);
    }
}

function closeAllCheckTooltips() {
    let nodes = $(`.checkGraphic`);
    nodes.tooltip('hide');

    let pinnedNodes = $('.checkGraphic[data-pinned]');
    pinnedNodes.removeAttr('data-pinned');

    for (const node of pinnedNodes) {
        addTooltip(node);
    }

    if (graphicalMapSource != null) {
        endGraphicalConnection();
    }
}

function drawActiveTab() {
    let activeTabId = $('ul#mapTabs button.active').attr('id');
    let button = $(`button#${activeTabId}`)[0];
    drawChecks(getMapNameFromButton(button), true);
}

function getMapNameFromButton(button) {
    let target = $(button).attr('data-bs-target');
    let img = $(`${target} img.map`);
    let mapName = $(img).attr('data-mapname');

    return mapName;
}

function drawTab(button, clear=false) {
    if (clear) {
        clearCheckImages();
    }

    drawChecks(getMapNameFromButton(button), false);
}

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

function drawConnectorLines() {
    $('connection').connections('remove');

    let connected = {};
    for (const connector of Object.keys(reverseEntranceMap).filter(x => entranceDict[x].entranceType == 'connector')) {
        let entrance = entranceDict[connector];
        let others = entrance.connectedTo;
        let mappedOthers = others.filter(x => x in reverseEntranceMap);

        if (mappedOthers.length > 0) {
            let id = getConnectorId([connector].concat(others));
            connected[id] = [connector].concat(mappedOthers);
        }
    }

    for (const key in connected) {
        let entrances = connected[key];
        let first = $(`[data-entrance-id="${reverseEntranceMap[entrances[0]]}"`);

        for (let i = 1; i < entrances.length; i++) {
            let selector = `[data-entrance-id="${reverseEntranceMap[entrances[i]]}"]`;
            $(first).connections({ class: 'entrance-to', to: selector });
            $(first).connections({ class: 'outer-entrance-connection', to: selector });
        }
    }
}

function getConnectorId(entrances) {
    return sortByKey(entrances, x => [x]).join('-');
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

    addTooltip(element);

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

function graphicalConnection(entranceId) {
    closeAllCheckTooltips();
    graphicalMapSource = entranceId;
    graphicalMapChoices = new Set(MapNode.getValidConnections(entranceId).map(x => x[0]));
    $('#overworldTabContent').mousemove(connectorMouseMove);
    drawActiveTab();
}

function endGraphicalConnection(destId = null) {
    let originalSource = graphicalMapSource;

    graphicalMapSource = null;
    graphicalMapChoices = null;

    $('#mouseTracker').connections('remove');
    $('#overworldTabContent').off('mousemove');
    $('#mouseTracker').remove();

    if (destId != null) {
        connectEntrances(originalSource, destId);
    }
    else if(originalSource != null) {
        skipNextAnimation = true;
        refreshCheckList();
    }
}