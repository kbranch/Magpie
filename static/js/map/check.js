class Check {
    constructor(id, behindKeys, difficulty, locations, mapName, vanilla=false) {
        this.id = id;
        this.metadata = coordDict[this.id];
        this.behindKeys = behindKeys;
        this.isVanilla = vanilla;
        this.locations = locations.filter(x => x.map == mapName);
        this.mapName = mapName

        if (localSettings.ignoreHigherLogic && difficulty > 0) {
            difficulty = 9;
        }

        if (this.fullName in checkedChecks) {
            this.difficulty = -1;
        }
        else {
            this.difficulty = difficulty;
        }
    }

    isChecked() {
        return this.fullName() in checkedChecks;
    }

    fullName() {
        return `${this.metadata.area}-${this.metadata.name}`;
    }

    shouldDraw() {
        if ((this.difficulty == 9
              && !localSettings.showOutOfLogic)
            || (this.vanilla
                && localSettings.hideVanilla)) {

            return false;
        }

        return true;
    }
}