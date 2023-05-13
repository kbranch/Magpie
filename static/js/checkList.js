function getCheckedKey(area, name) {
    return `${area}-${name}`;
}

function toggleNode(node) {
    let toggleList = new Set(node.checks.filter(x => (x.difficulty == node.difficulty
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
        itemsChanged |= toggleCheck(null, id, draw=false, pushUndo=false);
    }

    refreshTextChecks();

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
        itemsChanged = moveCheckFromChecked(id, doLinked=true);
    }
    else {
        checkedChecks.add(id);
        itemsChanged = moveCheckToChecked(id, doLinked=true);
    }

    saveChecked();
    // }

    preventDoubleClick(event);

    if (draw) {
        refreshTextChecks()
        drawActiveTab();

        if (itemsChanged) {
            refreshCheckList();
        }
    }

    // Not sure why I added this - might be important
    // closeAllCheckTooltips();

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
            addItem(contents, 1, wrap=false, refresh=false);
            itemsChanged = true;
        }

        if (metadata.linkedItem
            && (!metadata.vanillaLink 
                || isVanilla)) {
            addItem(metadata.linkedItem, 1, wrap=false, refresh=false);
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
            addItem(contents, -1, wrap=false, refresh=false);
            itemsChanged = true;
        }

        if (metadata.linkedItem
            && (!metadata.vanillaLink 
                || isVanilla)) {
            addItem(metadata.linkedItem, -1, wrap=false, refresh=false);
            itemsChanged = true;
        }
    }

    return itemsChanged;
}

function refreshTextChecks() {
    $('.check-wrapper').removeClass('hidden')
    $('[data-logic="Checked"] .check-wrapper').addClass('hidden')

    for (const id of checkedChecks) {
        $(`[data-child-check-id="${id}"]`).addClass('hidden');
        $(`[data-logic="Checked"] [data-child-check-id="${id}"]`).removeClass('hidden');
    }

    if (localSettings.showVanilla) {
        $('li[data-vanilla]').closest('.check-wrapper').removeClass('hidden')
    }
    else {
        $('li[data-vanilla]').closest('.check-wrapper').addClass('hidden')
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
        if ($(area).find('.check-wrapper:not(.hidden)').length == 0) {
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