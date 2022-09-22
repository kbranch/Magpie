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

    $('.checkGraphic.animate__fadeOut').remove();

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

    drawConnectorLines();

    removeOldNodes();
}

function removeOldNodes() {
    let oldNodeIds = $('.checkGraphic').toArray()
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
    if (entrance != null) {
        $(graphic).attr('data-entrance-id', entrance.id);

        if (entrance.id in entranceMap
            && entranceMap[entrance.id] != entrance.id) {
            $(graphic.attr('data-connected-to', entranceMap[entrance.id]));
        }
        else {
            $(graphic).removeAttr('data-connected-to');
        }

        if (entrance.id in reverseEntranceMap
            && reverseEntranceMap[entrance.id] != entrance.id) {
            $(graphic.attr('data-connected-from', reverseEntranceMap[entrance.id]));
        }
        else {
            $(graphic).removeAttr('data-connected-from');
        }
    }
    else {
        $(graphic).removeAttr('data-entrance-id');
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

    let scaling = getMapScaling(map);

    // We're in the special entrance connecting mode
    if (graphicalMapSource != null) {
        createEntranceNodes(graphicalMapChoices, scaling, true);
        return;
    }

    if (entrances.length > 0 && mapName == 'overworld') {
        createEntranceNodes(entrances, scaling);
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
            let node = new MapNode(entranceData.locations[0], scaling, entranceData);
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
    $('.checkGraphic').each((i, e) => {
        let oldTooltip = bootstrap.Tooltip.getInstance(e);
        oldTooltip.dispose();
    });
}

function clearCheckImages() {
    clearCheckTooltips();
    $('.checkGraphic').remove();
}

function closeOtherTooltips(element) {
    let id = $(element).attr('data-node-id');
    let nodes = $(`.checkGraphic[data-node-id!="${id}"]:not(.animate__fadeOut)`);
    $(nodes).tooltip('hide');
    $(nodes).removeAttr('data-pinned');

    for (const node of nodes) {
        updateTooltip(node);
    }
}

function closeAllCheckTooltips() {
    let nodes = $(`.checkGraphic`);
    nodes.tooltip('hide');

    let pinnedNodes = $('.checkGraphic[data-pinned]');
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

function getMapScaling(map) {
    let scaling = {};

    scaling.x = Math.min(1, $(map).width() / $(map).find('.map').prop('naturalWidth'));
    scaling.y = Math.min(1, $(map).height() / $(map).find('.map').prop('naturalHeight'));

    scaling.offset = {};

    scaling.offset.x = (16 * scaling.x - localSettings.checkSize) / 2;
    scaling.offset.y = (16 * scaling.y - localSettings.checkSize) / 2;

    return scaling;
}