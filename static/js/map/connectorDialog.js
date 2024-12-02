"use strict"

function startGraphicalConnection(entranceId, type) {
    closeAllTooltips();

    graphicalMapOriginalMap = getActiveMap();

    if (['underworld', 'overworld'].includes(type)
        && type != graphicalMapOriginalMap) {
        openTab(type);
    }

    if (type == 'simple') {
        openTab('overworld');
    }

    graphicalMapType = type;
    graphicalMapSource = entranceId;
    graphicalMapChoices = new Set(Entrance.validConnections(entranceId, type).map(x => x[0]));
    graphicalMapChoices.delete('bk_shop');
    $('#overworldTabContent').mousemove(connectorMouseMove);
    $('#underworldTabContent').mousemove(connectorMouseMove);
    
    drawActiveTab();
}

function endGraphicalConnection(destId = null) {
    let originalSource = graphicalMapSource;

    graphicalMapSource = null;
    graphicalMapChoices = null;

    $('#mouseTracker').connections('remove');
    $('#underworldTabContent').off('mousemove');
    $('#mouseTracker').remove();
    $('#overworldTabContent').off('mousemove');
    $('#underworldTabContent').off('mousemove');

    if (destId != null) {
        if (inOutEntrances()) {
            destId = Entrance.getInsideOut(destId);
        }

        connectEntrances(originalSource, destId);
    }
    else if(originalSource != null) {
        skipNextAnimation = true;
        refreshCheckList();
    }

    // if (graphicalMapOriginalMap != getActiveMap()) {
    //     openTab(graphicalMapOriginalMap);
    //     graphicalMapOriginalMap = null;
    // }

    drawActiveTab();
}

function openDeadEndDialog(entranceId) {
    closeAllTooltips();
    graphicalMapType = "connector";
    graphicalMapSource = entranceId;
    openConnectorDialog('deadEnd');
}

function openConnectorDialog(entranceId) {
    let connector = null;

    let skipModal = false;
    let isDeadEnd = entranceId == 'deadEnd';

    if (!isDeadEnd) {
        connector = Connection.findConnector({ exterior: entranceId })
                    ?? Connection.findConnector({ exterior: graphicalMapSource });

        if (connector != null){
            let unmappedEntrances = Connection.unmappedEntrances(connector);
            if (unmappedEntrances.length == 1) {
                if (Entrance.isMapped(graphicalMapSource)) {
                    graphicalMapSource = entranceId;
                }

                entranceId = 'deadEnd';
                isDeadEnd = true;
                skipModal = true;
            }
        }
    }

    $('.item-requirement:checked').map((x, y) => $(y).prop('checked', false));
    $('#connector-blockers').show();
    $('#connectorModal').attr('data-destination', entranceId)
    $('#entranceAlert').hide();
    $('#deadEndEntranceAlert').hide();

    filterConnectors();
    setModalPage(1);

    if (isDeadEnd) {
        $('#connectToWarning').hide();
        $('.simple-connector').addClass('d-none');
    }
    else {
        $('#connectToWarning').hide();
        $('.simple-connector').removeClass('d-none');
    }

    if (!skipModal) {
        new bootstrap.Modal('#connectorModal', null).show();
    }

    if (connector != null) {
        connectorDetail(connector.id);
    }
}

function filterConnectors() {
    // let isDeadEnd = $('#connectorModal').attr('data-destination') == 'deadEnd';
    let obstacles = $('.item-requirement:checked').map((x, y) => $(y).attr('data-item'));
    let validConnectors = [...connectors]/*.filter(x => x.entrances.length > 2
                                                      || x.checks.length > 0
                                                      || x.obstacleTypes.includes('ONEWAY')
                                                      || isDeadEnd);*/

    for (const obstacle of obstacles) {
        validConnectors = validConnectors.filter(x => x.obstacleTypes.includes(obstacle));
    }

    fillConnectorGrid(validConnectors);
}

function fillConnectorGrid(connectors) {
    const connectorTemplate = `
<div class="row connector-row py-1" onclick="connectorDetail('{connectorId}')">
    <div class="col">
        <div class="row">
            <div class="col">
                <h5>{connectorName}</h5>
            </div>
        </div>
        <div class="row">
            {entranceImages}
        </div>
    </div>
</div>
<hr class="my-1">
`
    const imageTemplate = `
<div class="col-auto">
    <img src="static/images/{entranceImage}.png">
</div>
    `

    let grid = ('#connectorGrid');

    $(grid).empty();

    for (const connector of connectors) {
        let connection = Connection.existingConnection(connector);

        if (connection != null
            && (connection.entrances.length / 2 >= connector.entrances.length
                || connection.vanilla)) {
            continue;
        }

        let usedIds = new Set();
        let images = '';

        for (const entranceId of connector.entrances) {
            let id = entranceDict[entranceId].interiorImage;
            images += imageTemplate.replace('{entranceImage}', 'entrances/' + id);
            usedIds.add(id);
        }

        for (const checkId of connector.checks) {
            let id = coordDict[checkId].image;
            if(!usedIds.has(id.split('-')[0])) {
                images += imageTemplate.replace('{entranceImage}', 'checks/' + coordDict[checkId].image);
            }
        }

        let row = connectorTemplate.replace('{connectorId}', connector.id)
                                   .replace('{connectorName}', connector.name)
                                   .replace('{entranceImages}', images);

        $(grid).append(row);
    }
}

function setModalPage(pageNo) {
    $('[data-page]').hide();
    $(`[data-page="${pageNo}"]`).show();
}

function connectorDetail(connectorId) {
    const imageTemplate = `
<div class="col-auto connector-item p-3 m-1 {hidden}" onclick="toggleConnectorItem('{type}', '{id}')" data-type="{type}" data-id="{id}">
    <img class="" src="static/images/{image}.png">
</div>`

    let isDeadEnd = $('#connectorModal').attr('data-destination') == 'deadEnd';
    let grid = isDeadEnd ? $('#deadEndConnectorDetailGrid') : $('#connectorDetailGrid');
    let connector = connectorDict[connectorId];
    let unmappedEntrances = Connection.unmappedEntrances(connector);

    let hideEntrances = (!isDeadEnd && connector.entrances.length == 2)
                        || (isDeadEnd && unmappedEntrances.length == 1);

    $(grid).empty();
    $(grid).attr('data-connector-id', connectorId);

    for (const entranceId of connector.entrances) {
        let item = imageTemplate.replaceAll('{image}', 'entrances/' + entranceDict[entranceId].interiorImage)
                                .replaceAll('{type}', 'entrance')
                                .replaceAll('{hidden}', hideEntrances ? 'hidden' : '')
                                .replaceAll('{id}', Entrance.getInsideOut(entranceId));

        $(grid).append(item);
    }

    let connection = Connection.existingConnection(connector);
    if (!isDeadEnd && connection != null) {
        let interior = Entrance.connectedTo(connection.entrances[0]);
        let item = $(`.connector-item[data-type="entrance"][data-id="${interior}"]`);
        $(item).addClass('checked');

        $('#connectorDoneButton').click();
    }
    else if (hideEntrances) {
        if (isDeadEnd && unmappedEntrances.length == 1) {
            $(`#deadEndConnectorDetailGrid .connector-item[data-id="${Entrance.getInsideOut(unmappedEntrances[0])}"]`).addClass('checked');
        }

        $(`.connector-item[data-type="check"]`).addClass('checked');
        $('#connectorDoneButton').click();
    }
    else {
        setModalPage(isDeadEnd ? 3 : 2);
    }
}

function toggleConnectorItem(type, id, recurse=true) {
    if (recurse && type == 'entrance') {
        $('.connector-item.checked[data-type="entrance"]')
            .filter((x, y) => $(y).attr('data-id') != id)
            .map((x, y) => toggleConnectorItem(type, $(y).attr('data-id'), false));
    }

    let item = $(`.connector-item[data-type="${type}"][data-id="${id}"]`);

    if ($(item).hasClass('checked')) {
        $(item.removeClass('checked'));
    }
    else {
        $(item.addClass('checked'));
    }
}

function connectConnectors(simple=true) {
    let source = graphicalMapSource;
    let destination = $('#connectorModal').attr('data-destination');

    if (simple) {
        connectExteriors(source, null, destination, null);
    }
    else if (destination != 'deadEnd') {
        let uncheckedEntranceIds = $('#connectorDetailGrid .connector-item[data-type="entrance"]:not(.checked)')
                              .map((x, y) => $(y).attr('data-id'))
                              .sort((a, b) => entranceDict[a].oneWayBlocked ? 1 : -1);
        
        if (uncheckedEntranceIds.length > 2) {
            $('#entranceAlert').show();
            return;
        }

        connectExteriors(source, uncheckedEntranceIds[0], destination, uncheckedEntranceIds[1]);

        let connector = Connection.findConnector({ interior: uncheckedEntranceIds[0] });
        let otherSide = connector.entrances.filter(x => Entrance.isFound(x) && !Entrance.isConnected(Entrance.connectedFrom(x)))
                                            .map(x => Entrance.connectedFrom(x))[0] ?? null;

        if (otherSide != null) {
            let otherInterior = Entrance.connectedTo(otherSide);
            connectExteriors(source, uncheckedEntranceIds[0], otherSide, otherInterior);
        }
    }
    else {
        let checkedEntranceIds = $('#deadEndConnectorDetailGrid .connector-item.checked[data-type="entrance"]')
                              .map((x, y) => $(y).attr('data-id'))
                              .sort((a, b) => entranceDict[a].oneWayBlocked ? 1 : -1);
        
        if (checkedEntranceIds.length != 1) {
            $('#deadEndEntranceAlert').show();
            return;
        }

        connectOneEndConnector(source, checkedEntranceIds[0]);
    }

    $('#modalClose').click();
}

function spoilConnectors() {
    let source = graphicalMapSource;
    let destination = $('#connectorModal').attr('data-destination');

    spoilEntrance(source, false);
    spoilEntrance(destination);

    $('#modalClose').click();
}