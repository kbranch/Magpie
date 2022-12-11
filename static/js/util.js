function hasAttr(element, attrName) {
    let attr = $(element).attr(attrName);

    return typeof attr !== 'undefined' && attr !== false;
}

async function getFile(types=null) {
    if (types == null) {
        types = [
            {
                description: 'Magpie state (*.json)',
                accept: {
                    'application/json': ['.json']
                }
            },
        ];
    }

    const pickerOpts = {
        types: types,
        excludeAcceptAllOption: true,
        multiple: false
    };

    [handle] = await window.showOpenFilePicker(pickerOpts);
    let file = await handle.getFile();

    return await file.text();
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
    allowList.div.push('data-check-id');
    allowList.div.push('data-entrance-id');
    allowList.div.push('onclick');
    allowList.li.push('onclick');
    allowList.li.push('data-node-id');
    allowList.img.push('data-bs-toggle');
    allowList.img.push('data-bs-title');
    allowList.img.push('data-bs-html');
    allowList.img.push('data-bs-custom-class');
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
}