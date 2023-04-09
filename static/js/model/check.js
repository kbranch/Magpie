class Check {
    constructor(id, behindKeys, difficulty, locations, mapName, vanilla=false, item) {
        this.id = id;
        this.metadata = coordDict[this.id];
        this.behindKeys = behindKeys;
        this.isVanilla = vanilla || (this.metadata.vanilla ?? false);
        this.locations = locations.filter(x => x.map == mapName);
        this.mapName = mapName
        this.item = item;

        if (this.isVanilla && this.metadata.vanillaItem) {
            setCheckContents(this.id, this.metadata.vanillaItem, false);
        }

        if (!localSettings.showHigherLogic && difficulty > 0 && difficulty != 8) {
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

    isDungeon() {
        return this.mapName != 'overworld';
    }

    dungeonNumber() {
        return Number(this.mapName[1]);
    }

    isVanillaOwl() {
        let isOverworld = this.id.includes('0x0');
        return this.isOwl() && (args.owlstatues == '' || (args.owlstatues == 'dungeon' && isOverworld) || (args.owlstatues == 'overworld' && !isOverworld))
    }

    isOwl() {
        return this.id.includes('Owl');
    }

    isOwnedVanillaPickup() {
        let vanillaItem = this.metadata.vanillaItem;

        return inventory[vanillaItem] ?? false
    }

    fullName() {
        return Check.fullName(this.metadata.area, this.metadata.name);
    }

    shouldDraw() {
        if ((this.difficulty == 9
              && !localSettings.showOutOfLogic)
            || (this.isVanilla
                && !localSettings.showVanilla)) {

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