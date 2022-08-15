inventory = new Object();

function initKnownItems() {
    // var parent = document.getElementById('items');
    // parent.style.display = 'none';

    var columns = document.querySelectorAll('div[data-primary]');

    for (var i = 0; i < columns.length; i++) {
        var col = columns[i];
        var primary = col.dataset.primary;

    //     var wrapper = document.createElement("div");
    //     wrapper.classList.add('itemWrapper');
    //     col.appendChild(wrapper);

    //     // Add classes to the div to avoid boilerplate
    //     if (!('manual_classes' in col.dataset)) {
    //         col.classList.add('pt-2');
    //         col.classList.add('col');
    //     }

    //     // Create the primary img tag
    //     var primaryImg = document.createElement("img");
    //     primaryImg.dataset.item = primary;
    //     primaryImg.classList.add('itemImage');
    //     wrapper.appendChild(primaryImg);

    //     if ('width' in col.dataset) {
    //         primaryImg.style.width = col.dataset.width;
    //     }

    //     if ('max_image' in col.dataset) {
    //         primaryImg.dataset.max_image = col.dataset.max_image;
    //     }

    //     if ('src' in col.dataset) {
    //         primaryImg.dataset.src = col.dataset.src;
    //     }

    //     setImgSrc(primaryImg, primary);

    //     var onclick = `addItem('${primary}', 1)`;
    //     var oncontextmenu = `addItem('${primary}', -1);return false;`;

    //     // Deal with items with a secondary function
    //     if ("secondary" in col.dataset) {
    //         var secondary = col.dataset.secondary;
    //         oncontextmenu = `addItem('${secondary}', 1);return false;`;

    //         if (!('src' in col.dataset)) {
    //             secondaryImg = document.createElement("img");
    //             secondaryImg.dataset.item = secondary;
    //             secondaryImg.classList.add('secondary');
    //             wrapper.appendChild(secondaryImg);

    //             setImgSrc(secondaryImg, secondary);
    //         }
    //     }

    //     // Set the left/right click handlers
    //     wrapper.setAttribute("onclick", onclick);
    //     wrapper.setAttribute("oncontextmenu", oncontextmenu);

        // Set custom max values
        if ("max" in col.dataset) {
            var max = Number(col.dataset.max);
            maxInventory[primary] = max;
        }

    //     // Set up the overlay if there is one
    //     if ('overlay_count' in col.dataset) {
    //         var text = document.createElement('span');
    //         text.classList.add('overlay');
    //         text.innerHTML = '0';
    //         text.dataset.overlay_count = col.dataset.overlay_count;
    //         wrapper.appendChild(text);
    //     }
    }

    // parent.style.display = 'block';
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
    var text = document.querySelector(`span[data-overlay_count=${item}]`);

    if (!text) {
        return;
    }

    if (inventory[item] == maxInventory[item]) {
        text.classList.add('full');
    }
    else {
        text.classList.remove('full');
    }

    text.innerHTML = inventory[item];
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

    setItemImage(item);
    updateOverlay(item);
}