"use strict"

function getCheckedKey(area, name) {
    return `${area}-${name}`;
}

function toggleNode(node) {
    let toggleList = new Set(node.checks.filter(x => (x.nodeDifficulty() == node.difficulty
                                                      && x.behindKeys == node.behindKeys
                                                      && !x.isChecked()
                                                      && (!x.isVanillaOwl() || node.isOnlyVanillaOwls()))
                                                     || (x.isChecked() && node.isChecked)
                                                     )
                                        .map(x => x.id));

    if (toggleList.size == 0 
        && node.entrance) {
        if (!node.entrance.isMapped()) {
            mapToLandfill(node.entrance.id);
        }
        else if(node.entrance.connectedTo() == 'landfill') {
            clearEntranceMapping(node.entrance.id);
        }
    }
    else {
        toggleChecks(toggleList);
    }

    drawActiveTab();
    refreshTextChecks()

    if (toggleList.has('0x07B-Trade')) {
        refreshCheckList();
    }
}

function toggleSingleNodeCheck(check) {
    let id = $(check).attr('data-check-id');
    toggleCheck(null, id);
}

function toggleChecks(checkIds) {
    let itemsChanged = false;

    pushUndoState();

    for (const id of checkIds) {
        itemsChanged |= toggleCheck(null, id, false, false);
    }

    if (itemsChanged) {
        refreshCheckList();
    }
}

function toggleCheck(event, id, draw=true, pushUndo=true) {
    let itemsChanged = false;

    if (pushUndo) {
        pushUndoState();
    }

    if (Check.isChecked(id)) {
        checkedChecks.delete(id);
        itemsChanged = moveCheckFromChecked(id, true);
    }
    else {
        checkedChecks.add(id);
        itemsChanged = moveCheckToChecked(id, true);
    }

    saveChecked();

    checksById[id].updateChecked();

    preventDoubleClick(event);

    if (draw) {
        drawActiveTab();
        refreshTextChecks()

        if (itemsChanged) {
            refreshCheckList();
        }
    }

    return itemsChanged;
}

function moveCheckToChecked(id, doLinked=false, updateDungeonCount=true) {
    let itemsChanged = false;
    let isVanilla = checksById[id].isVanilla;
    let metadata = coordDict[id];

    if (localSettings.spoilOnCollect) {
        spoilLocation(id, false);
    }

    if (doLinked) {
        let contents = getCheckContents(id);

        if (contents) {
            addItem(contents, 1, false, false);
            itemsChanged = true;
        }

        if (metadata.linkedItem
            && (!metadata.vanillaLink 
                || isVanilla)) {
            addItem(metadata.linkedItem, 1, false, false, '', false);
            itemsChanged = true;
        }
    }

    if (updateDungeonCount) {
        updateDungeonItems();
    }

    return itemsChanged;
}

function moveCheckFromChecked(id, doLinked=false, updateDungeonCount=true) {
    let itemsChanged = false;
    let isVanilla = checksById[id].isVanilla;
    let metadata = coordDict[id];

    if (doLinked) {
        let contents = getCheckContents(id);

        if (contents) {
            addItem(contents, -1, false, false);
            itemsChanged = true;
        }

        if (metadata.linkedItem
            && (!metadata.vanillaLink 
                || isVanilla)) {
            addItem(metadata.linkedItem, -1, false, false, '', false);
            itemsChanged = true;
        }
    }

    if (updateDungeonCount) {
        updateDungeonItems();
    }

    return itemsChanged;
}

function refreshTextChecks() {
    if (!checkAccessibility) {
        return;
    }

    let checks = sortByKey(checkAccessibility, x => [x.metadata.area, x.metadata.name])
                 .filter(x => (x.shouldDraw() || x.difficulty == 9));
    for (const element of document.querySelectorAll('.row.grid[data-difficulty]')) {
        let difficulty = element.dataset.difficulty;
        element.innerHTML = '';

        let lastArea = null;
        let areaList = null;
        let areas = [];
        let logicChecks = checks.filter(x => ((x.isChecked() ? 'checked' : x.difficulty) == difficulty));

        let accordion = document.getElementById(`difficulty${difficulty == 'checked' ? 'Checked' : difficulty}Accordion`);
        setElementHidden(accordion, logicChecks.length == 0);

        for (const check of logicChecks) {
            let checkArea = coordDict[check.id].area;
            if (checkArea != lastArea) {
                let areaElement = createGroup(checkArea);
                areas.push(areaElement);

                areaList = areaElement.querySelector('ul.list-group')
                lastArea = checkArea;
            }

            areaList.appendChild(createTextCheck(check));
        }

        for (const area of areas) {
            element.appendChild(area);
        }
    }

    $('.grid').masonry({
        transitionDuration: 0,
        columnWidth: '.text-check-card-wrapper:not(.hidden)',
    });

    if (typeof applyMasonry === "function") {
        applyMasonry();
    }
}

function populateCheckOptions(button) {
    let checkId = $(button).attr('data-check-id');
    let ul = $(`#text-${checkId}`);
    ul.html(NodeTooltip.getItemList(checkId));
}

function applyMasonry() {
    $('.grid').masonry('reloadItems');
    $('.grid').masonry('layout');
}

function createGroup(name) {
    return parseHtml(
`<div class="text-check-card-wrapper col-xxl-2 col-lg-3 col-md-4 col-sm-6 col-12 px-1 py-1" data-area="${name}">
    <div class="card text-bg-dark text-check-card" onclick="preventDoubleClick(event)">
        <div class="card-header">
            ${name}
        </div>
        <div class="card-body">
            <ul class="list-group list-group-flush px-2" data-area="${name}">
            </ul>
        </div>
    </div>
</div>`);
}

function createTextCheck(check) {
    let checked = checkedChecks.has(check.id) ? ' in-checked' : '';
    let vanillaWrapper = check.isVanilla ? ' vanilla-wrapper' : '';
    let vanilla = check.isVanilla ? ' data-vanilla=true' : '';
    let metadata = coordDict[check.id];
    let checkIcon = `
<div class="text-check-graphic-wrapper">
<div class="text-check-graphic${check.behindTrackerLogic ? ' behind-tracker' : ''}${check.behindKeys ? ' behind-keys' : ''}${check.requiredRupees ? ' behind-rupees' : ''}${check.isOwl() ? ' owl' : ''}">
    <div class="node-overlay-wrapper" data-difficulty="${check.difficulty}">
        <div class="icon-wrapper icon-difficulty-${check.difficulty}">
            <svg class="icon text-icon">
                <use xlink:href="#difficulty-${check.difficulty}${check.isVanilla ? '-vanilla' : ''}"></use>
            </svg>
            ${check.hollow ? `<svg class="icon hollow text-icon">
                <use xlink:href="#difficulty-${check.difficulty}-hollow"></use>
            </svg>` : ''}
        </div>
        <div class="behind-keys-overlay"></div>
        <div class="behind-tracker-overlay"></div>
        <div class="behind-rupees-overlay"></div>
        <div class="owl-overlay"></div>
        ${check.item ? `<img src="static/images/${check.item}_1.png" class="node-item-overlay"></img>` : ''}
    </div>
</div>
</div>
`;

    return parseHtml(
`<div class="row text-check-wrapper${checked}${vanillaWrapper}" data-child-check-id="${check.id}">
    <div class="text-check-col col pe-0">
        <li class="text-check" data-checkname="${metadata.name}" data-checkarea="${metadata.area}" data-behind_keys="${check.behindKeys}" data-logic="{{logic}}" data-check-id="${check.id}" data-difficulty="${check.difficulty}"${vanilla} onclick="toggleCheck(event, '${check.id}')">
            <div class="check-name">
                ${check.difficulty < 9 && !check.isChecked() ? checkIcon : ''}
                ${metadata.name}
            </div>
        </li>
    </div>
    <div class="col-auto ps-2 pe-0">
        <div class="btn-group dropend">
            <button type="button" class="btn hidden"></button>
            <button type="button" class="btn tooltip-item dropdown-toggle dropdown-toggle-split ps-4 pe-2 text-end" data-check-id="${check.id}" onmousedown="populateCheckOptions(this)" data-bs-toggle="dropdown" aria-expanded="false"></button>
            <ul id="text-${check.id}" class="dropdown-menu text-dropdown"></ul>
        </div>
    </div>
</div>`);
}