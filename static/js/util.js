function hasAttr(element, attrName) {
    let attr = $(element).attr(attrName);

    return typeof attr !== 'undefined' && attr !== false;
}

async function getFile() {
    const pickerOpts = {
        types: [
            {
                description: 'Magpie state',
                accept: {
                    'application/json': ['.json']
                }
            },
        ],
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