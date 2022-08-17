function initKnownItems() {
    try {
        inventory = loadInventory();
    }
    catch(err) {
        resetInventory();
    }

    var columns = document.querySelectorAll('div[data-primary]');

    for (const col of columns) {
        var primary = col.dataset.primary;

        // Set custom max values
        if ("max" in col.dataset) {
            var max = Number(col.dataset.max);
            maxInventory[primary] = max;
        }
    }

    refreshImages();
}

function setImgSrc(img, item) {
    if (!(item in inventory)) {
        inventory[item] = 0;
    }

    if ('src' in img.dataset) {
        img.src = eval(img.dataset.src);
    }
    else {
        max = 9999;

        if ('max_image' in img.dataset) {
            max = img.dataset.max_image;
        }

        img.src = `static/images/${item}_${Math.min(inventory[item], max)}.png`;
    }
}

function setItemImage(item) {
    var img = document.querySelector(`img[data-item="${item}"]`);

    if (img == null) {
        col = document.querySelector(`div[data-secondary="${item}"]`);
        img = col.children[0].children[0];
    }

    setImgSrc(img, item);
}

function updateOverlay(item) {
    var texts = document.querySelectorAll(`span[data-overlay_count=${item}]`);

    if (!texts) {
        return;
    }

    for (const text of texts) {
        if (inventory[item] == 0) {
            text.classList.add('hidden');
        }
        else {
            text.classList.remove('hidden');
        }

        if (inventory[item] == maxInventory[item]) {
            text.classList.add('full');
        }
        else {
            text.classList.remove('full');
        }

        text.innerHTML = inventory[item];
    }
}

function addItem(item, qty) {
    if (!(item in inventory)) {
        inventory[item] = 0;
    }

    inventory[item] += qty;

    if (inventory[item] > maxInventory[item]) {
        inventory[item] = 0;
    }

    if (inventory[item] < 0) {
        inventory[item] = maxInventory[item];
    }

    console.log(`${item}: ${inventory[item]}`);

    saveInventory();
    setItemImage(item);
    updateOverlay(item);
    refreshMap();
}

function itemValueUpdated(element) {
    var item = element.dataset.item;
    var value = null;

    if (element.type == 'checkbox') {
       value = element.checked ? 1 : 0;
    }
    else {
        value = Number(element.value);
    }

    inventory[item] = value;

    saveInventory();
    refreshMap();
}

function resetInventory() {
    inventory = new Object();
    saveInventory();
}

function saveInventory() {
    localStorage.setItem("inventory", JSON.stringify(inventory));
}

function loadInventory() {
    return JSON.parse(localStorage.getItem("inventory"));
}

function refreshImages() {
    var columns = document.querySelectorAll('div[data-primary]');

    for (const col of columns) {
        var primary = col.dataset.primary;

        setItemImage(primary);

        if ('secondary' in col.dataset) {
            setItemImage(col.dataset.secondary);
        }

        updateOverlay(primary);
    }

    inputs = $('input[data-item]')
    for (const input of inputs) {
        var item = input.dataset.item;

        if (input.type == 'checkbox') {
            input.checked = inventory[item] >= 1;
        }
        else {
            input.value = inventory[item];
        }
    }
}