var nodes = {};

function removeNodes() {
    removeNodeTooltips();
    $('.check-graphic').remove();
    $('#linkFace').remove();
}

function createCheck(checkElement, mapName=null) {
    let id = $(checkElement).attr('data-check-id');

    if (mapName == null) {
        dungeonMaps = coordDict[id].locations.map(x => x.map)
                                             .filter(x => x != 'overworld');
        if (dungeonMaps.length == 0) {
            mapName = 'overworld';
        }
        else {
            mapName = dungeonMaps[0];
        }
    }

    return new Check(id,
                     $(checkElement).attr('data-behind_keys') == 'True',
                     Number($(checkElement).attr('data-difficulty')),
                     coordDict[id].locations,
                     mapName,
                     $(checkElement).attr('data-vanilla') == 'true',
                     checkContents[id],
    );
}

function createNodes(map, mapName) {
    nodes = {};

    let scaling = getMapScaling(map);

    // We're in the special entrance connecting mode
    if (pickingEntrances()) {
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

    createBossNodes(scaling, mapName);

    let checks = $('li[data-logic]').toArray()
                    .map(x => createCheck(x, mapName))
                    .filter(x => x.shouldDraw());

    for (const check of checks) {
        if (!localSettings.showOwnedPickups
            && check.isOwnedVanillaPickup()) {
            continue;
        }

        for (const coord of check.locations) {
            if ((['split', 'mixed'].includes(args.entranceshuffle)
                 && coord.indirect)
                || (args.entranceshuffle == 'simple'
                    && coord.indirect
                    && coord.inSimpleEntrance)) {
                continue;
            }

            let coordString = MapNode.nodeId(coord, scaling);

            if (!(coordString in nodes)) {
                nodes[coordString] = new MapNode(coord, scaling);
            }
            else {
                let node = nodes[coordString];

                if (node.entrance && !node.entrance.isFound()) {
                    continue;
                }
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

function createBossNodes(scaling, mapName) {
    for (const boss of bosses.filter(x => x.locations[0].map == mapName
                                          && ((args.boss != "default" && x.type == "boss")
                                              || (args.miniboss != "default" && x.type == "miniboss")))) {
        for (const loc of boss.locations) {
            let coordString = MapNode.nodeId(loc, scaling);
            let node = new MapNode(loc, scaling, null, boss);

            node.boss.mappedTo = bossMap[boss.id];

            nodes[coordString] = node;
        }
    }
}

function distributeChecks() {
    let checksByEntrance = {'landfill': [], 'bk_shop': []};
    let checksByConnector = {};
    let entrancesByConnector = {};
    let remappedNodes = [];
    let connectorsByCheckId = {};
    let shuffleConnectors = ['split', 'mixed'].includes(args.entranceshuffle);

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
                    && !Entrance.isFound(startHouse))
                || (args.dungeonshuffle
                    && node.entrance.isDungeon())) {
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
        node.checks = checksByEntrance[node.entrance.connectedTo()] ?? [];
    }
}

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

    let map = $(mapImg).closest('div.map-container');
    let parent = $(map).find('div.map-wrapper');
    createNodes(map, mapName);

    for (const nodeId in nodes) {
        let node = nodes[nodeId];
        let classes = node.iconClasses();
        let activeMap = getActiveMap();
        let difficulty = classes.includes('unmapped-entrance') ? node.entrance.difficulty : node.difficulty;

        node.updateAnimationClasses(classes, parent, animate);
        node.updateEntranceAttrs();
        node.updateOverlay(activeMap, graphicalMapSource != null, difficulty);

        $(node.graphic).attr({
            'class': classes.join(' '),
            'data-difficulty': node.difficulty,
        })

        updateTooltip(node.graphic);
    }

    drawLocation();

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
        $(node).find('.node-overlay-wrapper').empty();
    }
}

function nodeFromElement(element) {
    return nodes[$(element).attr('data-node-id')];
}