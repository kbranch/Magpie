"use strict"

function getPlayerInventory(player) {
    let inv = inventory;

    if (player) {
        inv = playerInventories[player];
    }

    return inv;
}

function setImgSrc(img, item, player='') {
    let inv = getPlayerInventory(player);

    if (!(item in inv)) {
        inv[item] = 0;
    }

    let applyGfx = ($(img).closest('.inventory-item').attr('data-gfx') == 'True') && ($(img).hasClass('primary') || item.includes ('CHECKED'));
    let number = $(img).attr('data-invert_count') != '' ? inv[item] : maxInventory[item] - inv[item];

    if (hasAttr(img, 'data-src')) {
        $(img).attr('src', eval($(img).attr('data-src').replace('${player}', player)));
    }
    else {
        let max = 9999;

        if (hasAttr(img, 'data-max_image')) {
            max = $(img).attr('data-max_image');
        }

        let gfx = applyGfx ? localSettings.graphicsPack : '';
        $(img).attr('src', `static/images${gfx}/${item}_${Math.min(number, max)}.png`);
    }

    let element = img.length == 1 ? img[0] : img;
    let parent = element.closest('div.inventory-item');
    let wrapper = element.parentElement;
    let primary = parent.dataset?.primary;
    let secondary = parent.dataset?.secondary;
    // Below is not safe for use with invert_count
    let slotOwned = inv[primary] > 0 || (inv[secondary] > 0 && parent.classList.contains('highlight-owned-secondary'));

    if (element.dataset?.item == item || secondary == item) {
        if (slotOwned) {
            wrapper.classList.add(`owned-item-${localSettings.ownedHighlight}`);
        }
        else {
            wrapper.classList.remove('owned-item-bar');
            wrapper.classList.remove('owned-item-square');
        }
    }
}

function setItemImage(item, player='') {
    let img = $(`[data-player="${player}"] img[data-item="${item}"]`);

    if (img.length == 0) {
        let col = $(`[data-player="${player}"] div[data-secondary="${item}"]`);

        if (col.length > 0) {
            img = $(col).children()[0].children[0];
        }
    }

    setImgSrc(img, item, player);
}

function updateOverlay(item, player='') {
    let inv = getPlayerInventory(player);
    let texts = $(`[data-player="${player}"] span[data-overlay_count=${item}]`);

    if (texts.length == 0) {
        return;
    }

    for (const text of texts) {
        let number = $(text).attr('data-invert_count') != '' ? inv[item] : maxInventory[item] - inv[item];

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
    for (const player of players) {
        let columns = $(`[data-player="${player}"] div[data-primary]`);

        for (const col of columns) {
            let primary = $(col).attr('data-primary');

            setItemImage(primary, player);

            if (hasAttr(col, 'data-secondary')) {
                setItemImage($(col).attr('data-secondary'), player);
            }

            updateOverlay(primary, player);
        }

        let inputs = $(`[data-player="${player}"] input[data-item]`)
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

    sharingLiveUpdate();
    refreshItemNdi();
}

let spoilerTimeout = null;

function itemMouseEnter(element) {
    let parent = $(element).parent();
    let items = [$(parent).attr('data-primary')];
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

    drawActiveTab(false);
}

// Composite item logic
function jumpSrc(player) {
    let inv = getPlayerInventory(player);
    let feather = inv['FEATHER'] > 0;
    let rooster = inv['ROOSTER'] > 0;

    if (!feather && !rooster) {
        return `static/images${localSettings.graphicsPack}/NO_JUMP.png`;
    }
    if (!feather && rooster) {
        return `static/images${localSettings.graphicsPack}/ROOSTER.png`;
    }
    if (feather && !rooster) {
        return `static/images${localSettings.graphicsPack}/FEATHER.png`;
    }

    return `static/images${localSettings.graphicsPack}/BOTH_JUMP.png`;
}

function tunicSrc(player)
{
    let inv = getPlayerInventory(player);
    let gfx = localSettings.graphicsPack;
    let blue = inv['BLUE_TUNIC'] > 0;
    let red = inv['RED_TUNIC'] > 0;

    if (!blue && !red)
    {
        return `static/images${gfx}/GREEN_TUNIC.png`;
    }
    if (blue && !red)
    {
        return `static/images${gfx}/BLUE_TUNIC.png`;
    }
    if (!blue && red)
    {
        return `static/images${gfx}/RED_TUNIC.png`;
    }
    
    return `static/images${gfx}/BLUERED_TUNIC.png`;
}

function calculateDungeonChecks() {
    if (!checkAccessibility) {
        return;
    }

    let checks = {};
    let foundIds = new Set();
    checkAccessibility.filter(x => x.isDungeon() && !x.isVanillaOwl())
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

    if (Object.keys(checks).length == 0) {
        return;
    }
    
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

        addItem(item, newQty - (inventory[item] ?? 0), false, false);
    }
}

function updateDungeonItems() {
    if (localSettings.autotrackItems && localSettings.enableAutotracking) {
        calculateDungeonChecks();
    }
}

function updateMaxInventory(newMax) {
    maxInventory = newMax;
}