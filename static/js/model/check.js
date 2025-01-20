class Check {
    constructor(checkInfo) {
        this.id = checkInfo.id;
        this.metadata = coordDict[this.id];
        this.behindKeys = checkInfo.behindKeys;
        this.behindTrackerLogic = checkInfo.behindTrackerLogic;
        this.isVanilla = checkInfo.vanilla || (this.metadata.vanilla ?? false);
        this.locations = this.metadata.locations;
        this.item = checkContents[this.id];
        this.baseDifficulty = checkInfo.difficulty;
        this.requiredRupees = this.metadata.requiredRupees;
        this.hollow = false;
        this.source = checkInfo;
        this.inFilter = false;
        this.hintHighlighted = false;

        if (!(this.id in allChecksById)) {
            allChecksById[this.id] = [];
        }

        if (!(this.id in allChecksById[this.id])) {
            allChecksById[this.id].push(this);
        }

        let dungeonMaps = this.locations.map(x => x.map)
                                        .filter(x => !['overworld', 'underworld', 'vanillaOverworld'].includes(x));
        if (dungeonMaps.length == 0) {
            this.mapName = 'overworld';
        }
        else {
            this.mapName = dungeonMaps[0];
        }

        if (this.behindKeys 
            && localSettings.enableAutotracking
            && localSettings.autotrackItems
            && this.isDungeon()) {
            let key = `KEY${this.dungeonNumber()}`
            let unusedKey = `UNUSED_KEY${this.dungeonNumber()}`
            if (inventory[key] <= 0
                || (unusedKey in inventory
                    && inventory[unusedKey] <= 0)
                    && !stickyBehindKeys) {
                this.baseDifficulty = 9;
            }
        }

        if (this.isVanilla && this.metadata.vanillaItem) {
            setCheckContents(this.id, this.metadata.vanillaItem, false);
            this.item = this.metadata.vanillaItem;
        }

        this.updateChecked();

        this.behindRupees = this.requiredRupees
                            && (!localSettings.enableAutotracking
                                || !localSettings.autotrackItems
                                || !('RUPEE_COUNT' in inventory)
                                || inventory['RUPEE_COUNT'] < this.requiredRupees);

        if (this.behindKeys || this.behindRupees || this.behindTrackerLogic) {
            this.hollow = true;
        }
    }

    signature() {
        return `${this.id}-${this.behindKeys}-${this.behindTrackerLogic}-${this.isVanilla}-${this.item}-${this.id in checkContents ? checkContents[this.id] : ''}-${this.checked}`;
    }

    nodeDifficulty() {
        return this.difficulty == -1 ? 'checked' : this.difficulty;
    }

    isChecked() {
        return Check.isChecked(this.id);
    }

    updateChecked() {
        let difficulty = Number(this.baseDifficulty);
        if (!localSettings.showHigherLogic && difficulty > 0) {
            difficulty = 9;
        }

        if (this.isChecked()) {
            this.difficulty = -1;
            this.checked = true;
        }
        else {
            this.difficulty = difficulty;
            this.checked = false;
        }
    }

    isDungeon() {
        return this.mapName != 'overworld';
    }

    dungeonNumber() {
        return Number(this.mapName[1]);
    }

    isVanillaOwl() {
        return Check.isVanillaOwl(this.id);
    }

    isOwl() {
        return Check.isOwl(this.id);
    }

    isOwnedVanillaPickup() {
        let vanillaItem = this.metadata.vanillaItem;

        return inventory[vanillaItem] ?? false
    }

    isValid() {
        return !(this.metadata.condition) || this.metadata.condition(args, localSettings);
    }

    fullName() {
        return Check.fullName(this.metadata.area, this.metadata.name);
    }

    shouldDraw() {
        if ((this.difficulty == 9
              && !localSettings.showOutOfLogic)
            || (this.isVanilla && !this.isVanillaOwl()
                && !localSettings.showVanilla)
            || (this.isVanillaOwl()
                && !localSettings.showHints)
            || (this.isOwnedVanillaPickup()
                && !localSettings.showOwnedPickups)
            || !this.isValid()) {

            return false;
        }

        return true;
    }

    isEnabled() {
        return !this.metadata.condition || this.metadata.condition(args, localSettings);
    }

    mapLocations(mapName) {
        return this.locations.filter(x => x.map == mapName && (!('condition' in x) || x.condition(args, localSettings)));
    }

    itemOverlay() {
        if (!this.item) {
            return '';
        }

        const  overlayTemplate = '<img class="node-item-overlay" data-node-item="{item}" src="/images/{item}_1.png" onmousedown="preventDoubleClick(event)">';
        return overlayTemplate.replaceAll('{item}', this.item);
    }

    itemTextImage() {
        if (!this.item) {
            return '';
        }

        const  textItemTemplate = '<img class="text-item pe-1" data-node-item="{item}" src="/images/{item}_1.png" onmousedown="preventDoubleClick(event)">';
        return textItemTemplate.replaceAll('{item}', this.item);
    }

    isHigherLogic() {
        return this.baseDifficulty > 0 && this.baseDifficulty < 9 && !this.checked;
    }

    static fullName(area, name) {
        return `${area}-${name}`;
    }

    static isChecked(id) {
        return checkedChecks.has(id);
    }

    static isOwl(id) {
        return id.includes('Owl');
    }

    static isVanillaOwl(id) {
        let isOverworld = id.includes('0x0');
        return Check.isOwl(id) && (args.owlstatues == '' || (args.owlstatues == 'dungeon' && isOverworld) || (args.owlstatues == 'overworld' && !isOverworld))
    }
}

window.Check = Check;