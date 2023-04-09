function hasAttr(element, attrName) {
    let attr = $(element).attr(attrName);

    return typeof attr !== 'undefined' && attr !== false;
}

function getFile(element, callback) {
    if (element.files.length == 0) {
        return;
    }

    let file = element.files[0];
    let reader = new FileReader();

    reader.onload = () => callback(reader.result);
    reader.readAsText(file);
    element.value = null;
}

function getBinaryFile(element, callback) {
    if (element.files.length == 0) {
        return;
    }

    let file = element.files[0];
    let reader = new FileReader();

    reader.onload = () => callback(reader.result);
    reader.readAsBinaryString(file);
    element.value = null;
}

function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function modifyTooltipAllowList() {
    const allowList = bootstrap.Tooltip.Default.allowList
    allowList.svg = [];
    allowList.use = ['xlink:href'];
    allowList.div.push('data-check-id');
    allowList.div.push('data-entrance-id');
    allowList.div.push('onclick');
    allowList.li.push('onclick');
    allowList.li.push('data-node-id');
    allowList.img.push('data-bs-toggle');
    allowList.img.push('data-bs-title');
    allowList.img.push('data-bs-html');
    allowList.img.push('data-bs-custom-class');
    allowList.img.push('data-node-item');
    allowList.img.push('src');
    allowList.button = ['class', 'type', 'data-value', 'onclick', 'data-bs-toggle', 'aria-expanded'];
}

function preventDoubleClick(event) {
    if (event != null) {
        if (event.detail > 1) {
            event.preventDefault();
        }
    }
}

function compare(a, b) {
    if (a > b) {
        return 1
    } else if (a < b) {
        return -1
    } else {
        return 0
    }
}

function sortByKey(arr, key) {
    return arr.sort((a, b) => compare(key(a), key(b)))
}

function applySettings() {
    let children = $('#firstRow').children()
    let firstElement = $(children)[0].id;
    
    if (localSettings.swapItemsAndMap && firstElement == 'mapContainer'
        || !localSettings.swapItemsAndMap && firstElement != 'mapContainer') {
            $(children[1]).insertBefore($(children[0]));
    }

    $('.map').css('filter', `brightness(${localSettings.mapBrightness}%)`);

    if (!args.rooster) {
        inventory['ROOSTER'] = 0;
        saveInventory();
    }

    if (!localSettings.enableAutotracking) {
        $('#romRow').hide();
        if (autotrackerSocket != null && autotrackerSocket.readyState == 1) {
            autotrackerSocket.close();
        }

        addAutotrackerMessage("Disabled")
    }

    autotrackerFeatures = [];
    if (localSettings.autotrackItems) {
        autotrackerFeatures.push('items');
    }
    if (localSettings.autotrackChecks) {
        autotrackerFeatures.push('checks');
    }
    if (localSettings.autotrackEntrances) {
        autotrackerFeatures.push('entrances');
    }
    if (localSettings.autotrackSpoilers) {
        autotrackerFeatures.push('spoilers');
    }
    if (localSettings.autotrackSettings) {
        autotrackerFeatures.push('settings');
    }
    if (localSettings.gps) {
        autotrackerFeatures.push('gps');
    }
    if (localSettings.autotrackGraphicsPack) {
        autotrackerFeatures.push('gfx');
    }

    iconStyleTable = {
        "#difficulty-0": localSettings.diff0Color,
        "#difficulty-0-vanilla": localSettings.diff0VColor,
        "#difficulty-1": localSettings.diff1Color,
        "#difficulty-1-vanilla": localSettings.diff1VColor,
        "#difficulty-2": localSettings.diff2Color,
        "#difficulty-2-vanilla": localSettings.diff2VColor,
        "#difficulty-3": localSettings.diff3Color,
        "#difficulty-3-vanilla": localSettings.diff3VColor,
        "#difficulty-8": localSettings.diff8Color,
        "#difficulty-8-vanilla": localSettings.diff8VColor,
        "#difficulty-9": localSettings.diff9Color,
        "#difficulty-9-vanilla": localSettings.diff9VColor,
        "#difficulty-checked": localSettings.diffCheckedColor,
    }

    for (const rule of iconStyles.cssRules) {
        rule.style.fill = iconStyleTable[rule.selectorText];
    }

    for(let i = 0; i < themeStyles.rules.length; i++) {
        themeStyles.removeRule(0);
    }

    let themeRule = `.bg-dark, .text-bg-dark, .accordion-button, .accordion-body, .accordion-button:not(.collapsed), tab-button.active, .tab-link {
        background: ${localSettings.bgColor} !important;
        color: ${localSettings.textColor} !important;
    }`;
    themeStyles.insertRule(themeRule, 0);

    for (let mapName of ['overworld', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8']) {
        let mapPath = localSettings.colorAssistMaps ? `static/images/colorAssist/${mapName}.png` : `static/images/${mapName}.png`;
        $(`img[data-mapname=${mapName}]`).attr('src', mapPath);
    }

    if (localSettings.showVanillaEntrances) {
        $('.map-overlay').show();
    }
    else {
        $('.map-overlay').hide();
    }
}