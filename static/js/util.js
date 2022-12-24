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
}

function getBinaryFile(element, callback) {
    if (element.files.length == 0) {
        return;
    }

    let file = element.files[0];
    let reader = new FileReader();

    reader.onload = () => callback(reader.result);
    reader.readAsBinaryString(file);
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

        updateAutotrackerStatus("Disabled")
    }
}