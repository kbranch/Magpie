class MapNode {
    constructor(location, scaling, entranceId=null) {
        this.x = Math.round(location.x * scaling.x + scaling.offset.x);
        this.y = Math.round(location.y * scaling.y + scaling.offset.y);
        this.location = location;
        this.scaling = scaling;
        this.hideMe = false;

        this.checks = [];
        this.entrance = entranceId == null ? null : new Entrance(entranceId);
    }

    id() {
        return MapNode.nodeId(this.location, this.scaling);
    }

    entranceConnectedTo() {
        return this.entrance?.connectedTo() ?? null;
    }

    entranceConnectedFrom() {
        return this.entrance?.connectedFrom() ?? null;
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
                         || this.entranceConnectedTo() == 'landfill';
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
        if (this.hideMe){
            return true;
        }

        if (localSettings.hideChecked
            && this.isChecked
            && (this.entrance == null
                || (this.entranceConnectedTo() != startHouse
                    && (this.entrance.type != 'connector')
                        || this.entrance.connectedTo() == 'landfill'))) {
            return true;
        }

        if (this.entrance == null) {
            return false;
        }

        if (args.randomstartlocation
            && args.entranceshuffle == 'none'
            && Entrance.isFound(startHouse)
            && this.entrance.connectedTo() != startHouse
            && this.checks.length == 0) {

            if (!args.dungeonshuffle) {
                return true;
            }

            if (args.dungeonshuffle
                && this.entrance.canBeStart()) {
                return true;
            }
        }
    }

    tooltipHtml(pinned, connectionType) {
        let tooltip = new NodeTooltip(this);
        return tooltip.tooltipHtml(pinned, connectionType);
    }

    iconClasses() {
        let pickingEntrance = graphicalMapSource != null;
        let classes = ['check-graphic', 'animate__animated'];

        if (pickingEntrance)
        {
            return ['check-graphic', 'entrance-only'];
        }

        if (this.behindKeys) {
            classes.push('behind-keys');
        }

        if (this.isVanilla) {
            classes.push('vanilla');
        }

        if (this.entrance != null) {
            if (this.entrance.isMapped()) {
                let mappedEntrance = new Entrance(this.entrance.connectedTo());

                if (args.randomstartlocation 
                    && mappedEntrance.id == startHouse) {
                    classes.push('start-location');
                }

                if (mappedEntrance.type == 'connector') {
                    let connection = this.entrance.mappedConnection();
                    if (connection?.thisSideBlocked(this.entrance.id)) {
                        classes.push('one-way-out');
                    }
                    else if (connection?.otherSideBlocked(this.entrance.id)) {
                        classes.push('one-way-in');
                    }

                    if (this.isChecked || this.checks.length == 0) {
                        if (connection?.isIncomplete()) {
                            classes.push('partial-entrance');
                        }
                        else {
                            classes.push('entrance-only');
                        }
                    }
                    else {
                        classes.push(`difficulty-${this.difficulty}`);
                    }

                    classes.push('connector');
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
}