"use strict"

var nodes = {};
var pinned = null;

function removeNodes() {
    if (pinned == null) {
        pinned = $('[data-pinned]').attr('data-node-id');
    }

    removeNodeTooltips();
    $('.check-graphic').remove();
    $('#linkFace').remove();
}

function updateCheckSize() {
    checkSize = localSettings.checkSize / window.visualViewport.scale;
}

function createNodes(map, mapName) {
    nodes = {};

    updateCheckSize();
    let scaling = getMapScaling(map);

    // We're in the special entrance connecting mode
    if (pickingEntrances()) {
        createEntranceNodes(graphicalMapChoices, scaling, true);
        return;
    }

    let entrances = [...randomizedEntrances];
    if (localSettings.showVanillaEntrances) {
        entrances = entrances.concat(Object.keys(entranceMap));
    }

    entrances = entrances.filter(x => entranceDict[x].locations.map(loc => loc.map).includes(mapName));

    if (args.randomstartlocation && args.entranceshuffle == 'none' && Entrance.isFound(startHouse)) {
        if (!Entrance.connectedTo(startHouse)) {
            connectEntrances(startHouse, Entrance.connectedFrom(startHouse), false);
        }

        entrances = entrances.filter(x => !startLocations.includes(x));
        entrances.push(Entrance.connectedFrom(startHouse));
        entrances.push(startHouse);
    }

    if (entrances.length > 0) {
        if (args.randomstartlocation && !Entrance.isFound(startHouse)) {
            createEntranceNodes(startLocations, scaling);
        }
        else {
            createEntranceNodes(entrances, scaling);
        }
    }

    createBossNodes(scaling, mapName);

    let checks = checkAccessibility.filter(x => x.shouldDraw());
    let unclaimedChecks = {};

    for (const check of checks) {
        if (!localSettings.showOwnedPickups
            && check.isOwnedVanillaPickup()) {
            continue;
        }

        for (const coord of check.mapLocations(mapName)) {
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
                    unclaimedChecks[check.id] = check;
                    continue;
                }
            }

            nodes[coordString].checks.push(check);
        }
    }

    if (mapName == 'overworld') {
        distributeChecks(unclaimedChecks);
    }

    for (const key in nodes) {
        let node = nodes[key];
        node.update();

        if (node.canBeHidden()) {
            delete nodes[key];
        }
    }
}

function createEntranceNodes(entrances, scaling, update=false) {
    if (!entrances) {
        return;
    }

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

function distributeChecks(unclaimedChecks) {
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
            let connectorId = node.entrance.metadata.connector;
            let connector = connectorDict[connectorId];

            if (!(connectorId in checksByConnector)) {
                checksByConnector[connectorId] = new Set();
                entrancesByConnector[connectorId] = new Set();
            }

            if (connector && node.entrance.isFound()) {
                connector.checks.filter(x => x in unclaimedChecks)
                                .map(x => checksByConnector[connectorId].add(unclaimedChecks[x]));
            }

            node.checks.map(x => checksByConnector[connectorId].add(x));
            entrancesByConnector[connectorId].add(entranceId);
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

function drawNodes(mapName, animate=true, updateNdi=true) {
    let mapImg = document.querySelector(`img[data-mapname="${mapName}"]`);

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

    let activeMap = getActiveMap();
    let map = $(mapImg).closest('div.map-container');
    let parent = $(map).find('div.map-wrapper');
    createNodes(map, mapName);

    for (const nodeId in nodes) {
        let node = nodes[nodeId];
        let classes = node.iconClasses();
        let difficulty = classes.includes('unmapped-entrance') ? node.entrance.difficulty : node.difficulty;

        node.updateAnimationClasses(classes, parent, animate);
        node.updateEntranceAttrs();
        node.updateOverlay(activeMap, graphicalMapSource != null, difficulty, classes);

        $(node.graphic).attr({
            'class': classes.join(' '),
            'data-difficulty': node.difficulty,
        })

        updateTooltip(node.graphic);
    }

    drawLocation();

    removeOldNodes();

    if (pinned != null){
        let toPin = $(`[data-node-id="${pinned}"]`);

        if (toPin) {
            nodeSecondary(toPin[0]);
        }

        pinned = null;
    }

    if (!pickingEntrances() && updateNdi) {
        refreshMapNdi();
    }
}

function removeOldNodes() {
    let oldNodeIds = $('.check-graphic').toArray()
                         .map(x => $(x).attr('data-node-id'))
                         .filter(x => !(x in nodes));

    for (const staleNodeId of oldNodeIds) {
        let node = $(`[data-node-id="${staleNodeId}"]`);
        let tooltip = bootstrap.Tooltip.getInstance(node);

        if (tooltip._isShown()) {
            closeAllTooltips();
        }

        $(node).removeClass('animate__bounceInDown');
        $(node).addClass('animate__fadeOut');
        $(node).find('.node-overlay-wrapper').empty();
    }
}

function nodeFromElement(element) {
    return nodes[$(element).attr('data-node-id')];
}