"use strict"

function resetInventory() {
    inventory = {};
    saveInventory();

    for (const player in playerInventories) {
        playerInventories[player] = {};
    }
}

function saveInventory() {
    setLocalStorage("inventory", JSON.stringify(inventory));
}

function loadInventory() {
    inventory = JSON.parse(getLocalStorage("inventory"));

    if (inventory == null) {
        resetInventory();
    }
}

function addItem(item, qty, wrap=true, refresh=true, player='', doLinked=true) {
    let inv = getPlayerInventory(player);

    if (!(item in inv) || typeof inv[item] != 'number') {
        inv[item] = 0;
    }

    inv[item] += qty;

    if (maxInventory[item] != 0) {
        if (inv[item] > maxInventory[item]) {
            inv[item] = wrap ? 0 : maxInventory[item];
        }

        if (inv[item] < 0) {
            inv[item] = wrap ? maxInventory[item] : 0;
        }
    }

    console.log(`${item}: ${inv[item]}`);

    if (player == '') {
        if (doLinked) {
            updateLinkedItemChecks(item);
        }

        setItemImage(item);
        updateOverlay(item);
        saveInventory();

        sharingLiveUpdate();
        refreshItemNdi();

        if (refresh) {
            refreshCheckList();
        }
    }
    else {
        setItemImage(item, player);
        updateOverlay(item, player);
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