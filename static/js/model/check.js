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
        return Check.isChecked(this.fullName());
    }

    fullName() {
        return Check.fullName(this.metadata.area, this.metadata.name);
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

    static fullName(area, name) {
        return `${area}-${name}`;
    }

    static isChecked(fullName) {
        return fullName in checkedChecks;
    }
}