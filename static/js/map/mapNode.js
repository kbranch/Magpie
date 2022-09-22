class MapNode {
    constructor(location, scaling, entrance=null) {
        this.x = Math.round(location.x * scaling.x + scaling.offset.x);
        this.y = Math.round(location.y * scaling.y + scaling.offset.y);
        this.location = location;
        this.scaling = scaling;

        this.checks = [];
        this.entrance = entrance;
    }

    id() {
        return MapNode.nodeId(this.location, this.scaling);
    }

    uniqueCheckIds() {
        return new Set(this.checks.map(x => x.id));
    }

    checksWithId(id) {
        return this.checks.filter(x => x.id == id);
    }

    sortChecks() {
        this.checks.sort((a, b) => a.metadata.index - b.metadata.index);
    }

    updateBehindKeys() {
        let uncheckedChecks = this.checks.filter(x => x.difficulty == this.difficulty
                                                      && !x.isChecked())

        this.behindKeys = uncheckedChecks.length > 0 
                          && uncheckedChecks.every(x => x.behindKeys);
    }

    updateDifficulty() {
        this.difficulty = 'checked';

        for (const check of this.checks) {
            if (!check.isChecked()) {
                if ((check.difficulty < this.difficulty || this.difficulty == 'checked')) {
                    this.difficulty = check.difficulty;
                }
            }
        }
    }

    updateIsChecked() {
        this.isChecked = (this.checks.length > 0
                          && this.checks.every(x => x.isChecked()))
                         || (this.entrance != null
                             && entranceMap[this.entrance.id] == 'landfill');
    }

    updateIsVanilla() {
        this.isVanilla = (this.checks.length > 0
                          && this.checks.filter(x => x.difficulty == this.difficulty
                                                     && x.behindKeys == this.behindKeys
                                                     && x.isChecked() == this.isChecked)
                                        .every(x => x.isVanilla));
    }

    update() {
        this.updateDifficulty();
        this.updateBehindKeys();
        this.updateIsChecked();
        this.updateIsVanilla();
        this.sortChecks();
    }

    canBeHidden() {
        if (localSettings.hideChecked
            && this.isChecked
            && (this.entrance == null
                || (entranceMap[this.entrance.id] != 'start_house'
                    && this.entrance.entranceType != 'connector'))) {
            return true;
        }

        if (this.entrance == null) {
            return false;
        }

        if (args.randomstartlocation
            && args.entranceshuffle == 'none'
            && 'start_house' in reverseEntranceMap
            && this.entrance.id != reverseEntranceMap['start_house']
            && this.checks.length == 0) {

            if (!args.dungeonshuffle) {
                return true;
            }

            if (args.dungeonshuffle
                && startLocations.includes(this.entrance.id)) {
                return true;
            }
        }
    }

    tooltipHtml(pinned) {
        let tooltip = new NodeTooltip(this);
        return tooltip.tooltipHtml(pinned);
    }

    iconClasses() {
        let classes = ['checkGraphic', 'animate__animated'];

        if (this.behindKeys) {
            classes.push('behind-keys');
        }

        if (this.isVanilla) {
            classes.push('vanilla');
        }

        if (this.entrance != null) {
            if (this.entrance.id in entranceMap) {
                let mappedEntrance = entranceDict[entranceMap[this.entrance.id]];

                if (args.randomstartlocation 
                    && mappedEntrance.id == 'start_house') {
                    classes.push('start-location');
                }

                if (mappedEntrance.entranceType == 'connector') {
                    if (this.isChecked || this.checks.length == 0) {
                        classes.push('entrance-only');
                    }
                    else {
                        classes.push(`difficulty-${this.difficulty}`);
                    }
                }
                else if (this.checks.length > 0) {
                    classes.push(`difficulty-${this.difficulty}`);
                }
                else if (mappedEntrance.id == 'landfill') {
                    classes.push('difficulty-checked');
                }
                else {
                    classes.push('entrance-only');
                }
            }
            else {
                classes.push('unmapped-entrance');
            }
        }
        else {
            classes.push(`difficulty-${this.difficulty}`);
        }

        return classes;
    }

    static nodeId(location, scaling) {
        return `${Math.round(location.x * scaling.x + scaling.offset.x)},${Math.round(location.y * scaling.y + scaling.offset.y)}`;
    }

    static coordsFromId(id) {
        let chunks = id.split(',');
        return {
            x: Number(chunks[0]),
            y: Number(chunks[1])
        };
    }

    static getValidConnections(entranceId) {
        let entrance = entranceDict[entranceId];
        let requireConnector = entrance.entranceType == 'connector';
        let options = entrances.filter(x => (entranceDict[x].entranceType == 'connector') == requireConnector
                                             && entranceDict[x].entranceType != 'dummy'
                                             && !(x in reverseEntranceMap))
                                .map(x => [x, entranceDict[x].name]);
        return options;
    }
}