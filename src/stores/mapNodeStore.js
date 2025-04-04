import { ref } from "vue";
import { defineStore } from "pinia";
import { MapNode } from "@/model/mapNode";
import { useStateStore } from "./stateStore";
import { useAccessibilityStore } from "./accessibilityStore";
import { bosses, connectEntrances, connectorDict, connectors, coupledEntrances, entranceDict, getMapScaling, inOutEntrances, pickingEntrances, vanillaConnectors } from "@/moduleWrappers";
import { Entrance } from "@/model/entrance";

export const useMapNodeStore = defineStore('mapNode', () => {
    const state = useStateStore();
    const accessibility = useAccessibilityStore();

    const nodes = ref({});
    const finalCheckSize = ref(null);

    // This needs to be done right
    // watch(finalCheckSize, () => {
    //     window.checkSize = finalCheckSize.value;
    // });

    function updateCheckSize() {
        finalCheckSize.value = state.settings.checkSize / window.visualViewport.scale;
        window.checkSize = finalCheckSize.value;
    }

    function createNodes(map, mapName) {
        let pinnedId = Object.values(nodes.value).filter(x => x.pinned);
        if (pinnedId.length) {
            pinnedId = pinnedId[0].id();
        }
        else {
            pinnedId = null;
        }
    
        Object.keys(nodes.value).map(x => delete nodes.value[x]);
    
        updateCheckSize();
        let scaling = getMapScaling(map);
    
        // We're in the special entrance connecting mode
        if (pickingEntrances()) {
            createEntranceNodes(graphicalMapChoices, scaling, true);
            return;
        }
    
        let entrances = [...state.randomizedEntrances];
        if (state.settings.showVanillaEntrances && (mapName != 'overworld' || state.args.overworld != 'alttp')) {
            entrances = entrances.concat(Object.keys(state.entranceMap).filter(x => !Entrance.isInside(x)));
        }
    
        entrances = entrances.filter(x => entranceDict[x].locations.map(loc => loc.map).includes(mapName));
    
        if (state.args.randomstartlocation
            && state.args.entranceshuffle == 'none'
            && Entrance.isMapped(state.startHouse)
            && mapName == "overworld") {
            if (!Entrance.connectedTo(state.startHouse)) {
                connectEntrances(state.startHouse, Entrance.connectedFrom(state.startHouse), false);
            }
    
            entrances = entrances.filter(x => !state.startLocations.includes(x));
            entrances.push(Entrance.connectedFrom(state.startHouse));
            entrances.push(state.startHouse);
        }
    
        if (entrances.length > 0) {
            if (state.args.randomstartlocation && !Entrance.isMapped(state.startHouse)) {
                createEntranceNodes(state.startLocations.filter(x => entranceDict[x].locations[0].map == mapName), scaling);
            }
            else {
                createEntranceNodes(entrances, scaling);
            }
        }
    
        createBossNodes(scaling, mapName);
        createLogicHintNodes(scaling, mapName);
    
        let checks = accessibility.checks?.filter(x => x.shouldDraw()) ?? [];
        let unclaimedChecks = {};
    
        for (const check of checks) {
            if (!state.settings.showOwnedPickups
                && check.isOwnedVanillaPickup()) {
                continue;
            }
    
            for (const coord of check.mapLocations(mapName)) {
                if ((!vanillaConnectors()
                     && coord.indirect)
                    || (state.args.entranceshuffle == 'simple'
                        && coord.indirect
                        && coord.inSimpleEntrance)) {
                    continue;
                }
    
                let coordString = MapNode.nodeId(coord, scaling);
    
                if (!(coordString in nodes.value)) {
                    nodes.value[coordString] = new MapNode(coord, scaling);
                    if (coordString == pinnedId) {
                        nodes.value[coordString].pinned = true;
                    }
                }
                else {
                    let node = nodes.value[coordString];
                    let entranceId = node.entrance?.id;
    
                    if (entranceId && !Entrance.isInside(entranceId)) {
                        entranceId = Entrance.getInsideOut(entranceId);
                    }
    
                    if (node.entrance && !Entrance.isFound(entranceId)) {
                        unclaimedChecks[check.id] = check;
                        continue;
                    }
                }
    
                nodes.value[coordString].checks.push(check);
            }
        }
    
        if (mapName == 'overworld') {
            distributeChecks(unclaimedChecks);
        }
    
        for (const key in nodes.value) {
            let node = nodes.value[key];
            node.update();
    
            if (node.canBeHidden()) {
                delete nodes.value[key];
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
    
            if (!(coordString in nodes.value)) {
                let node = new MapNode(entranceData.locations[0], scaling, entranceData.id);
                
                if (node.entrance != null && !node.entrance.shouldDraw()) {
                    node.hideMe = true;
                }
    
                nodes.value[coordString] = node;
    
                if (update) {
                    node.update();
                }
            }
        }
    }

    function createBossNodes(scaling, mapName) {
        for (const boss of bosses.filter(x => x.locations[0].map == mapName
                                              && ((state.args.boss != "default" && x.type == "boss")
                                                  || (state.args.miniboss != "default" && x.type == "miniboss")))) {
            for (const loc of boss.locations) {
                let coordString = MapNode.nodeId(loc, scaling);
                let node = new MapNode(loc, scaling, null, boss);
    
                node.boss.mappedTo = state.bossMap[boss.id];
    
                nodes.value[coordString] = node;
            }
        }
    }

    function createLogicHintNodes(scaling, mapName) {
        if (!state.settings.showLogicHints) {
            return;
        }

        for (const hint of accessibility.logicHints.filter(x => x.locations[0].map == mapName && (!x.metadata.condition || x.metadata.condition(state.args, state.settings)))) {
            for (const loc of hint.locations) {
                let coordString = MapNode.nodeId(loc, scaling);
                nodes.value[coordString] = new MapNode(loc, scaling, null, null, hint);
            }
        }
    }

    function distributeChecks(unclaimedChecks) {
        let checksByEntrance = {'landfill': [], 'bk_shop': []};
        let checksByConnector = {};
        let entrancesByConnector = {};
        let remappedNodes = [];
        let connectorsByCheckId = {};
    
        connectors.map(connector => connector.checks.map(checkId => connectorsByCheckId[checkId] = connector));
    
        for (const key in nodes.value) {
            let node = nodes.value[key];
    
            if(node.entrance == null 
               && !vanillaConnectors()
               && inOutEntrances()
               && coupledEntrances()
               && node.checks.some(x => x.id in connectorsByCheckId)) {
                let check = node.checks.filter(x => x.id in connectorsByCheckId)[0];
                let connector = connectorsByCheckId[check.id];
                node.entrance = new Entrance(connector.entrances[0]);
                node.hideMe = true;
            }
    
            if (node.entrance == null) {
                continue;
            }
    
            let entranceId = node.entrance.id;
            if (!vanillaConnectors()
                && inOutEntrances()
                && coupledEntrances()
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
                entrancesByConnector[connectorId].add(Entrance.getInside(entranceId));
            }
            else {
                let id = entranceId;
    
                if (!Entrance.isInside(id)) {
                    id = Entrance.getInsideOut(id);
                }
    
                checksByEntrance[id] = node.checks;
            }
    
            if (!node.entrance.isMapped()) {
                if (state.args.entranceshuffle != 'none'
                    || (node.entrance.canBeStart()
                        && !Entrance.isMapped(state.startHouse))
                    || (state.args.dungeonshuffle
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
            let id = node.entrance.connectedTo();
            node.checks = checksByEntrance[id] ?? [];
        }
    }

    window.createNodes = createNodes;
    window.nodes = nodes.value;

    return {
        nodes,
    };
});