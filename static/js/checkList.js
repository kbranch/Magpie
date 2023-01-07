function getCheckedKey(area, name) {
    return `${area}-${name}`;
}

function toggleNode(node) {
    let toggleList = new Set(node.checks.filter(x => (x.difficulty == node.difficulty
                                                      && x.behindKeys == node.behindKeys
                                                      && !x.isChecked())
                                                     || (x.isChecked() && node.isChecked))
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
}

function toggleSingleNodeCheck(check) {
    let id = $(check).attr('data-check-id');
    let textCheck = $(`li[data-check-id="${id}"`);
    toggleCheck(null, textCheck);
}

function toggleChecks(checkIds) {
    let itemsChanged = false;

    pushUndoState();

    for (const id of checkIds) {
        let textCheck = $(`li[data-check-id="${id}"`);
        itemsChanged |= toggleCheck(null, textCheck, draw=false, pushUndo=false);
    }

    if (itemsChanged) {
        refreshCheckList();
    }
}

function toggleCheck(event, elements, draw=true, pushUndo=true) {
    let itemsChanged = false;

    if (pushUndo) {
        pushUndoState();
    }

    for (const element of elements) {
        let area = $(element).attr('data-checkarea');
        let name = $(element).attr('data-checkname');
        let logic = $(element).closest(".row[data-logic]").attr('data-logic');
        let key = getCheckedKey(area, name);

        if (logic != 'Checked') {
            check = {
                name: name,
                area: area,
            };

            checkedChecks[key] = check;

            itemsChanged = moveCheckToChecked(element, doLinked=true);
        }
        else {
            delete checkedChecks[key];
            itemsChanged = moveCheckFromChecked(element, doLinked=true);
        }

        saveChecked();
    }

    preventDoubleClick(event);

    if (draw) {
        drawActiveTab();

        if (itemsChanged) {
            refreshCheckList();
        }
    }

    closeAllCheckTooltips();

    return itemsChanged;
}

function moveCheckToChecked(element, doLinked=false) {
    let itemsChanged = false;
    let logic = $(element).attr('data-logic');
    let area = $(element).attr('data-checkarea');
    let checkId = $(element).attr('data-check-id');
    let isVanilla = $(element).attr('data-vanilla');
    let metadata = coordDict[checkId];
    let destArea = $(`[data-logic="Checked"] [data-area="${area}"]`)
    let sourceArea = $(`[data-logic="${logic}"] [data-area="${area}"]`);

    if (localSettings.spoilOnCollect) {
        spoilLocation(checkId, false);
    }

    if (doLinked) {
        let contents = getCheckContents(checkId);

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

    if (destArea.length == 0) {
        let destLogic = $('.row[data-logic=Checked]');
        let accordionItem = $(destLogic).closest('.accordion-item');
        let newCard = $(sourceArea).clone();

        ul = $(newCard).find('ul');
        $(ul).html('');

        $(accordionItem).removeClass('hidden');
        $(destLogic).append(newCard);

        destArea = $(`[data-logic="Checked"] [data-area="${area}"]`)
    }

    ul = $(destArea).find('ul');
    $(ul).append(element);

    if ($(sourceArea).find('ul').children().length == 0) {
        $(sourceArea).remove();
    }

    if (logic != 'In logic') {
        let sourceLogic = $(`.row[data-logic="${logic}"]`).closest('.accordion-item');
        if ($(sourceLogic).find('[data-area]').length == 0) {
            $(sourceLogic).addClass('hidden');
        }
    }

    return itemsChanged;
}

function moveCheckFromChecked(element, doLinked=false) {
    let itemsChanged = false;
    let logic = $(element).attr('data-logic');
    let area = $(element).attr('data-checkarea');
    let checkId = $(element).attr('data-check-id');
    let isVanilla = $(element).attr('data-vanilla');
    let metadata = coordDict[checkId];
    let destArea = $(`[data-logic="${logic}"] [data-area="${area}"]`);
    let sourceArea = $(`[data-logic="Checked"] [data-area="${area}"]`)

    if (doLinked) {
        let contents = getCheckContents(checkId);

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

    if (destArea.length == 0) {
        let destLogic = $(`.row[data-logic="${logic}"]`);
        let accordionItem = $(destLogic).closest('.accordion-item');
        let newCard = $(sourceArea).clone();

        ul = $(newCard).find('ul');
        $(ul).html('');

        $(accordionItem).removeClass('hidden');
        $(destLogic).append(newCard);

        destArea = $(`[data-logic="${logic}"] [data-area="${area}"]`);
    }

    ul = $(destArea).find('ul');
    $(ul).append(element);

    if ($(sourceArea).find('ul').children().length == 0) {
        $(sourceArea).remove();
    }

    let sourceLogic = $(`.row[data-logic="Checked"]`).closest('.accordion-item');
    if ($(sourceLogic).find('[data-area]').length == 0) {
        $(sourceLogic).addClass('hidden');
    }

    return itemsChanged;
}

function refreshChecked() {
    for (let key in checkedChecks) {
        let check = checkedChecks[key];
        element = $(`li[data-checkarea="${check.area}"][data-checkname="${check.name}"]`);
        if (element.length > 0) {
            moveCheckToChecked(element[0]);
        }
    }
}

function populateCheckOptions(button) {
    let checkId = $(button).attr('data-check-id');
    let ul = $(`#text-${checkId}`);
    ul.html(NodeTooltip.getItemList(checkId));
}