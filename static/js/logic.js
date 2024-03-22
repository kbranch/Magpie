"use strict"

function openCheckLogicViewer(checkId) {
    closeAllTooltips();
    
    let dialogTitle = document.getElementById('logicModalLabel');
    let dialogBody = document.getElementById('logicBody');

    if (!(checkId in nodeByCheck)) {
        dialogTitle.innerHTML = "Check not found";
        dialogBody.innerHTML = "Check not found in logic graph";

        new bootstrap.Modal(document.getElementById('logicModal')).show();

        return;
    }

    let node = nodeByCheck[checkId];
    openLogicViewer(node.id);
}

function openLogicViewer(nodeId, open=true) {
    let dialogTitle = document.getElementById('logicModalLabel');
    let dialogBody = document.getElementById('logicBody');

    let node = logicGraph[nodeId];
    let checksSection = '';
    let connectionsSection = '';

    for (const checkId of node.checks) {
        if (!(checkId in checksById)) {
            continue;
        }

        let check = checksById[checkId];

        checksSection += `
<div class="text-start d-flex p-1 mb-0 align-items-center" data-check-id="${checkId}">
    <div class="tooltip-check-graphic difficulty-${check.difficulty}${check.behindKeys ? ' behind-keys' : ''}${check.requiredRupees ? ' requires-rupees' : ''}${check.behindTrackerLogic ? ' behind-tracker' : ''}${check.isVanilla ? ' vanilla' : ''}${check.isVanillaOwl() ? ' owl' : ''} align-middle">
        <div class="tooltip-check-graphic icon-wrapper">
            <div class="behind-rupees-overlay"></div>
            <div class="behind-keys-overlay"></div>
            <div class="behind-tracker-overlay"></div>
            <div class="owl-overlay"></div>
            <svg class="tooltip-check-graphic align-middle"><use xlink:href="#difficulty-${check.difficulty}${check.isVanilla ? '-vanilla' : ''}"></use></svg>
            ${check.hollow ? `<svg class="icon hollow text-icon">
                <use xlink:href="#difficulty-${check.difficulty}-hollow"></use>
            </svg>` : ''}
        </div>
    </div>
    <div class="tooltip-text ps-2">
        <span class="tooltip-text-span">${check.metadata.name} (${check.id})</span>
    </div>
</div>
`;
    }

    for (const connection of node.connections) {
        if (!(connection.to in logicGraph)) {
            continue;
        }

        connectionsSection += `
<tr onclick="openLogicViewer(\`${connection.to}\`, false)">
    <td>
    <div class="text-start d-flex p-1 mb-0 align-items-center">
        <div class="tooltip-check-graphic difficulty-${connection.diff} align-middle">
            <div class="tooltip-check-graphic icon-wrapper">
                <svg class="tooltip-check-graphic align-middle"><use xlink:href="#difficulty-${connection.diff}"></use></svg>
            </div>
        </div>
    </div>
    </td>
    <td>${getLogicNodeName(connection.to)}</td>
    <td>${iconifyRequirement(connection.shortReq ? connection.shortReq : connection.req)}</td>
</tr>
`;
    }

    dialogTitle.innerHTML = `Viewing node '${getLogicNodeName(node.id)}'`;
    dialogBody.innerHTML = 
`<h5>${node.id}</h5>
<h6>Checks:</h6>
<div>
    ${checksSection ? checksSection : 'None'}
</div>
<h6 class="pt-3">Connections:</h6>
<div>
    <table class="table table-dark table-hover">
        <thead>
            <tr>
                <th scope="col"></th>
                <th scope="col">To</th>
                <th scope="col">Requirements</th>
            </tr>
        </thead>
        <tbody>
            ${connectionsSection}
        </tbody>
    </table>
</div>
`;

    let tooltipTriggerList = dialogBody.querySelectorAll('[data-bs-toggle="tooltip"]')
    let tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, { sanitize: false }))

    if (open) {
        new bootstrap.Modal(document.getElementById('logicModal')).show();
    }
}

function iconifyRequirement(requirement) {
    const itemRegex = /([^\/A-Z_1-8]|^)('?[A-Z_1-8]{3,}'?)/g;
    const quoteRegex = /\/'([A-Z_1-8]{2,})'_1\.png/g;
    const tooltipRegex = /(\w+)\(([^\)]+)\)/g;
    const wrapperRegex = /\((?:and|or)\[('[A-Z_1-8]{3,}')\]\)/g;

    requirement = requirement
        .replaceAll('\\', '')
        .replaceAll('"', '')
        .replaceAll("and['TRUE']", 'None')
        .replaceAll("or['FALSE']", 'Disabled')
        .replace(wrapperRegex, '($1)')
        .replace(itemRegex, `$1<img class="logic-item" src="/static/images/$2_1.png">`)
        .replace(quoteRegex, '/$1_1.png')
        .replaceAll("'", "")
        .replace(tooltipRegex, `<span data-bs-toggle='tooltip' data-bs-custom-class="secondary-tooltip" data-bs-html='true' data-bs-title='$2'>$1</span>`);

    return requirement
}

function getLogicNodeName(nodeId) {
    if (nodeId in coordDict) {
        return `${coordDict[nodeId].name} (${nodeId})`;
    }

    return nodeId;
}