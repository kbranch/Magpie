class MapNode {
    constructor(location, scaling, entranceId=null) {
        this.x = Math.round(location.x * scaling.x + scaling.offset.x);
        this.y = Math.round(location.y * scaling.y + scaling.offset.y);
        this.location = location;
        this.scaling = scaling;
        this.hideMe = false;
        this.item = null;
        this.connectorLabel = null;

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
                                                      && !x.isChecked()
                                                      && (!x.isVanillaOwl() || this.checks.length == 1))

        this.behindKeys = uncheckedChecks.length > 0 
                          && uncheckedChecks.every(x => x.behindKeys);
    }

    updateDifficulty() {
        this.difficulty = 'checked';

        for (const check of this.checks) {
            if (!check.isChecked() && (!check.isVanillaOwl() || this.checks.length == 1)) {
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
                                                     && x.isChecked() == this.isChecked
                                                     && (!x.isVanillaOwl() || this.checks.length == 1))
                                        .every(x => x.isVanilla));
    }
    
    updateItem() {
        this.item = null;

        let itemedChecks = this.checks.filter(x => x.item);
        let uncheckedItems = itemedChecks.filter(x => !x.isChecked());

        if (uncheckedItems.length > 0) {
            this.item = uncheckedItems[0].item;
        }
        else if (itemedChecks.length == 1 && this.checks.length == 1) {
            this.item = itemedChecks[0].item;
        }
    }

    update() {
        this.updateDifficulty();
        this.updateBehindKeys();
        this.updateIsChecked();
        this.updateIsVanilla();
        this.updateItem();
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

        return false;
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

        if (this.checks.length == 1 && this.checks[0].id.includes('Owl')) {
            classes.push('owl');
        }

        let items = this.checks.filter(x => x.item)
                               .map(x => x.item);
        let hoveredItems = items.filter(x => hoveredItems.includes(x));
        if (hoveredItems.length > 0) {
            classes.push('spoiler-highlight');
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
                        if (connection?.isIncomplete()
                            || (this.entrance.isConnector() && !this.entrance.isConnected())) {
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
                else if (mappedEntrance.id == 'bk_shop') {
                    classes.push('bk');
                }
                else {
                    classes.push('entrance-only');
                }
            }
            else if (this.difficulty == 'checked') {
                if (!args.randomstartlocation 
                    || Entrance.isFound(startHouse)
                    || this.entrance.isConnector()) {
                    classes.push('entrance-only');
                    classes.push('unmapped-entrance');
                    classes.push(`entrance-difficulty-${this.entrance.difficulty}`);
                }
                else {
                    classes.push('possible-start-location');
                }
            }
            else {
                classes.push(`difficulty-${this.difficulty}`);
            }
        }
        else {
            classes.push(`difficulty-${this.difficulty}`);
        }

        return classes;
    }

    updateEntranceAttrs() {
        let entrance = this.entrance
    
        if (entrance == null) {
            $(this.graphic).removeAttr('data-entrance-id');
    
            return;
        }
    
        $(this.graphic).attr('data-entrance-id', entrance.id);
    
        if (entrance.isConnector()) {
            if (entrance.isConnected()) {
                let connection = entrance.mappedConnection();
                $(this.graphic).attr('data-connected-to', connection.otherSides(entrance.id).join(';'));
                this.connectorLabel = connection.label;
            }
            else {
                $(this.graphic).removeAttr('data-connected-to');
                $(this.graphic).empty();
            }
        }
        else {
            if (entrance.isRemapped()) {
                $(this.graphic).attr('data-connected-to', entrance.connectedTo());
            }
            else {
                $(this.graphic).removeAttr('data-connected-to');
            }
    
            if (entrance.isFound()
                && !entrance.isMappedToSelf()) {
                $(this.graphic).attr('data-connected-from', entrance.connectedFrom());
            }
            else {
                $(this.graphic).removeAttr('data-connected-from');
            }
        }
    }
    
    updateAnimationClasses(classes, parent, animate) {
        let animationClass = animate ? 'animate__bounceInDown' : '';
        this.graphic = $(`[data-node-id="${this.id()}"]`);
    
        if (this.graphic.length > 0) {
            let currentDiff = $(this.graphic).attr('data-difficulty');
    
            if (currentDiff == "9" && this.difficulty >= 0 && this.difficulty < 9) {
                classes.push(animationClass);
            }
            else {
                $(this.graphic).removeClass('animate__bounceInDown');
            }
        }
        else {
            classes.push(animationClass);
    
            this.createGraphic();
    
            $(parent).append(this.graphic);
        }
    }

    updateOverlay() {
        let overlay = $('<div>', {
            'class': 'node-overlay-wrapper',
        });

        if (this.item) {
            let itemOverlay = $('<img>', {
                'src': `static/images/${this.item}_1.png`,
                'class': "node-item-overlay",
                'data-node-item': this.item,
                onmousedown: "preventDoubleClick(event)"
            });

            $(overlay).append(itemOverlay);
        }

        if (this.connectorLabel) {
            let connectorOverlay = $('<p>', {
                'class': "node-overlay",
                'data-connector-label': this.connectorLabel,
                css: {
                    'font-size': `${localSettings.checkSize * 0.72}px`,
                },
                onmousedown: "preventDoubleClick(event)"
            });

            $(connectorOverlay).append(this.connectorLabel);
            $(overlay).append(connectorOverlay);
        }

        $(this.graphic).empty();
        $(this.graphic).append(overlay);
    }

    createGraphic() {
        let coords = MapNode.coordsFromId(this.id());

        this.graphic = $('<div>', {
            'data-node-id': this.id(),
            'data-item': this.item,
            'draggable': false,
            css: {
                'top': coords.y,
                'left': coords.x,
                'width': localSettings.checkSize,
                'height': localSettings.checkSize,
            },
            onclick: 'checkGraphicLeftClick(this);',
            oncontextmenu: 'checkGraphicRightClick(this); return false;',
            onmouseenter: 'checkGraphicMouseEnter(this)',
            onmouseleave: 'checkGraphicMouseLeave(this)',
        });
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