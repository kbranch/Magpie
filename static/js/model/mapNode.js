class MapNode {
    constructor(location, scaling, entranceId=null, bossMetadata=null) {
        this.x = Math.round(location.x * scaling.x + scaling.offset.x);
        this.y = Math.round(location.y * scaling.y + scaling.offset.y);
        this.location = location;
        this.scaling = scaling;
        this.hideMe = false;
        this.item = null;
        this.connectorLabel = null;

        this.checks = [];
        this.entrance = entranceId == null ? null : new Entrance(entranceId);
        this.boss = bossMetadata == null ? null : new Boss(bossMetadata);
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

    isDungeon(pickingEntrance) {
        if (pickingEntrance) {
            return this.entrance?.isDungeon();
        }

        return this.entrance?.isMappedToDungeon()
               || (this.checks.length > 0
                   && this.checks[0].metadata.locations.some(x => x.map != 'overworld'));
    }

    dungeonName(pickingEntrance) {
        if (pickingEntrance) {
            return this.entrance.id.toUpperCase();
        }

        if (this.entrance?.isMappedToDungeon()) {
            return this.entrance.connectedTo().toUpperCase();
        }

        return this.checks[0].metadata.locations
            .filter(x => x.map != 'overworld')[0]
            .map.toUpperCase();
    }

    isNightmare() {
        return this.boss && this.boss.type == 'boss';
    }

    isMiniboss() {
        return this.boss && this.boss.type == 'miniboss';
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
        let checks = this.checks.filter(x => !x.isVanillaOwl());
        this.isChecked = (checks.length > 0
                          && checks.every(x => x.isChecked()))
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

        let checks = this.checks.sort((a, b) => a.difficulty - b.difficulty || a.isVanilla - b.isVanilla);
        let uncheckedChecks = checks.filter(x => !x.isChecked());
        let itemedChecks = checks.filter(x => x.item);
        let uncheckedItems = itemedChecks.filter(x => !x.isChecked());

        if (uncheckedItems.length > 0 && (!uncheckedItems[0].isVanilla || uncheckedChecks[0].isVanilla)) {
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

        if (!localSettings.showChecked
            && this.isChecked
            && (this.entrance == null
                || (this.entranceConnectedTo() != startHouse
                    && (!this.entrance.isConnectedToConnector())
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
        let classes = ['check-graphic', 'animate__animated'];

        if (pickingEntrances())
        {
            return ['check-graphic', 'entrance-only'];
        }

        if (this.boss) {
            return ['check-graphic', this.boss.type];
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
        let hoverItems = items.filter(x => hoveredItems.includes(x));
        if (hoverItems.length > 0) {
            classes.push('spoiler-highlight');
        }

        if (this.entrance != null) {
            if (this.entrance.isMapped()) {
                let mappedEntrance = new Entrance(this.entrance.connectedTo());

                if (args.randomstartlocation 
                    && mappedEntrance.id == startHouse) {
                    classes.push('start-location');
                }

                if (mappedEntrance.type == 'connector' || mappedEntrance.type == 'stairs') {
                    if (Connection.thisSideBlocked(this.entrance.id)) {
                        classes.push('one-way-out');
                    }
                    else if (Connection.otherSideBlocked(this.entrance.id)) {
                        classes.push('one-way-in');
                    }

                    let connection = this.entrance.mappedConnection();
                    if (this.isChecked || this.checks.length == 0) {
                        if (connection?.vanilla) {
                            classes.push('vanilla-entrance-only');
                        }
                        else {
                            classes.push('entrance-only');
                        }
                    }
                    else {
                        classes.push(`difficulty-${this.difficulty}`);
                    }

                    if (connection?.isIncomplete()
                        || (this.entrance.isConnectedToConnector() && !this.entrance.isConnected())) {
                        classes.push('partial-entrance');
                    }

                    classes.push('connector');
                }
                else if (this.checks.length > 0) {
                    classes.push(`difficulty-${this.difficulty}`);
                }
                else if (mappedEntrance.id == 'landfill'
                         || mappedEntrance.type == 'dummy') {
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
                    || (args.entranceshuffle != 'mixed' && this.entrance.isConnector())) {
                    classes.push('entrance-only');
                    classes.push('unmapped-entrance');
                    classes.push(`entrance-difficulty-${this.entrance.difficulty}`);
                }
                else {
                    classes.push('possible-start-location');
                }
            }
            else {
                classes.push(`difficulty-${this.entrance.difficulty}`);
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
    
        if (entrance.isConnectedToConnector()) {
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

    updateOverlay(activeMap, pickingEntrance, difficulty) {
        let overlay = $('<div>', {
            'class': 'node-overlay-wrapper',
        });

        let hideDifficulty = pickingEntrance;
        hideDifficulty |= this.checks.length == 0
                          && this.entrance?.isMapped()
                          && this.entrance?.connectedTo() != 'landfill'
                          && !this.entrance?.connectedToDummy();
        hideDifficulty |= !localSettings.showChecked
                          && difficulty == 'checked';
        hideDifficulty |= args.randomstartlocation
                          && !Entrance.isFound('start_house');
        hideDifficulty |= args.randomstartlocation
                          && this.entrance?.connectedTo() == 'start_house'
                          && this.difficulty == 'checked';
        hideDifficulty |= this.boss != null;

        if (!hideDifficulty) {
            let vanilla = this.isVanilla && this.difficulty != 'checked' ? '-vanilla' : '';

            let iconWrapper = $('<div>', {
                'class': `icon-wrapper icon-difficulty-${difficulty}`,
                css: {
                    'width': checkSize,
                    'height': checkSize,
                },
            });
            let svg = $('<svg>', {
                'class': 'icon',
                css: {
                    'width': checkSize,
                    'height': checkSize,
                },
            })
            let use = $('<use>', {
                'xlink:href': `#difficulty-${difficulty}${vanilla}`,
            });

            svg.append(use);
            iconWrapper.append(svg);
            $(iconWrapper).html($(iconWrapper).html());
            overlay.append(iconWrapper);
        }

        if (this.boss) {
            let itemOverlay = $('<img>', {
                'src': `static/images/${this.boss.mappedTo}.png`,
                'class': "node-boss-overlay",
                'data-node-item': this.item,
                onmousedown: "preventDoubleClick(event)"
            });

            $(overlay).append(itemOverlay);
        }

        if (this.item) {
            let itemOverlay = $('<img>', {
                'src': `static/images/${this.item}_1.png`,
                'class': "node-item-overlay",
                'data-node-item': this.item,
                onmousedown: "preventDoubleClick(event)"
            });

            $(overlay).append(itemOverlay);
        }

        if ((this.connectorLabel && !pickingEntrance)
            || (this.isDungeon(pickingEntrance)
                && activeMap == 'overworld')) {

            let shadowSize = 1 / (localSettings.checkSize / checkSize);

            let connectorOverlay = $('<p>', {
                'class': "node-overlay",
                'data-connector-label': this.connectorLabel,
                css: {
                    'font-size': `${checkSize * 0.72}px`,
                    'text-shadow': `-${shadowSize}px -${shadowSize}px 0 black,  
                                    ${shadowSize}px -${shadowSize}px 0 black,
                                    -${shadowSize}px  ${shadowSize}px 0 black,
                                    ${shadowSize}px  ${shadowSize}px 0 black`,
                },
                onmousedown: "preventDoubleClick(event)"
            });

            let label;
            if (this.connectorLabel) {
                label = this.connectorLabel;
            }
            else {
                label = this.dungeonName(pickingEntrance)[1];
            }

            $(connectorOverlay).append(label);

            $(overlay).append(connectorOverlay);
        }

        $(this.graphic).empty();
        $(this.graphic).append(overlay);
    }

    createGraphic() {
        let coords = MapNode.coordsFromId(this.id());
        let size = Number(checkSize);
        let x = coords.x;
        let y = coords.y;

        if (this.boss) {
            let extra = checkSize * 0.5;
            size += extra;
            x -= extra / 2;
            y -= extra / 2;
        }

        this.graphic = $('<div>', {
            'data-node-id': this.id(),
            'data-item': this.item,
            'data-boss': this.boss?.id,
            'draggable': false,
            css: {
                'top': y,
                'left': x,
                'width': size,
                'height': size,
            },
        });

        this.graphic.on('click', (e) => { 
            checkGraphicLeftClick(e);
        });
        this.graphic.on('auxclick', (e) => { 
            if (e.button == 1) {
                nodeMiddle(e.currentTarget);
            }
        });
        this.graphic.on('contextmenu', (e) => { 
            checkGraphicRightClick(e);
            return false;
        });
        this.graphic.on('mouseenter', (e) => {
            checkGraphicMouseEnter(e.currentTarget);
        });
        this.graphic.on('mouseleave', (e) => {
            checkGraphicMouseLeave(e.currentTarget);
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