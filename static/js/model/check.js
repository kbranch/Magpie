class Check {
    constructor(checkInfo) {
        this.id = checkInfo.id;
        this.metadata = coordDict[this.id];
        this.behindKeys = checkInfo.behindKeys;
        this.isVanilla = checkInfo.vanilla || (this.metadata.vanilla ?? false);
        this.locations = this.metadata.locations;
        this.item = checkContents[this.id];
        this.baseDifficulty = checkInfo.difficulty;
        this.requiredRupees = this.metadata.requiredRupees;
        this.hollow = false;

        let dungeonMaps = this.locations.map(x => x.map)
                                        .filter(x => !['overworld', 'underworld', 'vanillaOverworld'].includes(x));
        if (dungeonMaps.length == 0) {
            this.mapName = 'overworld';
        }
        else {
            this.mapName = dungeonMaps[0];
        }

        if (this.isVanilla && this.metadata.vanillaItem) {
            setCheckContents(this.id, this.metadata.vanillaItem, false);
        }

        this.updateChecked();

        if (this.behindKeys || this.requiredRupees || this.baseDifficulty == 8) {
            this.hollow = true;
        }
    }

    nodeDifficulty() {
        return this.difficulty == -1 ? 'checked' : this.difficulty;
    }

    isChecked() {
        return Check.isChecked(this.id);
    }

    updateChecked() {
        let difficulty = Number(this.baseDifficulty);
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

    itemOverlay() {
        if (!this.item) {
            return '';
        }

        const  overlayTemplate = '<img class="node-item-overlay" data-node-item="{item}" src="static/images/{item}_1.png" onmousedown="preventDoubleClick(event)">';
        return overlayTemplate.replaceAll('{item}', this.item);
    }

    itemTextImage() {
        if (!this.item) {
            return '';
        }

        const  textItemTemplate = '<img class="text-item pe-1" data-node-item="{item}" src="static/images/{item}_1.png" onmousedown="preventDoubleClick(event)">';
        return textItemTemplate.replaceAll('{item}', this.item);
    }

    static fullName(area, name) {
        return `${area}-${name}`;
    }

    static isChecked(id) {
        return checkedChecks.has(id);
    }
}