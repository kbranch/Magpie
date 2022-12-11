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
    if (!(item in inventory)) {
        inventory[item] = 0;
    }

    inventory[item] += qty;

    if (inventory[item] > maxInventory[item]) {
        inventory[item] = wrap ? 0 : maxInventory[item];
    }

    if (inventory[item] < 0) {
        inventory[item] = wrap ? maxInventory[item] : 0;
    }

    console.log(`${item}: ${inventory[item]}`);

    if (refresh) {
        saveInventory();
        setItemImage(item);
        updateOverlay(item);
        refreshCheckList();
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