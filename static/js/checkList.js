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
    let isVanilla = $(`[data-check-id="${id}"][data-logic="Checked"]`).attr('data-vanilla');
    let metadata = coordDict[id];

    if (localSettings.spoilOnCollect) {
        spoilLocation(id, false);
    }

    if (updateDungeonCount) {
        updateDungeonItems();
    }

    if (doLinked) {
        let contents = getCheckContents(id);

        if (contents) {
            addItem(contents, 1, false, false);
            itemsChanged = true;
        }

        if (metadata.linkedItem
            && (!metadata.vanillaLink 
                || isVanilla)
            && (!metadata.autotrackerLink
                || autotrackerIsConnected())) {
            addItem(metadata.linkedItem, 1, false, false);
            itemsChanged = true;
        }
    }

    return itemsChanged;
}

function moveCheckFromChecked(id, doLinked=false, updateDungeonCount=true) {
    let itemsChanged = false;
    let isVanilla = $(`[data-check-id="${id}"][data-logic="Checked"]`).attr('data-vanilla');
    let metadata = coordDict[id];

    if (updateDungeonCount) {
        updateDungeonItems();
    }

    if (doLinked) {
        let contents = getCheckContents(id);

        if (contents) {
            addItem(contents, -1, false, false);
            itemsChanged = true;
        }

        if (metadata.linkedItem
            && (!metadata.vanillaLink 
                || isVanilla)
            && (!metadata.autotrackerLink
                || autotrackerIsConnected())) {
            addItem(metadata.linkedItem, -1, false, false);
            itemsChanged = true;
        }
    }

    return itemsChanged;
}

function refreshTextChecks() {
    let wrappers = document.querySelectorAll('div.text-check-wrapper');

    for (const element of wrappers) {
        let isChecked = checkedChecks.has(element.dataset.childCheckId);
        let isInChecked = element.classList.contains('in-checked');
        let isVanilla = element.classList.contains('vanilla-wrapper');
        let hide = (isInChecked ^ isChecked) || (!localSettings.showVanilla && isVanilla);

        hide ? element.classList.add('hidden') : element.classList.remove('hidden');
    }

    hideEmptyAreas();

    updateDungeonItems();

    if (typeof applyMasonry === "function") {
        applyMasonry();
    }
}

function hideEmptyAreas() {
    let areas = $('[data-area]');

    $(areas).removeClass('hidden');
    let i = 0;

    for (const area of areas) {
        if ($(area).find('div.text-check-wrapper:not(.hidden)').length == 0) {
            $(area).addClass('hidden');
        }

        i++;
    }
}

function populateCheckOptions(button) {
    let checkId = $(button).attr('data-check-id');
    let ul = $(`#text-${checkId}`);
    ul.html(NodeTooltip.getItemList(checkId));
}