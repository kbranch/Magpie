"use strict"

function saveChecked() {
    setLocalStorage('checkedChecks', JSON.stringify([...checkedChecks]));

    vueApp.updateChecked(checkedChecks);

    rateLimit(sharingLiveUpdate, 1000);

    if (typeof broadcastMap === 'function') {
        broadcastMap();
    }
}

function saveEntrances() {
    setLocalStorage('entranceMap', JSON.stringify(entranceMap));
    setLocalStorage('connections', JSON.stringify(connections));

    rateLimit(sharingLiveUpdate, 1000);

    if (typeof broadcastMap === 'function') {
        broadcastMap();
    }
}

function saveHints() {
    setLocalStorage('hints', JSON.stringify([...hints]));

    rateLimit(sharingLiveUpdate, 1000);

    vueApp.updateHints(hints);
}

function saveLocationHistory() {
    setLocalStorage('locationHistory', JSON.stringify([...locationHistory]));

    rateLimit(sharingLiveUpdateLocation, 1000);
}

function saveLocations() {
    saveChecked();
    saveEntrances();
    saveHints();
    saveLocationHistory();
}

function loadLocations() {
    let checkedErrors = loadChecked() ?? [];
    let entranceErrors = loadEntrances() ?? [];
    let hintErrors = loadHints() ?? [];
    let historyErrors = loadLocationHistory() ?? [];

    return checkedErrors.concat(entranceErrors).concat(hintErrors).concat(historyErrors);
}

function loadLocationHistory() {
    let errors = [];
    let storedHistory = null;

    try {
        storedHistory = JSON.parse(getLocalStorage('locationHistory'));
    }
    catch (err) {
        errors.push(err);
    }

    if (storedHistory == null) {
        storedHistory = [];
    }

    locationHistory.length = 0;
    storedHistory.map(x => locationHistory.push(x));

    return errors;
}

function loadEntrances() {
    let errors = [];

    try {
        entranceMap = JSON.parse(getLocalStorage('entranceMap'));

        if (updateInsideEntrances) {
            for (const entrance in entranceMap) {
                let mappedTo = entranceMap[entrance];
                if (!Entrance.isInside(mappedTo) && mappedTo != 'landfill') {
                    let inside = Entrance.getInside(mappedTo)
                    entranceMap[entrance] = inside;
                    entranceMap[inside] = entrance;
                }
            }
        }

        pruneEntranceMap();
    }
    catch (err) {
        errors.push(err);
    }

    if (entranceMap == null) {
        entranceMap = {};
    }

    try {
        connections = [];

        let raw = getLocalStorage('connections');

        if (raw) {
            let dehydratedConnections = JSON.parse(raw);
            connections = hydrateConnections(dehydratedConnections);
        }
    }
    catch (err) {
        errors.push(err);
    }

    if (connections == null) {
        connections = [];
    }

    updateInsideEntrances = false;

    return errors;
}

function hydrateConnections(dehydratedConnections) {
    let hydrated = [];

    for (const conn of dehydratedConnections) {
        if (updateInsideEntrances) {
            for (const entrance of [...conn.entrances]) {
                conn.entrances.push(entranceMap[entrance]);
            }
        }

        hydrated.push(new Connection(conn.entrances, null, conn.label, conn.vanilla, conn.map));
    }

    return hydrated;
}

function loadChecked() {
    try {
        checkedChecks = JSON.parse(getLocalStorage('checkedChecks'));
    }
    catch (err) {
    }

    if (checkedChecks == null) {
        checkedChecks = new Set();
    }

    updateState();
}

function loadHints() {
    try {
        hints = JSON.parse(getLocalStorage('hints'));
    }
    catch (err) {
    }

    if (hints == null) {
        hints = [];
    }

    vueApp.updateHints(hints);
}

function resetLocations() {
    resetEntrances();
    resetChecks();
    resetHints();
}

function resetEntrances() {
    entranceMap = {};
    reverseEntranceMap = {};
    connections = [];
    saveEntrances();
}

function resetHints() {
    hints = [];
    saveHints();
}

function resetChecks(resetVanillaOwls=true) {
    if (resetVanillaOwls) {
        checkedChecks = new Set();
    }
    else {
        checkedChecks = new Set([...checkedChecks].filter(x => Check.isVanillaOwl(x)));
    }

    saveChecked();
}

function pruneEntranceMap() {
    if (!randomizedEntrances) {
        return;
    }

    for (const entrance in entranceMap) {
        let mappedEntrance = entranceMap[entrance];

        if (String(entrance) == "null" || String(mappedEntrance) == "null") {
            delete entranceMap[entrance];
            continue;
        }

        if (Entrance.isVanilla(entrance)) {
            continue;
        }

        if (!randomizedEntrances.includes(entrance)) {
            Connection.disconnect(entrance);
            delete entranceMap[entrance];
        }
        else if (!['landfill', 'bk_shop', 'bk_shop:inside'].includes(mappedEntrance) && !randomizedEntrances.includes(mappedEntrance)) {
            Connection.disconnect(entrance);
            delete entranceMap[entrance];
        }
    }

    for (const entrance in reverseEntranceMap) {
        if (Entrance.isVanilla(entrance)) {
            continue;
        }

        if (!['landfill', 'bk_shop', 'bk_shop:inside'].includes(entrance) && !randomizedEntrances.includes(entrance)) {
            Connection.disconnect(reverseEntranceMap[entrance]);
            delete entranceMap[reverseEntranceMap[entrance]];
        }
    }

    if (!args.randomstartlocation) {
        if (startHouse in entranceMap) {
            delete entranceMap[startHouse];
        }
        if (startHouse in reverseEntranceMap) {
            delete entranceMap[reverseEntranceMap[startHouse]];
        }
    }

    saveEntrances();
}

function updateReverseMap() {
    reverseEntranceMap = Object.entries(entranceMap)
                               .reduce((rev, [key, value]) => (rev[value] = key, rev), {});
}

function connectOneEndConnector(outdoors, indoors, refresh=true) {
    let connector = Connection.findConnector({ interior: indoors });
    let connection = Connection.existingConnection(connector);

    if (connection != null) {
        let to = connection.entrances[0];
        let toInterior = Entrance.connectedTo(to);
        connectExteriors(outdoors, indoors, to, toInterior, refresh);
    }
    else {
        if (connector == null) {
            throw new Error(`Unable to map ${interior} to a connector`);
        }

        let otherSide = connector.entrances.filter(x => Entrance.isFound(x))
                                            .map(x => Entrance.connectedFrom(Entrance.getInsideOut(x)))[0] ?? null;

        if (otherSide != null) {
            let otherInterior = Entrance.connectedTo(otherSide);
            connectExteriors(outdoors, indoors, otherSide, otherInterior, refresh);
        }
        else {
            connectEntrances(outdoors, indoors, refresh);
        }
    }
}

function connectEntrances(from, to, refresh=true, save=true) {
    if (refresh) {
        pushUndoState();
    }

    if (['clear', 'null'].includes(String(to)) || String(from) == 'null') {
        throw new Error(`Invalid entrance connection (${from}:${to})`);
    }

    entranceMap[from] = to;

    if (coupledEntrances()) {
        entranceMap[to] = from;
    }

    if (save) {
        saveEntrances();
    }

    if (refresh) {
        skipNextAnimation = true;

        closeAllTooltips();
        refreshCheckList();
    }
}

function setStartLocation(entranceId) {
    pushUndoState();

    if (args.entranceshuffle == 'none') {
        for (const start of startLocations) {
            if (entranceMap[start] == startHouse && start != startHouse) {
                entranceMap[start] = entranceMap[startHouse];
                break;
            }
        }

        entranceMap[entranceId] = startHouse;
        entranceMap[startHouse] = entranceId;
    }
    else {
        if (startHouse in entranceMap) {
            clearEntranceMapping(startHouse, false);
        }

        connectEntrances(startHouse, entranceId);
        Connection.advancedErConnection([startHouse, entranceId], entranceDict[entranceId].locations[0].map);
        // for (const start of startLocations) {
        //     if (entranceMap[start] == startHouse) {
        //         delete entranceMap[start];
        //     }
        // }

        // entranceMap[entranceId] = startHouse;
    }

    saveEntrances();
    updateReverseMap();
    closeAllTooltips();
    refreshCheckList();
}

function clearEntranceMapping(entranceId, housekeeping=true) {
    if (housekeeping) {
        pushUndoState();
    }

    if (args.entranceshuffle == 'none'
        && entranceMap[entranceId] == startHouse) {
        delete entranceMap[startHouse];
    }

    if (Entrance.isConnected(entranceId)) {
        let conn = Entrance.mappedConnection(entranceId);
        if (coupledEntrances() && conn.entrances.length == 4) {
            delete entranceMap[entranceMap[conn.otherSide(entranceId)]];
            delete entranceMap[conn.otherSide(entranceId)];
        }
    }

    Connection.disconnect(entranceId);
    if (coupledEntrances()) {
        delete entranceMap[entranceMap[entranceId]];
    }

    if (entranceId in entranceMap) {
        delete entranceMap[entranceId];
    }
    else {
        delete entranceMap[reverseEntranceMap[entranceId]];
    }


    updateReverseMap();

    if (housekeeping) {
        saveEntrances();
        closeAllTooltips();
        refreshCheckList();
    }
}

function mapToLandfill(entranceId) {
    pushUndoState();

    let otherSide = null;
    // let connector = Connection.findConnector({ exterior: entranceId });
    let connection = Connection.existingConnectionByEntrance(entranceId);

    if (connection != null && connection.entrances.length == 4) {
        otherSide = connection.otherSide(entranceId);
    }
    else if (coupledEntrances()) {
        otherSide = entranceMap[entranceId];
    }

    Connection.disconnect(entranceId);

    entranceMap[entranceId] = 'landfill';

    if (otherSide != null) {
        entranceMap[otherSide] = 'landfill';
    }

    saveEntrances();
    closeAllTooltips();
    refreshCheckList();
}

function connectExteriors(from, fromInterior, to, toInterior, refresh=true, save=true, simple=false) {
    if (refresh) {
        pushUndoState();
    }

    if (!simple) {
        let connector = Connection.findConnector({ interior: fromInterior });
        let connection = Connection.existingConnection(connector);
    
        if (connection == null || connector.id == 'outer_rainbow') {
            connectEntrances(from, fromInterior, false, save);
            connectEntrances(to, toInterior, false, save);
        }
        else {
            if (connection.entrances.includes(from)) {
                connectEntrances(to, toInterior, false, save);
            }
            else {
                connectEntrances(from, fromInterior, false, save);
            }
        }
    }
    else {
        connectEntrances(from, to, false, save);
    }
     
    let entrances = [from, to];

    if (coupledEntrances() && fromInterior && toInterior) {
        entrances.push(entranceMap[from]);
        entrances.push(entranceMap[to]);
    }

    Connection.createConnection(entrances, Entrance.isVanilla(from), null, simple);

    if (save) {
        saveEntrances();
    }

    if (refresh) {
        skipNextAnimation = true;

        closeAllTooltips();
        refreshCheckList();
    }
}

function checkCheck(id) {
    checkedChecks.add(id);

    if (id in allChecksById) {
        for (const check of allChecksById[id]) {
            check.updateChecked();
        }
    }
}

function uncheckCheck(id) {
    checkedChecks.delete(id);

    if (id in allChecksById) {
        for (const check of allChecksById[id]) {
            check.updateChecked();
        }
    }
}