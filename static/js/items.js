function setImgSrc(img, item) {
    if (!(item in inventory)) {
        inventory[item] = 0;
    }

    let number = $(img).attr('data-invert_count') != '' ? inventory[item] : maxInventory[item] - inventory[item];

    if (hasAttr(img, 'data-src')) {
        $(img).attr('src', eval($(img).attr('data-src')));
    }
    else {
        max = 9999;

        if (hasAttr(img, 'data-max_image')) {
            max = $(img).attr('data-max_image');
        }

        $(img).attr('src', `static/images/${item}_${Math.min(number, max)}.png`);
    }

    if (number > 0) {
        $(img).addClass('owned-item');
    }
    else {
        $(img).removeClass('owned-item');
    }
}

function setItemImage(item) {
    let img = $(`img[data-item="${item}"]`);

    if (img.length == 0) {
        col = $(`div[data-secondary="${item}"]`);

        if (col.length > 0) {
            img = $(col).children()[0].children[0];
        }
    }

    setImgSrc(img, item);
}

function updateOverlay(item) {
    let texts = $(`span[data-overlay_count=${item}]`);

    if (texts.length == 0) {
        return;
    }

    for (const text of texts) {
        let number = $(text).attr('data-invert_count') != '' ? inventory[item] : maxInventory[item] - inventory[item];

        if (number == 0) {
            $(text).addClass('hidden');
        }
        else {
            $(text).removeClass('hidden');
        }

        if (number == maxInventory[item]) {
            $(text).addClass('full');
        }
        else {
            $(text).removeClass('full');
        }

        $(text).html(number);
    }
}

function itemValueUpdated(element) {
    let item = element.dataset.item;
    let value = null;

    if (element.type == 'checkbox') {
       value = element.checked ? 1 : 0;
    }
    else {
        value = Number(element.value);
    }

    inventory[item] = value;

    saveInventory();
    refreshCheckList();
}

function refreshImages() {
    let columns = $('div[data-primary]');

    for (const col of columns) {
        let primary = $(col).attr('data-primary');

        setItemImage(primary);

        if (hasAttr(col, 'data-secondary')) {
            setItemImage($(col).attr('data-secondary'));
        }

        updateOverlay(primary);
    }

    inputs = $('input[data-item]')
    for (const input of inputs) {
        let item = input.dataset.item;

        if (input.type == 'checkbox') {
            input.checked = inventory[item] >= 1;
        }
        else {
            input.value = inventory[item];
        }
    }
}

let spoilerTimeout = null;

function itemMouseEnter(element) {
    let parent = $(element).parent();

    items = [$(parent).attr('data-primary')];

    let secondary = $(parent).attr('data-secondary');
    if (secondary) {
        items.push(secondary);
    }

    spoilerTimeout = setTimeout(setHighlightedItems, 500, items);
}

function itemMouseLeave(element) {
    clearTimeout(spoilerTimeout);
    setHighlightedItems([]);
}

function setHighlightedItems(items) {
    if (hoveredItems.length == 0 && items.length == 0) {
        return;
    }

    hoveredItems = [].concat(items);

    drawActiveTab();
}

// Composite item logic
function jumpSrc() {
    feather = inventory['FEATHER'] > 0;
    rooster = inventory['ROOSTER'] > 0;

    if (!feather && !rooster) {
        return 'static/images/NO_JUMP.png';
    }
    if (!feather && rooster) {
        return 'static/images/ROOSTER.png';
    }
    if (feather && !rooster) {
        return 'static/images/FEATHER.png';
    }

    return 'static/images/BOTH_JUMP.png';
}

function tunicSrc()
{
    blue = inventory['BLUE_TUNIC'] > 0;
    red = inventory['RED_TUNIC'] > 0;

    if (!blue && !red)
    {
        return 'static/images/GREEN_TUNIC.png';
    }
    if (blue && !red)
    {
        return 'static/images/BLUE_TUNIC.png';
    }
    if (!blue && red)
    {
        return 'static/images/RED_TUNIC.png';
    }
    
    return 'static/images/BLUERED_TUNIC.png';
}

function calculateDungeonChecks() {
    let checks = {};
    let foundIds = new Set();
    $('li[data-logic]').toArray()
                       .map(x => createCheck(x))
                       .filter(x => x.isDungeon() && !x.isVanillaOwl())
                       .map(x => {
                            if (foundIds.has(x.id)) {
                                return;
                            }

                            let dNum = x.dungeonNumber();

                            if (!(dNum in checks)) {
                                checks[dNum] = [];
                            }

                            checks[x.dungeonNumber()].push(x);
                            foundIds.add(x.id);
                        });
    
    for (let i = 0; i < 9; i++) {
        let d = i == 0 ? 9 : i;
        let item = `ITEM${d}`;
        let checked = checks[i].filter(x => x.isChecked()).length;

        let newQty = checked;

        if (['', 'localkeys'].includes(args.dungeon_items)) {
            newQty -= inventory[`KEY${d}`] ?? 0;
        }
        if (['', 'smallkeys', 'keysy'].includes(args.dungeon_items)) {
            newQty -= inventory[`MAP${d}`] ?? 0;
            newQty -= inventory[`COMPASS${d}`] ?? 0;
            newQty -= inventory[`STONE_BEAK${d}`] ?? 0;
        }
        if (['', 'smallkeys', 'localkeys', 'nightmarekey'].includes(args.dungeon_items)) {
            newQty -= inventory[`NIGHTMARE_KEY${d}`] ?? 0;
        }
        if (!args.instruments && `INSTRUMENT${d}` in maxInventory) {
            newQty -= inventory[`INSTRUMENT${d}`] ?? 0;
        }

        addItem(item, newQty - (inventory[item] ?? 0), wrap=false, refresh=false);
    }
}

function updateDungeonItems() {
    if (localSettings.autotrackItems && localSettings.enableAutotracking) {
        calculateDungeonChecks();
    }
}