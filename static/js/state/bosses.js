"use strict"

function saveBosses() {
    setLocalStorage("bossMap", JSON.stringify(bossMap));
}

function loadBosses() {
    copyToBossMap(JSON.parse(getLocalStorage("bossMap")));

    if (bossMap == null) {
        resetBosses();
    }
}

function resetBosses() {
    clearBossMap();

    for (const boss of bosses) {
        bossMap[boss.id] = boss.id;
    }

    saveBosses();
}

function mapBoss(vanilla, actual) {
    bossMap[vanilla] = actual;
    saveBosses();

    closeAllTooltips();
    refreshCheckList();
}

function getBossList() {
    if (!bossDataDict) {
        return;
    }

    let nightmares = sortByKey(bosses.filter(x => x.type == "boss"), x => x.value);
    let bossList = nightmares.map(x => bossDataDict[bossMap[x.id]].value);

    return bossList;
}

function getMinibossMap() {
    if (!bossDataDict) {
        return;
    }

    let minibosses = bosses.filter(x => x.type == "miniboss");
    let minibossMap = {};

    for (const miniboss of minibosses) {
        minibossMap[miniboss.key] = bossDataDict[bossMap[miniboss.id]].value;
    }

    return minibossMap;
}