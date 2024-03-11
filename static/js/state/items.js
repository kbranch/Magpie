"use strict"

function resetInventory() {
    inventory = {};
    for (const item in maxInventory) {
        inventory[item] = 0;
    }

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

    for (const item in inventory) {
        if (item in renamedItems) {
            inventory[renamedItems[item]] = inventory[item];
            delete inventory[item];
        }
    }
}

function addItem(item, qty, wrap=true, refresh=true, player='', doLinked=true) {
    if (item in renamedItems) {
        item = renamedItems[item];
    }

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
    else if (inv[item] < 0) {
        inv[item] = 0;
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
            updateDungeonItems();
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
            if (!checksById[check.id]) {
                continue;
            }

            let isVanilla = checksById[check.id].isVanilla;

            if ((check.vanillaLink && !isVanilla)) {
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