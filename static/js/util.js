"use strict"

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
    allowList.button = ['class', 'type', 'data-value', 'onclick', 'data-bs-toggle', 'aria-expanded', 'data-bs-custom-class', 'data-bs-html', 'data-bs-title'];
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

function disconnectAutotracker() {
    $('#romRow').hide();
    if (autotrackerSocket != null && autotrackerSocket.readyState == 1) {
        autotrackerSocket.close();
        addAutotrackerMessage("Disconnecting...")
    }
}

function removeVanillaConnectors() {
    if (connections.length == 0) {
        return;
    }

    for (const connection of [...connections]) {
        if (connection.vanilla) {
            for (const exterior of connection.entrances) {
                clearEntranceMapping(exterior, false);
            }
        }
    }

    connections = connections.filter(x => !x.vanilla);

    saveEntrances();
}

function updateEntrances() {
    for (const entrance in entranceMap) {
        if (!randomizedEntrances?.includes(entrance)) {
            clearEntranceMapping(entrance, false);
        }
    }

    removeVanillaConnectors();
    for (const connectorId in connectorDict) {
        let connector = connectorDict[connectorId];

        if (!Entrance.isVanilla(connector.entrances[0])) {
            continue;
        }

        connectExteriors(connector.entrances[0], connector.entrances[0], connector.entrances[1], connector.entrances[1], false, false);

        if (connector.entrances.length == 3) {
            connectExteriors(connector.entrances[0], connector.entrances[0], connector.entrances[2], connector.entrances[2], false, false);
        }
    }
}

function moveChildren(source, dest) {
    if (!source || !dest) {
        return;
    }

    dest.append(...source.childNodes);
}

function applySettings() {
    if (!localSettings.playerId) {
        try {
            localSettings.playerId = crypto.randomUUID();
        }
        catch {
            localSettings.playerId = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }
    }

    let stacked = document.getElementById('stackedContainer');
    let unstacked = document.getElementById('unstackedContainer');
    let container;

    for (const player of players) {
        if (localSettings.stacked) {
            container = stacked;

            moveChildren(unstacked.querySelector(`[data-player="${player}"] .navbar-slot`), stacked.querySelector(`[data-player="${player}"] .navbar-slot`));
            moveChildren(unstacked.querySelector(`[data-player="${player}"] .map-slot`), stacked.querySelector(`[data-player="${player}"] .map-slot`));
            moveChildren(unstacked.querySelector(`[data-player="${player}"] .items-slot`), stacked.querySelector(`[data-player="${player}"] .items-slot`));
            moveChildren(unstacked.querySelector(`[data-player="${player}"] .quicksettings-slot`), stacked.querySelector(`[data-player="${player}"] .quicksettings-slot`));

            stacked.classList.remove('hidden');
            unstacked.classList.add('hidden');
        }
        else {
            container = unstacked;

            moveChildren(stacked.querySelector(`[data-player="${player}"] .navbar-slot`), unstacked.querySelector(`[data-player="${player}"] .navbar-slot`));
            moveChildren(stacked.querySelector(`[data-player="${player}"] .map-slot`), unstacked.querySelector(`[data-player="${player}"] .map-slot`));
            moveChildren(stacked.querySelector(`[data-player="${player}"] .items-slot`), unstacked.querySelector(`[data-player="${player}"] .items-slot`));
            moveChildren(stacked.querySelector(`[data-player="${player}"] .quicksettings-slot`), unstacked.querySelector(`[data-player="${player}"] .quicksettings-slot`));

            unstacked.classList.remove('hidden');
            stacked.classList.add('hidden');
        }
    }

    if (container) {
        let items = container.querySelector('.item-chunk');
        let map = container.querySelector('.map-chunk');

        if (items && map) {
            if (localSettings.swapItemsAndMap) {
                container.removeChild(items);
                container.removeChild(map);
                container.appendChild(items);
                container.appendChild(map);
            }
            else {
                container.removeChild(items);
                container.removeChild(map);
                container.appendChild(map);
                container.appendChild(items);
            }
        }
    }

    $('.map').css('filter', `brightness(${localSettings.mapBrightness}%)`);

    if (!args.rooster) {
        inventory['ROOSTER'] = 0;
        saveInventory();
    }

    if (!localSettings.enableAutotracking) {
        disconnectAutotracker();
    }

    let oldFeatures = [...autotrackerFeatures];

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

    if (oldFeatures.length != autotrackerFeatures.length 
        || !oldFeatures.every((x) => autotrackerFeatures.includes(x))) {
        disconnectAutotracker();
    }

    let iconStyleTable = {
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

        ".difficulty-0": localSettings.diff0Alpha,
        ".difficulty-0.vanilla": localSettings.diff0VAlpha,
        ".difficulty-1": localSettings.diff1Alpha,
        ".difficulty-1.vanilla": localSettings.diff1VAlpha,
        ".difficulty-2": localSettings.diff2Alpha,
        ".difficulty-2.vanilla": localSettings.diff2VAlpha,
        ".difficulty-3": localSettings.diff3Alpha,
        ".difficulty-3.vanilla": localSettings.diff3VAlpha,
        ".difficulty-8": localSettings.diff8Alpha,
        ".difficulty-8.vanilla": localSettings.diff8VAlpha,
        ".difficulty-9": localSettings.diff9Alpha,
        ".difficulty-9.vanilla": localSettings.diff9VAlpha,
        ".difficulty-checked": localSettings.diffCheckedAlpha,
    }

    for (const rule of iconStyles.cssRules) {
        if (rule.selectorText.startsWith('#')) {
            rule.style.fill = iconStyleTable[rule.selectorText];
        }
        else {
            rule.style.opacity = iconStyleTable[rule.selectorText];
        }
    }

    for(let i = 0; i < themeStyles.rules.length; i++) {
        themeStyles.removeRule(0);
    }

    let themeRule = `.bg-dark, .text-bg-dark, .accordion-button, .accordion-body, .accordion-button:not(.collapsed), tab-button.active, .tab-link {
        background: ${localSettings.bgColor} !important;
        color: ${localSettings.textColor} !important;
    }`;
    themeStyles.insertRule(themeRule, 0);

    let highlightRule = `.owned-item-square:not(.secondary) {
        background-color: ${localSettings.highlightColor};
    }`;
    themeStyles.insertRule(highlightRule, 0);

    highlightRule = `.owned-item-bar:not(.secondary) {
        border-bottom-color: ${localSettings.highlightColor};
    }`;
    themeStyles.insertRule(highlightRule, 0);

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

    if (local) {
        $.ajax({
            type: "POST",
            url: "/ndiSettings",
            data: {
                itemsEnabled: localSettings.ndiItems,
                mapEnabled: localSettings.ndiMap,
            },
        });
    }
}

function createElement(type, attrs) {
    let element = document.createElement(type);

    for (const attr in attrs) {
        if (attr == 'css') {
            element.style.cssText = attrs[attr];
        }
        else {
            element.setAttribute(attr, attrs[attr]);
        }
    }

    return element;
}

function setElementHidden(element, hidden) {
    if (hidden) {
        element.classList.add('hidden');
    }
    else {
        element.classList.remove('hidden');
    }
}

function setLocalStorage(key, value) {
    let prefix = settingsPrefix ?? '';
    localStorage.setItem(prefix + key, value);
}

function getLocalStorage(key) {
    let prefix = settingsPrefix ?? '';
    return localStorage.getItem(prefix + key);
}

function findPlayerFromElement(element) {
    let playerParent = element.closest('[data-player]');
    return playerParent.dataset.player;
}

function parseHtml(outerHtml) {
    let element = document.createElement('div');
    element.innerHTML = outerHtml;
    return element.firstChild;
}