"use strict"

function saveChecked() {
    localStorage.setItem('checkedChecks', JSON.stringify([...checkedChecks]));
}

function saveEntrances() {
    localStorage.setItem('entranceMap', JSON.stringify(entranceMap));
    localStorage.setItem('connections', JSON.stringify(connections));
}

function saveLocations() {
    saveChecked();
    saveEntrances();
}

function loadLocations() {
    let checkedErrors = loadChecked() ?? [];
    let entranceErrors = loadEntrances() ?? [];

    refreshTextChecks();

    return checkedErrors.concat(entranceErrors);
}

function loadEntrances() {
    let errors = [];

    try {
        entranceMap = JSON.parse(localStorage.getItem('entranceMap'));
        pruneEntranceMap();
    }
    catch (err) {
        errors.push(err);
    }

    if (entranceMap == null) {
        entranceMap = {};
    }

    try {
        let dehydratedConnections = JSON.parse(localStorage.getItem('connections'));
        connections = [];
        for (const conn of dehydratedConnections) {
            connections.push(new Connection(conn.entrances, null, conn.label, conn.vanilla));
        }
    }
    catch (err) {
        errors.push(err);
    }

    if (connections == null) {
        connections = [];
    }

    return errors;
}

function loadChecked() {
    try {
        checkedChecks = JSON.parse(localStorage.getItem('checkedChecks'));
    }
    catch (err) {
    }

    if (checkedChecks == null) {
        checkedChecks = new Set();
    }

    updateState();
}

function resetLocations() {
    resetEntrances();
    resetChecks();
}

function resetEntrances() {
    entranceMap = {};
    reverseEntranceMap = {};
    connections = [];
    saveEntrances();
}

function resetChecks() {
    checkedChecks = new Set();
    saveChecked();
}

function pruneEntranceMap() {
    if (randomizedEntrances == null) {
        return;
    }

    for (const entrance in entranceMap) {
        let mappedEntrance = entranceMap[entrance];

        if (Entrance.isVanilla(entrance)) {
            continue;
        }

        if (!randomizedEntrances.includes(entrance)) {
            Connection.disconnect(entrance);
            delete entranceMap[entrance];
        }
        else if (!['landfill', 'bk_shop'].includes(mappedEntrance) && !randomizedEntrances.includes(mappedEntrance)) {
            Connection.disconnect(entrance);
            delete entranceMap[entrance];
        }
    }

    for (const entrance in reverseEntranceMap) {
        if (Entrance.isVanilla(entrance)) {
            continue;
        }

        if (!['landfill', 'bk_shop'].includes(entrance) && !randomizedEntrances.includes(entrance)) {
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
                                            .map(x => Entrance.connectedFrom(x))[0] ?? null;

        if (otherSide != null) {
            let otherInterior = Entrance.connectedTo(otherSide);
            connectExteriors(outdoors, indoors, otherSide, otherInterior, refresh);
        }
        else {
            connectEntrances(outdoors, indoors, refresh);
        }
    }
}

function connectEntrances(from, to, refresh=true) {
    if (refresh) {
        pushUndoState();
    }

    console.assert(to != 'clear');
    // if (to == 'clear') {
    //     delete entranceMap[from];
    // }
    // else {
    entranceMap[from] = to;
    // }

    skipNextAnimation = true;

    saveEntrances();
    closeAllTooltips();

    if (refresh) {
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
        for (const start of startLocations) {
            if (entranceMap[start] == startHouse) {
                delete entranceMap[start];
            }
        }

        entranceMap[entranceId] = startHouse;
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
        if (conn.entrances.length == 2) {
            delete entranceMap[conn.otherSide(entranceId)];
        }
    }

    Connection.disconnect(entranceId);
    delete entranceMap[entranceId];
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

    if (connection != null && connection.entrances.length == 2) {
        otherSide = connection.otherSide(entranceId);
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

function connectExteriors(from, fromInterior, to, toInterior, refresh=true, save=true) {
    if (refresh) {
        pushUndoState();
    }

    let connector = Connection.findConnector({ interior: fromInterior });
    let connection = Connection.existingConnection(connector);
    
    if (connection == null || connector.id == 'outer_rainbow') {
        entranceMap[from] = fromInterior;
        entranceMap[to] = toInterior;
    }
    else {
        if (connection.entrances.includes(from)) {
            entranceMap[to] = toInterior;
        }
        else {
            entranceMap[from] = fromInterior;
        }
    }

    Connection.createConnection([from, to], Entrance.isVanilla(from));

    skipNextAnimation = true;

    closeAllTooltips();

    if (save) {
        saveEntrances();
    }

    if (refresh) {
        refreshCheckList();
    }
}