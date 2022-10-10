var nodes = {};

function drawNodes(mapName, animate=true) {
    let mapImg = $(`.map[data-mapname="${mapName}"`);

    if ($(mapImg).width() <= 100) {
        $(mapImg).on('load', function () { drawNodes(mapName, animate); });
        return;
    }

    animate = animate
              && localSettings.animateChecks
              && !skipNextAnimation;
    
    skipNextAnimation = false;

    $('.check-graphic.animate__fadeOut').remove();

    updateReverseMap();

    let map = $(mapImg).closest('div.tab-pane');
    let parent = $(map).find('div.map-wrapper');
    createNodes(map, mapName);

    for (const nodeId in nodes) {
        let node = nodes[nodeId];
        let classes = node.iconClasses();
        let graphic = $(`[data-node-id="${node.id()}"]`);

        graphic = updateAnimationClasses(classes, node, graphic, parent, animate);
        updateEntranceAttrs(graphic, node);

        $(graphic).attr({
            'class': classes.join(' '),
            'data-difficulty': node.difficulty,
        })

        updateTooltip(graphic);
    }

    // drawConnectorLines();

    removeOldNodes();
}

function removeOldNodes() {
    let oldNodeIds = $('.check-graphic').toArray()
                         .map(x => $(x).attr('data-node-id'))
                         .filter(x => !(x in nodes));

    for (const staleNodeId of oldNodeIds) {
        let node = $(`[data-node-id="${staleNodeId}"]`);
        $(node).tooltip('hide');
        $(node).removeClass('animate__bounceInDown');
        $(node).addClass('animate__fadeOut');
    }
}

function updateEntranceAttrs(graphic, node) {
    let entrance = node.entrance

    if (entrance == null) {
        $(graphic).removeAttr('data-entrance-id');

        return;
    }

    $(graphic).attr('data-entrance-id', entrance.id);

    if (entrance.isConnector()) {
        if (entrance.isConnected()) {
            connection = entrance.mappedConnection();
            $(graphic).attr('data-connected-to', connection.otherSides(entrance.id).join(';'));
            updateNodeOverlay(graphic, connection.label);
        }
        else {
            $(graphic).removeAttr('data-connected-to');
            $(graphic).empty();
        }
    }
    else {
        if (entrance.isRemapped()) {
            $(graphic).attr('data-connected-to', entrance.connectedTo());
        }
        else {
            $(graphic).removeAttr('data-connected-to');
        }

        if (entrance.isFound()
            && !entrance.isMappedToSelf()) {
            $(graphic).attr('data-connected-from', entrance.connectedFrom());
        }
        else {
            $(graphic).removeAttr('data-connected-from');
        }
    }
}

function updateAnimationClasses(classes, node, graphic, parent, animate) {
    let animationClass = animate ? 'animate__bounceInDown' : '';

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

        graphic = buildNewCheckGraphic(node.id());

        $(parent).append(graphic);
    }

    return graphic;
}

function updateTooltip(checkGraphic) {
    let node = nodes[$(checkGraphic).attr('data-node-id')]

    if (node == undefined) {
        return;
    }

    let pinned = $(checkGraphic).attr('data-pinned');

    let title = node.tooltipHtml(pinned, graphicalMapSource != null);
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
        tooltip.setContent({'.tooltip-inner': title});
    }
    else {
        tooltip = new bootstrap.Tooltip(checkGraphic);
        checkGraphic[0].addEventListener('inserted.bs.tooltip', (x) => {
            $('.tooltip').attr('oncontextmenu', 'return false;');
            const helpers = document.querySelectorAll('.helper');
            const helperTips = [...helpers].map(x => new bootstrap.Tooltip(x));
        })
    }
}

function createNodes(map, mapName) {
    nodes = {};

    let scaling = getMapScaling(map);

    // We're in the special entrance connecting mode
    if (graphicalMapSource != null) {
        createEntranceNodes(graphicalMapChoices, scaling, true);
        return;
    }

    if (randomizedEntrances.length > 0 && mapName == 'overworld') {
        createEntranceNodes(randomizedEntrances, scaling);
    }

    let checks = $('li[data-logic]').toArray()
                    .map(x => createCheck(x, mapName))
                    .filter(x => x.shouldDraw());

    for (const check of checks) {
        for (const coord of check.locations) {
            let coordString = MapNode.nodeId(coord, scaling);

            if (!(coordString in nodes)) {
                nodes[coordString] = new MapNode(coord, scaling);
            }

            nodes[coordString].checks.push(check);
        }
    }

    distributeChecks();

    for (const key in nodes) {
        let node = nodes[key];
        node.update();

        if (node.canBeHidden()) {
            delete nodes[key];
        }
    }
}

function createEntranceNodes(entrances, scaling, update=false) {
    for (const entrance of entrances) {
        let entranceData = entranceDict[entrance];
        let coordString = MapNode.nodeId(entranceData.locations[0], scaling);

        if (!(coordString in nodes)) {
            let node = new MapNode(entranceData.locations[0], scaling, entranceData.id);
            nodes[coordString] = node;

            if (update) {
                node.update();
            }
        }
    }
}

function createCheck(checkElement, mapName) {
    let id = $(checkElement).attr('data-check-id');
    return new Check(id,
                     $(checkElement).attr('data-behind_keys') == 'True',
                     Number($(checkElement).attr('data-difficulty')),
                     coordDict[id].locations,
                     mapName,
                     $(checkElement).attr('data-vanilla') == 'true'
    );
}

function distributeChecks() {
    let checksByEntrance = {'landfill': []};
    let checksByConnector = {};
    let entrancesByConnector = {};
    let remappedNodes = [];
    let connectorsByCheckId = {};

    connectors.map(connector => connector.checks.map(checkId => connectorsByCheckId[checkId] = connector));

    for (const key in nodes) {
        let node = nodes[key];

        if(node.entrance == null && node.checks.some(x => x.id in connectorsByCheckId)) {
            let connector = connectorsByCheckId[node.checks[0].id];
            node.entrance = new Entrance(connector.entrances[0]);
            node.hideMe = true;
        }

        if (node.entrance == null) {
            continue;
        }

        let entranceId = node.entrance.id;
        if (['advanced', 'expert', 'insanity'].includes(args.entranceshuffle)
            && node.entrance.isConnector()) {
            let connector = node.entrance.metadata.connector;
            if (!(connector in checksByConnector)) {
                checksByConnector[connector] = new Set();
                entrancesByConnector[connector] = [];
            }

            node.checks.map(x => checksByConnector[connector].add(x));
            entrancesByConnector[connector].push(entranceId);
        }
        else {
            checksByEntrance[entranceId] = node.checks;
        }

        if (!node.entrance.isMapped()) {
            if (args.entranceshuffle != 'none'
                || !node.entrance.canBeStart()) {
                node.checks = [];
            }
        }

        if (node.entrance.isRemapped()) {
            remappedNodes.push(node);
        }
    }

    for (const connector in entrancesByConnector) {
        for (const entranceId of entrancesByConnector[connector]) {
            checksByEntrance[entranceId] = Array.from(checksByConnector[connector]);
        }
    }

    for (const node of remappedNodes) {
        node.checks = checksByEntrance[node.entrance.connectedTo()];
    }

}

function updateNodeOverlay(graphic, text) {

    let overlay = $('<p>', {
        'class': "node-overlay",
        'data-connector-label': text,
        css: {
            'font-size': `${localSettings.checkSize * 0.72}px`,
        },
        onmousedown: "preventDoubleClick(event)"
    });

    $(overlay).append(text);
    $(graphic).empty();
    $(graphic).append(overlay);
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

function clearCheckTooltips() {
    $('.check-graphic').each((i, e) => {
        let oldTooltip = bootstrap.Tooltip.getInstance(e);
        oldTooltip.dispose();
    });
}

function clearCheckImages() {
    clearCheckTooltips();
    $('.check-graphic').remove();
}

function closeOtherTooltips(element) {
    let id = $(element).attr('data-node-id');
    let nodes = $(`.check-graphic[data-node-id!="${id}"]:not(.animate__fadeOut)`);
    $(nodes).tooltip('hide');
    $(nodes).removeAttr('data-pinned');

    for (const node of nodes) {
        updateTooltip(node);
    }
}

function closeAllCheckTooltips() {
    let nodes = $(`.check-graphic`);
    nodes.tooltip('hide');
    $('connection.connector-line').connections('remove');

    let pinnedNodes = $('.check-graphic[data-pinned]');
    pinnedNodes.removeAttr('data-pinned');

    for (const node of pinnedNodes) {
        updateTooltip(node);
    }

    if (graphicalMapSource != null) {
        endGraphicalConnection();
    }
}

function drawActiveTab() {
    let activeTabId = $('ul#mapTabs button.active').attr('id');
    let button = $(`button#${activeTabId}`)[0];
    drawNodes(getMapNameFromButton(button), true);
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

    drawNodes(getMapNameFromButton(button), false);
}

function drawConnectorLines() {
    $('connection').connections('remove');

    // let connected = {};
    // for (const connector of Object.keys(reverseEntranceMap).filter(x => entranceDict[x].type == 'connector')) {
    //     let entrance = entranceDict[connector];
    //     let others = entrance.connectedTo;
    //     let mappedOthers = others.filter(x => x in reverseEntranceMap);

    //     if (mappedOthers.length > 0) {
    //         let id = getConnectorId([connector].concat(others));
    //         connected[id] = [connector].concat(mappedOthers);
    //     }
    // }

    // for (const key in connected) {
    //     let entrances = connected[key];
    //     let first = $(`[data-entrance-id="${reverseEntranceMap[entrances[0]]}"`);

    //     for (let i = 1; i < entrances.length; i++) {
    //         let selector = `[data-entrance-id="${reverseEntranceMap[entrances[i]]}"]`;
    //         $(first).connections({ class: 'entrance-to', to: selector });
    //         $(first).connections({ class: 'outer-entrance-connection', to: selector });
    //     }
    // }
}

function getConnectorId(entrances) {
    return sortByKey(entrances, x => [x]).join('-');
}

function startGraphicalConnection(entranceId) {
    closeAllCheckTooltips();
    graphicalMapSource = entranceId;
    graphicalMapChoices = new Set(Entrance.validConnections(entranceId).map(x => x[0]));
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

    drawActiveTab();
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