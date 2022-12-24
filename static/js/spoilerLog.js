let spoilerLog = null;
let itemsByLocation = {};

function loadLogFile(element) {
    if (element.files.length == 0) {
        return;
    }

    let file = element.files[0];

    if (file.name.endsWith(".json")) {
        getFile(element, loadLogContents);
        return;
    }

    getBinaryFile(element, loadLogFromRom);
}

function loadLogFromRom(romData) {
    // TODO: add this endpoint
}

function loadLogContents(logText) {
    log = JSON.parse(logText);

    if (!log.seed) {
        return;
    }

    spoilerLog = log;

    items = [...log.accessibleItems].concat(log.inaccessibleItems);

    itemsByLocation = items.reduce((dict, x) => {
        dict[x.id] = x.itemName;
        return dict;
    });
}

function spoilLocation(checkId) {
    setCheckContents(checkId, itemsByLocation[checkId]);
}