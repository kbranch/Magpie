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