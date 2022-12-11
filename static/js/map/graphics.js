

function createNodes(map, mapName) {
    nodes = {};

    let scaling = getMapScaling(map);

    // We're in the special entrance connecting mode
    if (graphicalMapSource != null) {
        createEntranceNodes(graphicalMapChoices, scaling, true);
        return;
    }

    if (randomizedEntrances.length > 0 && mapName == 'overworld') {
        if (args.randomstartlocation && !Entrance.isFound(startHouse)) {
            createEntranceNodes(startLocations, scaling);
        }
        else {
            createEntranceNodes(randomizedEntrances, scaling);
        }
    }

    let checks = $('li[data-logic]').toArray()
                    .map(x => createCheck(x, mapName))
                    .filter(x => x.shouldDraw());

    for (const check of checks) {
        for (const coord of check.locations) {
            if ((['advanced', 'expert', 'insanity'].includes(args.entranceshuffle)
                 && coord.indirect)
                || (args.entranceshuffle == 'simple'
                    && coord.indirect
                    && coord.inSimpleEntrace)) {
                continue;
            }

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
            
            if (node.entrance != null && !node.entrance.shouldDraw()) {
                node.hideMe = true;
            }

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
    let checksByEntrance = {'landfill': [], 'bk_shop': []};
    let checksByConnector = {};
    let entrancesByConnector = {};
    let remappedNodes = [];
    let connectorsByCheckId = {};
    let shuffleConnectors = ['advanced', 'expert', 'insanity'].includes(args.entranceshuffle);

    connectors.map(connector => connector.checks.map(checkId => connectorsByCheckId[checkId] = connector));

    for (const key in nodes) {
        let node = nodes[key];

        if(node.entrance == null 
           && shuffleConnectors
           && node.checks.some(x => x.id in connectorsByCheckId)) {
            let connector = connectorsByCheckId[node.checks[0].id];
            node.entrance = new Entrance(connector.entrances[0]);
            node.hideMe = true;
        }

        if (node.entrance == null) {
            continue;
        }

        let entranceId = node.entrance.id;
        if (shuffleConnectors
            && node.entrance.isConnector()) {
            let connector = node.entrance.metadata.connector;
            if (!(connector in checksByConnector)) {
                checksByConnector[connector] = new Set();
                entrancesByConnector[connector] = new Set();
            }

            node.checks.map(x => checksByConnector[connector].add(x));
            entrancesByConnector[connector].add(entranceId);
        }
        else {
            checksByEntrance[entranceId] = node.checks;
        }

        if (!node.entrance.isMapped()) {
            if (args.entranceshuffle != 'none'
                || (node.entrance.canBeStart()
                    && !Entrance.isFound(startHouse))) {
                node.checks = [];
            }
        }

        if (node.entrance.isMapped()) {
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
        removeNodes();
    }

    drawNodes(getMapNameFromButton(button), false);
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