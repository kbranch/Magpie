"use strict"

function replaceClass(selector, oldClass, newClass) {
    let elements = document.querySelectorAll(selector);
    elements.forEach(x => x.classList.remove(oldClass));
    elements.forEach(x => x.classList.add(newClass));
}

function snapMap() {
    replaceClass('.check-glow', 'check-glow', 'check-reglowme');

    return htmlToImage.toPng(document.querySelector(".map-container.active"));
}

async function sendMapFrame() {
    let frame = await snapMap();

    $.ajax({
        type: "POST",
        url: "/mapNdi",
        data: {
            data: frame,
        },
    });

    replaceClass('.check-reglowme', 'check-reglowme', 'check-glow');
}

function snapItems() {
    replaceClass('.glow', 'glow', 'reglowme');

    return htmlToImage.toPng(document.querySelector("#itemContainer"));
}

async function sendItemFrame() {
    let frame = await snapItems();

    $.ajax({
        type: "POST",
        url: "/itemsNdi",
        data: {
            data: frame,
        },
    });

    replaceClass('.reglowme', 'reglowme', 'glow');
}

var itemNdiTimeout = null;
function refreshItemNdi() {
    if (itemNdiTimeout) {
        clearTimeout(itemNdiTimeout);
    }

    itemNdiTimeout = setTimeout(sendItemFrame, 500);
}

let mapNdiTimeout = null;
function refreshMapNdi() {
    if (mapNdiTimeout) {
        clearTimeout(mapNdiTimeout);
    }

    mapNdiTimeout = setTimeout(sendMapFrame, 1000);
}