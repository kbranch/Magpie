class Check {
    constructor(checkInfo) {
        this.id = checkInfo.id;
        this.metadata = coordDict[this.id];
        this.behindKeys = checkInfo.behindKeys;
        this.isVanilla = checkInfo.vanilla || (this.metadata.vanilla ?? false);
        this.locations = this.metadata.locations;
        this.item = checkContents[this.id];

        let dungeonMaps = this.locations.map(x => x.map)
                                        .filter(x => x != 'overworld');
        if (dungeonMaps.length == 0) {
            this.mapName = 'overworld';
        }
        else {
            this.mapName = dungeonMaps[0];
        }

        if (this.isVanilla && this.metadata.vanillaItem) {
            setCheckContents(this.id, this.metadata.vanillaItem, false);
        }

        let difficulty = Number(checkInfo.difficulty);
        if (!localSettings.showHigherLogic && difficulty > 0 && difficulty != 8) {
            difficulty = 9;
        }

        if (this.isChecked()) {
            this.difficulty = -1;
        }
        else {
            this.difficulty = difficulty;
        }
    }

    nodeDifficulty() {
        return this.difficulty == -1 ? 'checked' : this.difficulty;
    }

    isChecked() {
        return Check.isChecked(this.id);
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
                && !localSettings.showVanilla)
            || (this.isOwnedVanillaPickup()
                && !localSettings.showOwnedPickups)) {

            return false;
        }

        return true;
    }

    mapLocations(mapName) {
        return this.locations.filter(x => x.map == mapName);
    }

    static fullName(area, name) {
        return `${area}-${name}`;
    }

    static isChecked(id) {
        return checkedChecks.has(id);
    }
}