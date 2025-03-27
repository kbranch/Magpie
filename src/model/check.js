import { coordDict, setCheckContents } from "@/moduleWrappers";
import { useAccessibilityStore } from "@/stores/accessibilityStore";
import { useStateStore } from "@/stores/stateStore";

export class Check {
    constructor(checkInfo) {
        this.id = checkInfo.id;
        this.metadata = coordDict[this.id];
        this.behindKeys = checkInfo.behindKeys;
        this.behindTrackerLogic = checkInfo.behindTrackerLogic;
        this.isVanilla = checkInfo.vanilla || (this.metadata.vanilla ?? false);
        this.locations = this.metadata.locations;
        this.item = Check.state.checkContents[this.id];
        this.baseDifficulty = checkInfo.difficulty;
        this.requiredRupees = this.metadata.requiredRupees;
        this.hollow = false;
        this.source = checkInfo;
        this.inFilter = false;
        this.hintHighlighted = false;

        if (!(this.id in Check.accessibility.allChecksById)) {
            Check.accessibility.allChecksById[this.id] = [];
        }

        if (!(this.id in Check.accessibility.allChecksById[this.id])) {
            Check.accessibility.allChecksById[this.id].push(this);
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
            && Check.state.settings.enableAutotracking
            && Check.state.settings.autotrackItems
            && Check.state.args.shuffle_small
            && this.isDungeon()) {
            let key = `KEY${this.dungeonNumber()}`
            let unusedKey = `UNUSED_KEY${this.dungeonNumber()}`
            if (Check.state.inventory[key] <= 0
                || (unusedKey in Check.state.inventory
                    && Check.state.inventory[unusedKey] <= 0)
                    && !Check.state.stickyBehindKeys) {
                this.baseDifficulty = 9;
            }
        }

        if (this.isVanilla && this.metadata.vanillaItem) {
            setCheckContents(this.id, this.metadata.vanillaItem, false);
            this.item = this.metadata.vanillaItem;
        }

        this.updateChecked();

        this.behindRupees = this.requiredRupees
                            && (!Check.state.settings.enableAutotracking
                                || !Check.state.settings.autotrackItems
                                || !('RUPEE_COUNT' in Check.state.inventory)
                                || Check.state.inventory['RUPEE_COUNT'] < this.requiredRupees);

        if (!Check.state.settings.showLogic) {
            this.baseDifficulty = 9;
            this.behindRupees = false;
            this.behindKeys = false;
            this.behindTrackerLogic = false;
        }

        if (this.behindKeys || this.behindRupees || this.behindTrackerLogic) {
            this.hollow = true;
        }
    }

    signature() {
        return `${this.id}-${this.behindKeys}-${this.behindTrackerLogic}-${this.isVanilla}-${this.item}-${this.id in Check.state.checkContents ? Check.state.checkContents[this.id] : ''}-${this.checked}`;
    }

    nodeDifficulty() {
        return this.difficulty == -1 ? 'checked' : this.difficulty;
    }

    isChecked() {
        return Check.isChecked(this.id);
    }

    updateChecked() {
        let difficulty = Number(this.baseDifficulty);
        if (!Check.state.settings.showHigherLogic && difficulty > 0) {
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

        return Check.state.inventory[vanillaItem] ?? false
    }

    isValid() {
        return !(this.metadata.condition) || this.metadata.condition(Check.state.args, Check.state.settings);
    }

    fullName() {
        return Check.fullName(this.metadata.area, this.metadata.name);
    }

    shouldDraw() {
        if ((this.difficulty == 9
              && !Check.state.settings.showOutOfLogic)
            || (this.isVanilla && !this.isVanillaOwl()
                && !Check.state.settings.showVanilla)
            || (this.isVanillaOwl()
                && !Check.state.settings.showHints)
            || (this.isOwnedVanillaPickup()
                && !Check.state.settings.showOwnedPickups)
            || !this.isValid()) {

            return false;
        }

        return true;
    }

    isEnabled() {
        return !this.metadata.condition || this.metadata.condition(Check.state.args, Check.state.settings);
    }

    mapLocations(mapName) {
        return this.locations.filter(x => x.map == mapName && (!('condition' in x) || x.condition(Check.state.args, Check.state.settings)));
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

    static init() {
        if (!Check.state) {
            Check.state = useStateStore();
            Check.accessibility = useAccessibilityStore();
        }
    }

    static fullName(area, name) {
        return `${area}-${name}`;
    }

    static isChecked(id) {
        return Check.state.checkedChecks.has(id);
    }

    static isOwl(id) {
        return id.includes('Owl');
    }

    static isVanillaOwl(id) {
        let isOverworld = id.includes('0x0');
        return Check.isOwl(id) && (Check.state.args.owlstatues == '' || (Check.state.args.owlstatues == 'dungeon' && isOverworld) || (Check.state.args.owlstatues == 'overworld' && !isOverworld))
    }

    static loadChecks(bareChecks) {
        Check.accessibility.checksById = {};
        Check.accessibility.allChecksById = {};

        window.allChecksById = Check.accessibility.allChecksById;
        window.checksById = Check.accessibility.checksById;

        Check.accessibility.checks = bareChecks.map(x => {
            let check = new Check(x);
            Check.accessibility.checksById[x.id] = check;

            return check;
        });

        window.checkAccessibility = Check.accessibility.checks;
    }
}