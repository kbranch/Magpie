function saveChecked() {
    localStorage.setItem('checkedChecks', JSON.stringify(checkedChecks));
}

function saveEntrances() {
    localStorage.setItem('entranceMap', JSON.stringify(entranceMap));
}

function saveLocations() {
    saveChecked();
    saveEntrances();
}

function loadLocations() {
    loadChecked();
    loadEntrances();

    refreshChecked();
}

function loadEntrances() {
    try {
        entranceMap = JSON.parse(localStorage.getItem('entranceMap'));
    }
    catch (err) {
    }

    if (entranceMap == null) {
        entranceMap = {};
    }
}

function loadChecked() {
    try {
        checkedChecks = JSON.parse(localStorage.getItem('checkedChecks'));
    }
    catch (err) {
    }

    if (checkedChecks == null) {
        checkedChecks = {};
    }
}

function updateReverseMap() {
    reverseEntranceMap = Object.entries(entranceMap)
                               .reduce((rev, [key, value]) => (rev[value] = key, rev), {});
}

function getCheckedKey(area, name) {
    return `${area}-${name}`;
}

function toggleNode(nodeGraphic) {
    let node = nodes[$(nodeGraphic).attr('data-node-id')];
    let toggleList = new Set(node.checks.filter(x => (x.difficulty == node.difficulty
                                                      && x.behindKeys == node.behindKeys)
                                                     || (x.isChecked() && node.isChecked))
                                        .map(x => x.id));

    toggleChecks(toggleList);

    drawActiveTab();
}

function toggleSingleNodeCheck(check) {
    let id = $(check).attr('data-check-id');
    let textCheck = $(`li[data-check-id="${id}"`);
    toggleCheck(null, textCheck);
}

function toggleChecks(checks) {
    for (const id of checks) {
        let textCheck = $(`li[data-check-id="${id}"`);
        toggleCheck(null, textCheck, false);
    }
}

function toggleCheck(event, elements, draw=true) {
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
            moveCheckToChecked(element);
        }
        else {
            delete checkedChecks[key];
            moveCheckFromChecked(element);
        }

        saveChecked();
    }

    preventDoubleClick(event);

    if (draw) {
        drawActiveTab();
    }
}

function moveCheckToChecked(element) {
    let logic = $(element).attr('data-logic');
    let area = $(element).attr('data-checkarea');
    let destArea = $(`[data-logic="Checked"] [data-area="${area}"]`)
    let sourceArea = $(`[data-logic="${logic}"] [data-area="${area}"]`);

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
}

function moveCheckFromChecked(element) {
    let logic = $(element).attr('data-logic');
    let area = $(element).attr('data-checkarea');
    let destArea = $(`[data-logic="${logic}"] [data-area="${area}"]`);
    let sourceArea = $(`[data-logic="Checked"] [data-area="${area}"]`)

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

function resetLocations() {
    resetEntrances();
    resetChecks();
}

function resetEntrances() {
    entranceMap = {};
    saveEntrances();
}

function pruneEntranceMap() {
    for (const entrance in entranceMap) {
        if (!entrances.includes(entrance)) {
            delete entranceMap[entrance];
        }
    }

    saveEntrances();
}

function resetChecks() {
    checkedChecks = {};
    saveChecked();
}