"use strict"

var nodes = {};
var pinned = null;

function removeNodes() {
    if (pinned == null) {
        pinned = $('[data-pinned]').attr('data-node-id');
    }

    $('.check-graphic').remove();
}

// function drawNodes(mapName, animate=true, updateNdi=true) {
//     if (!randomizedEntrances || !localSettings) {
//         return;
//     }

//     let mapImg = document.querySelector(`img[data-mapname="${mapName}"]`);

//     if ($(mapImg).width() <= 100) {
//         $(mapImg).on('load', function () { drawNodes(mapName, animate); });
//         return;
//     }

//     if (typeof randomizedEntrances == 'undefined' || randomizedEntrances === null) {
//         return;
//     }

//     animate = animate
//               && localSettings.animateChecks
//               && !skipNextAnimation;
    
//     skipNextAnimation = false;

//     if (['overworld', 'underworld'].includes(mapName)) {
//         stickyBehindKeys = false;
//         vueApp.updateStickyBehindKeys(stickyBehindKeys);
//     }

//     $('.check-graphic.animate__fadeOut').remove();

//     updateReverseMap();

//     let activeMap = getActiveMap();
//     let map = $(mapImg).closest('div.map-container');
//     let parent = $(map).find('div.map-wrapper');

//     createNodes(map, mapName);

//     for (const nodeId in nodes) {
//         let node = nodes[nodeId];
//         let classes = node.iconClasses();
//         let difficulty = classes.includes('unmapped-entrance') ? node.entrance.difficulty : node.difficulty;

//         node.updateAnimationClasses(classes, parent, animate);
//         node.updateEntranceAttrs();
//         node.updateOverlay(activeMap, graphicalMapSource != null, difficulty, classes);

//         $(node.graphic).attr({
//             'class': classes.join(' '),
//             'data-difficulty': node.difficulty,
//         })
//     }

//     drawLocation();

//     removeOldNodes();

//     if (pinned != null){
//         let toPin = $(`[data-node-id="${pinned}"]`);

//         if (toPin && toPin[0]) {
//             nodeSecondary(toPin[0]);
//         }

//         pinned = null;
//     }

//     if (!pickingEntrances() && updateNdi) {
//         refreshMapNdi();
//     }
// }

function removeOldNodes() {
    let oldNodeIds = $('.check-graphic').toArray()
                         .map(x => $(x).attr('data-node-id'))
                         .filter(x => !(x in nodes));

    for (const staleNodeId of oldNodeIds) {
        let node = $(`[data-node-id="${staleNodeId}"]`);

        $(node).removeClass('animate__bounceInDown');
        $(node).addClass('animate__fadeOut');
        $(node).find('.node-overlay-wrapper').empty();
    }
}

function nodeFromElement(element) {
    return nodes[$(element).attr('data-node-id')];
}