var nodes = {};

function drawChecks(mapName, animate=true) {
    let mapImg = $(`.map[data-mapname="${mapName}"`);

    if ($(mapImg).width() <= 100) {
        $(mapImg).on('load', function () { drawChecks(mapName, animate); });
        return;
    }

    closeAllCheckTooltips();

    $('.animate__fadeOut').remove();

    let oldNodes = new Set();
    $('.checkGraphic').each(function () {
        oldNodes.add($(this).attr('data-node-id'));
    });

    let map = $(mapImg).closest('div.tab-pane');
    let parent = $(map).find('div.map-wrapper');
    createNodes(map, mapName);
    for (const nodeId in nodes) {
        let node = nodes[nodeId];
        let keyClass = node.behindKeys ? ' behind-keys' : '';
        let animationClass = animate ? ' animate__bounceInDown' : '';
        let classes = `checkGraphic animate__animated difficulty-${node.difficulty}${keyClass}`;
        let graphic = $(`[data-node-id="${nodeId}"]`);

        if (graphic.length > 0) {
            let currentDiff = $(graphic).attr('data-difficulty');

            if (currentDiff == "9" && node.difficulty >= 0 && node.difficulty < 9) {
                classes += animationClass;
            }
            else {
                $(graphic).removeClass('animate__bounceInDown');
            }
        }
        else {
            classes += animationClass;

            graphic = buildNewCheckGraphic(nodeId);

            $(parent).append(graphic);
        }

        $(graphic).attr({
            'class': classes,
            'data-difficulty': node.difficulty,
        })

        addTooltip(graphic);

        oldNodes.delete(nodeId);
    }

    for (const staleNode of oldNodes) {
        let node = $(`[data-node-id="${staleNode}"]`);
        $(node).removeClass('animate__bounceInDown');
        $(node).addClass('animate__fadeOut');
    }
}

function addTooltip(checkGraphic) {
    let node = nodes[$(checkGraphic).attr('data-node-id')]
    let graphicTemplate = "<div class='tooltip-check-graphic align-self-center difficulty-{0}{1}'></div>";
    let template = "<div class='tooltip-check text-start d-flex p-1 mb-0 {0}' data-check-id='{1}' onclick='toggleSingleNodeCheck(this);' oncontextmenu='return false;'>{2}<div class='tooltip-text align-middle ps-2'>{3} - {4}</div></div>"
    let title = "<div class='map-container'>";
    let first = true;

    for (const id of node.uniqueCheckIds()) {
        let checks = node.checksWithId(id);
        let graphic = '';

        for (const check of checks) {
            let difficulty = check.isChecked() ? 'checked' : check.difficulty;
            let behindKeys = check.behindKeys ? ' behind-keys' : '';

            graphic += graphicTemplate.replace('{0}', difficulty)
                                      .replace('{1}', behindKeys);
        }

        let line = template.replace('{1}', id)
                           .replace('{2}', graphic)
                           .replace('{3}', checks[0].metadata.area)
                           .replace('{4}', checks[0].metadata.name);

        if (!first) {
            line = line.replace('{0}', 'pt-2')
        }
        else {
            line = line.replace(' {0}', '')
            first = false;
        }

        title += line;
    }

    title += '</div>';

    let activated = $(checkGraphic).attr('data-bs-toggle') == "tooltip";

    $(checkGraphic).attr({
        'data-bs-toggle': 'tooltip',
        'data-bs-trigger': 'manual',
        'data-bs-html': 'true',
        'data-bs-title': title,
    });

    if (activated) {
        let oldTooltip = bootstrap.Tooltip.getInstance(checkGraphic);
        oldTooltip.dispose();
    }

    let tooltip = new bootstrap.Tooltip(checkGraphic);
    checkGraphic[0].addEventListener('inserted.bs.tooltip', (x) => {
        $('.tooltip').attr('oncontextmenu', 'return false;');
    })
}

function createNodes(map, mapName) {
    nodes = {};

    let xScale = Math.min(1, $(map).width() / $(map).find('.map').prop('naturalWidth'));
    let yScale = Math.min(1, $(map).height() / $(map).find('.map').prop('naturalHeight'));

    let xOffset = (16 * xScale - localSettings.checkSize) / 2;
    let yOffset = (16 * yScale - localSettings.checkSize) / 2;

    if (entrancePool.length > 0) {
        for (const entrance of entrancePool) {
            entraceData = entranceDict[entrance.id];
        }
    }

    let checks = $('li[data-logic]');
    for (const check of checks) {
        let id = $(check).attr('data-check-id');
        let checkMaps = coordDict[id].locations.map(function(x) { return x.map; });

        if (!(checkMaps.includes(mapName))
            || ($(check).attr('data-logic') == 'Out of logic'
                && !localSettings.showOutOfLogic)) {
            continue;
        }

        let checkData = coordDict[id];
        let behindKeys = $(check).attr('data-behind_keys') == 'True'
        let difficulty = Number($(check).attr('data-difficulty'));
        let coords = checkData.locations;

        for (const coord of coords) {
            if (coord.map != mapName) {
                continue;
            }

            let x = Math.round(coord.x * xScale + xOffset);
            let y = Math.round(coord.y * yScale + yOffset);
            let coordString = MapNode.nodeId(x, y);

            if (!(coordString in nodes)) {
                nodes[coordString] = new MapNode(x, y);
            }

            nodes[coordString].addCheck(id, behindKeys, difficulty);
        }
    }

    for (const key in nodes) {
        nodes[key].update();
    }
}

function buildNewCheckGraphic(id) {
    let coords = MapNode.coordsFromId(id);

    graphic = $('<div>', {
        'data-node-id': id,
        'draggable': false,
        css: {
            'top': coords.y,
            'left': coords.x,
            'width': localSettings.checkSize,
            'height': localSettings.checkSize,
        },
        onclick: 'checkGraphicLeftClick(this);',
        oncontextmenu: 'checkGraphicRightClick(this); return false;',
        onmouseenter: 'checkGraphicMouseEnter(this)',
        onmouseleave: 'checkGraphicMouseLeave(this)',
    });

    return graphic;
}

function deleteAllCheckTooltips() {
    $('.checkGraphic').each((i, e) => {
        let oldTooltip = bootstrap.Tooltip.getInstance(e);
        oldTooltip.dispose();
    });
}

function clearCheckImages() {
    deleteAllCheckTooltips();
    $('.checkGraphic').remove();
}

function closeOtherTooltips(element) {
    let id = $(element).attr('data-node-id');
    let nodes = $(`.checkGraphic[data-node-id!="${id}"]`);
    $(nodes).tooltip('hide');
    $(nodes).removeAttr('data-pinned');
}

function closeAllCheckTooltips() {
    let nodes = $(`.checkGraphic`);
    nodes.tooltip('hide');
    nodes.removeAttr('data-pinned');
}

function drawActiveTab() {
    let activeTabId = $('ul#mapTabs button.active').attr('id');
    let button = $(`button#${activeTabId}`)[0];
    drawChecks(getMapNameFromButton(button), true);
}

function getMapNameFromButton(button) {
    let target = $(button).attr('data-bs-target');
    let img = $(`${target} img.map`);
    let mapName = $(img).attr('data-mapname');

    return mapName;
}

function drawTab(button) {
    drawChecks(getMapNameFromButton(button), false);
}

function checkGraphicMouseEnter(element) {
    if (!hasAttr(element, 'data-pinned')) {
        let tooltip = bootstrap.Tooltip.getInstance(element);
        tooltip.show();
    }
}

function checkGraphicMouseLeave(element) {
    if (!hasAttr(element, 'data-pinned')) {
        let tooltip = bootstrap.Tooltip.getInstance(element);
        tooltip.hide();
    }
}

function nodePrimary(element) { 
    toggleNode(element);
}

function nodeSecondary(element) {
    closeOtherTooltips(element);

    if (hasAttr(element, 'data-pinned')) {
        $(element).removeAttr('data-pinned');
    }
    else {
        $(element).attr('data-pinned', true);
    }
}

function checkGraphicLeftClick(element) {
    if (localSettings.swapMouseButtons) {
        nodeSecondary(element);
    }
    else {
        nodePrimary(element);
    }
}

function checkGraphicRightClick(element) {
    if (localSettings.swapMouseButtons) {
        nodePrimary(element);
    }
    else {
        nodeSecondary(element);
    }
}