"use strict"

function replaceClass(selector, oldClass, newClass) {
    let elements = document.querySelectorAll(selector);
    elements.forEach(x => x.classList.remove(oldClass));
    elements.forEach(x => x.classList.add(newClass));
}

function snapMap() {
    replaceClass('.check-glow', 'check-glow', 'check-reglowme');

    return htmlToImage.toJpeg(document.querySelector(".map-container.active"), { quality: 0.95 });
}

async function sendMapFrame() {
    let frame = await snapMap();
    let data = new FormData();
    data.append('data', frame);

    fetch('/api/mapBroadcastFrame', {
        method: 'POST',
        body: data,
    });

    replaceClass('.check-reglowme', 'check-reglowme', 'check-glow');
}

function snapItems() {
    replaceClass('.glow', 'glow', 'reglowme');

    return htmlToImage.toPng(document.querySelector("#itemContainer"));
}

async function sendItemFrame() {
    let frame = await snapItems();
    let data = new FormData();
    data.append('data', frame);

    fetch('/api/itemsBroadcastFrame', {
        method: 'POST',
        body: data,
    });

    replaceClass('.reglowme', 'reglowme', 'glow');
}

var itemsBroadcastTimeout = null;
function refreshItemNdi() {
    if ((localSettings?.broadcastItems ?? 'none') == 'none') {
        return;
    }

    if (itemsBroadcastTimeout) {
        clearTimeout(itemsBroadcastTimeout);
    }

    itemsBroadcastTimeout = setTimeout(sendItemFrame, 500);
}

let mapBroadcastTimeout = null;
function refreshMapNdi() {
    if ((localSettings?.broadcastMap ?? 'none') == 'none') {
        return;
    }

    if (mapBroadcastTimeout) {
        clearTimeout(mapBroadcastTimeout);
    }

    mapBroadcastTimeout = setTimeout(sendMapFrame, 1000);
}