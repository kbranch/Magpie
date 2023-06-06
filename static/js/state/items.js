"use strict"

function resetInventory() {
    inventory = {};
    saveInventory();
}

function saveInventory() {
    localStorage.setItem("inventory", JSON.stringify(inventory));
}

function loadInventory() {
    inventory = JSON.parse(localStorage.getItem("inventory"));

    if (inventory == null) {
        resetInventory();
    }
}

function addItem(item, qty, wrap=true, refresh=true) {
    if (!(item in inventory) || typeof inventory[item] != 'number') {
        inventory[item] = 0;
    }

    inventory[item] += qty;

    if (maxInventory[item] != 0) {
        if (inventory[item] > maxInventory[item]) {
            inventory[item] = wrap ? 0 : maxInventory[item];
        }

        if (inventory[item] < 0) {
            inventory[item] = wrap ? maxInventory[item] : 0;
        }
    }

    console.log(`${item}: ${inventory[item]}`);

    updateLinkedItemChecks(item);

    setItemImage(item);
    updateOverlay(item);
    saveInventory();

    refreshItemNdi();

    if (refresh) {
        refreshCheckList();
    }
}

function updateLinkedItemChecks(item) {
    if (item in linkedChecks) {
        for (const check of linkedChecks[item]) {
            let element = $(`li[data-check-id=${check.id}]`);
            let isVanilla = $(element).attr('data-vanilla');

            if ((check.vanillaLink && !isVanilla)
                || check.autotrackerLink) {
                continue;
            }

            if (inventory[item] > 0) {
                checkedChecks.add(check.id);
            }
            else {
                checkedChecks.delete(check.id);
            }
        }

        saveChecked();
    }
}

function initKnownItems() {
    try {
        loadInventory();
    }
    catch(err) {
        resetInventory();
    }

    let columns = $('div[data-primary]');

    for (const col of columns) {
        // Set custom max values
        if (hasAttr(col, "data-max")) {
            let primary = $(col).attr('data-primary');
            let max = Number($(col).attr('data-max'));
            maxInventory[primary] = max;
        }

        if (hasAttr(col, "secondary_max")) {
            let secondary = $(col).attr('data-secondary');
            let max = Number($(col).attr('data-secondary_max'));
            maxInventory[secondary] = max;
        }
    }

    refreshImages();
}