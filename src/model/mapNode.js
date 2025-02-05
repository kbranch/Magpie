import { useStateStore } from "@/stores/stateStore";
import { Boss } from "./boss";
import { Connection } from "./connection";
import { Entrance } from "./entrance";
import { advancedER, checkGraphicLeftClick, checkGraphicMouseEnter, checkGraphicMouseLeave, checkGraphicRightClick, connectorsMixed, coupledEntrances, createElement, inOutEntrances, nodeMiddle, pickingEntrances, sortByKey } from "@/moduleWrappers";
import { useAccessibilityStore } from "@/stores/accessibilityStore";
import { useNodeTooltipStore } from "@/stores/nodeTooltipStore";

const $ = window.$;

export class MapNode {
    constructor(location, scaling, entranceId=null, bossMetadata=null, logicHint=null) {
        this.x = Math.round(location.x * scaling.x + scaling.offset.x);
        this.y = Math.round(location.y * scaling.y + scaling.offset.y);
        this.location = location;
        this.scaling = scaling;
        this.hideMe = false;
        this.item = null;
        this.connectorLabel = null;
        this.bossBeatable = false;
        this.pinned = false;

        this.checks = [];
        this.entrance = entranceId == null ? null : new Entrance(entranceId);
        this.boss = bossMetadata == null ? null : new Boss(bossMetadata);
        this.logicHint = logicHint;
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
                   && this.checks[0].metadata.locations.some(x => !['overworld', 'underworld', 'vanillaOverworld'].includes(x.map)));
    }

    dungeonName(pickingEntrance) {
        if (pickingEntrance) {
            return this.entrance.id.toUpperCase();
        }

        if (this.entrance?.isMappedToDungeon()) {
            return this.entrance.connectedTo().toUpperCase();
        }

        return this.checks[0].metadata.locations
            .filter(x => !['overworld', 'underworld', 'vanillaOverworld'].includes(x.map))[0]
            .map.toUpperCase();
    }

    isNightmare() {
        return this.boss && this.boss.type == 'boss';
    }

    isMiniboss() {
        return this.boss && this.boss.type == 'miniboss';
    }

    isOnlyVanillaOwls() {
        return this.checks.filter(x => x.isVanillaOwl()).length == this.checks.length;
    }

    updateBehindKeys() {
        let uncheckedChecks = this.checks.filter(x => x.difficulty == this.difficulty
                                                      && !x.isChecked()
                                                      && (!x.isVanillaOwl() || this.isOnlyVanillaOwls()))

        this.behindKeys = uncheckedChecks.length > 0 
                          && uncheckedChecks.every(x => x.behindKeys);
    }

    updateBehindTrackerLogic() {
        let uncheckedChecks = this.checks.filter(x => x.difficulty == this.difficulty
                                                      && !x.isChecked()
                                                      && (!x.isVanillaOwl() || this.isOnlyVanillaOwls()))

        this.behindTrackerLogic = uncheckedChecks.length > 0 
                          && uncheckedChecks.every(x => x.behindTrackerLogic);
    }

    updateBehindRupees() {
        let uncheckedChecks = this.checks.filter(x => x.difficulty == this.difficulty
                                                      && !x.isChecked()
                                                      && !x.metadata.vanilla
                                                      && (!x.isVanillaOwl() || this.isOnlyVanillaOwls()))

        this.behindRupees = uncheckedChecks.length > 0 
                            && uncheckedChecks.every(x => x.behindRupees);
    }

    updateRequiresRupees() {
        let uncheckedChecks = this.checks.filter(x => x.difficulty == this.difficulty
                                                      && !x.isChecked()
                                                      && !x.metadata.vanilla
                                                      && (!x.isVanillaOwl() || this.isOnlyVanillaOwls()))

        this.requiresRupees = uncheckedChecks.length > 0 
                              && uncheckedChecks.every(x => x.requiredRupees);
    }

    updateDifficulty() {
        this.difficulty = this.logicHint ? this.logicHint.baseDifficulty : 'checked';

        for (const check of this.checks) {
            if (!check.isChecked() && (!check.isVanillaOwl() || this.isOnlyVanillaOwls())) {
                if ((check.difficulty < this.difficulty || this.difficulty == 'checked')) {
                    this.difficulty = check.difficulty;
                }
            }
        }
    }

    updateIsChecked() {
        let checks = this.checks.filter(x => !x.isVanillaOwl() || this.isOnlyVanillaOwls());

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
                                        .every(x => x.isVanilla))
                         || this.logicHint;
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

    updateBossBeatable() {
        this.bossBeatable = this.checks.some(x => x.difficulty == this.difficulty
                                             && x.difficulty < 9
                                             && x.behindKeys == this.behindKeys
                                             && (x.metadata.name.includes("Heart Container")
                                                 || x.metadata.name.includes("Tunic Fairy")));
    }

    update() {
        this.updateDifficulty();
        this.updateBehindKeys();
        this.updateBehindTrackerLogic();
        this.updateBehindRupees();
        this.updateRequiresRupees();
        this.updateIsChecked();
        this.updateIsVanilla();
        this.updateItem();
        this.sortChecks();
        this.updateBossBeatable();
    }

    canBeHidden() {
        if (this.hideMe){
            return true;
        }

        let connectedTo = this.entranceConnectedTo();

        if (!MapNode.state.settings.showChecked
            && this.isChecked
            && (this.entrance == null
                || (connectedTo != MapNode.state.startHouse
                    && ((!Entrance.isConnector(connectedTo) && coupledEntrances()))
                        || connectedTo == 'landfill'))) {
            return true;
        }

        if (this.entrance == null) {
            return false;
        }

        if (MapNode.state.args.randomstartlocation
            && MapNode.state.args.entranceshuffle == 'none'
            && Entrance.isMapped(MapNode.state.startHouse)
            && this.entrance.connectedTo() != MapNode.state.startHouse
            && this.checks.length == 0
            && !this.entrance.isVanilla()) {

            if (!MapNode.state.args.dungeonshuffle) {
                return true;
            }

            if (MapNode.state.args.dungeonshuffle
                && this.entrance.canBeStart()) {
                return true;
            }
        }

        return false;
    }

    areaChecks() {
        let areaDict = this.checks.reduce((acc, check) => {
            if (!(check.metadata.area in acc)) {
                acc[check.metadata.area] = [];
            }

            acc[check.metadata.area].push(check);

            return acc;
        }, {});

        return Object.entries(areaDict).map(area => {
            return {
                name: area[0],
                uniqueChecks: Array.from(new Set(area[1].map(check => check.id)))
                    .map(id => {
                        return {
                            'id': id,
                            'checks': this.checksWithId(id),
                        };
                    }),
            };
        });
    }

    tooltipHtml(/*pinned, connectionType, hoveredCheckId=null*/) {
        return '';
        // let tooltip = new NodeTooltip(this);
        // return tooltip.tooltipHtml(pinned, connectionType, hoveredCheckId);
    }

    inFilter() {
        for (const check of this.checks) {
            if (check.inFilter) {
                return true;
            }
        }

        return false;
    }

    hintHighlighted() {
        for (const check of this.checks) {
            if (check.hintHighlighted) {
                return true;
            }
        }

        return false;
    }

    iconClasses() {
        let classes = ['check-graphic', 'animate__animated', 'check-glow'];

        if (pickingEntrances())
        {
            return ['check-graphic', 'entrance-only'];
        }

        if (this.boss) {
            return ['check-graphic', this.boss.type];
        }

        if (this.logicHint) {
            classes.push('logic-hint');
        }

        if (this.behindKeys) {
            classes.push('behind-keys');
        }

        if (this.behindTrackerLogic) {
            classes.push('behind-tracker');
        }

        if (this.behindRupees) {
            classes.push('behind-rupees');
        }

        if (this.requiresRupees) {
            classes.push('requires-rupees');
        }

        if (this.isVanilla) {
            classes.push('vanilla');
        }

        if (this.checks.length > 0
            && ((this.checks.length == 1 && this.checks[0].id.includes('Owl'))
                && this.isOnlyVanillaOwls())) {
            classes.push('owl');
        }

        if (this.bossBeatable) {
            classes.push('boss-beatable');
        }

        let items = this.checks.filter(x => x.item)
                               .map(x => x.item);
        let hoverItems = items.filter(x => MapNode.state.hoveredItems.includes(x));
        if (hoverItems.length > 0 || this.inFilter() || this.hintHighlighted()) {
            classes.push('spoiler-highlight');
        }

        if (this.entrance != null) {
            if (this.entrance.isMapped()) {
                let simpleInside = false;
                let entrance = this.entrance;
                let mappedEntrance = new Entrance(this.entrance.connectedTo());

                if (!advancedER() && this.entrance.isInside()) {
                    simpleInside = true;
                    entrance = new Entrance(this.entrance.connectedTo());
                    mappedEntrance = this.entrance;
                }

                if (MapNode.state.args.randomstartlocation 
                    && mappedEntrance.id == MapNode.state.startHouse) {
                    classes.push('start-location');
                }

                if (mappedEntrance.type == 'connector'
                    || mappedEntrance.type == 'stairs'
                    || !inOutEntrances()
                    || !coupledEntrances()) {
                    if (!simpleInside) {
                        if (Connection.thisSideBlocked(entrance.id)) {
                            classes.push('one-way-out');
                        }
                        else if (Connection.otherSideBlocked(entrance.id)) {
                            classes.push('one-way-in');
                        }
                    }

                    let connection = entrance.mappedConnection();
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
                        || (entrance.isConnectedToConnector() && !entrance.isConnected())) {
                        classes.push('partial-entrance');
                    }

                    classes.push('connector');
                }
                else if (this.checks.length > 0) {
                    classes.push(`difficulty-${this.difficulty}`);
                }
                else if (mappedEntrance.id == 'landfill'
                         || (mappedEntrance.type == 'dummy'
                             && mappedEntrance.isInside())) {
                    classes.push('difficulty-checked');
                }
                else if (mappedEntrance.id == 'bk_shop:inside') {
                    classes.push('bk');
                }
                else {
                    classes.push('entrance-only');
                }
            }
            else if (this.difficulty == 'checked') {
                if (!MapNode.state.args.randomstartlocation 
                    || Entrance.isMapped(MapNode.state.startHouse)
                    || (!connectorsMixed() && this.entrance.isConnector())) {
                    classes.push('entrance-only');
                    classes.push('unmapped-entrance');
                    classes.push(`entrance-difficulty-${this.entrance.difficulty}`);

                    if (MapNode.accessibility.entrances[this.entrance.id]?.behindTrackerLogic) {
                        classes.push('entrance-behind-tracker')
                    }
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
    
        if (entrance.isConnectedToConnector()
            || !inOutEntrances()
            || !coupledEntrances()) {

            let target = entrance;
            let insideConnector = !advancedER() && entrance.isInside();
            if (insideConnector) {
                target = new Entrance(entrance.connectedTo());
            }

            if (target.isConnected()) {
                let connection = target.mappedConnection();
                if (insideConnector) {
                    $(this.graphic).attr('data-connected-to', connection.connector.entrances.map(x => Entrance.getInsideOut(x)).join(';'));
                }
                else {
                    $(this.graphic).attr('data-connected-to', connection.otherSides(target.id).join(';'));
                }

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
        this.graphic = document.getElementById(this.id());
    
        if (this.graphic) {
            let currentDiff = this.graphic.dataset.difficulty;
    
            if (currentDiff == "9" && this.difficulty >= 0 && this.difficulty < 9) {
                classes.push(animationClass);
            }
            else {
                this.graphic.classList.remove('animate__bounceInDown');
            }
        }
        else {
            classes.push(animationClass);
    
            this.createGraphic();
    
            $(parent).append(this.graphic);
        }
    }

    shouldUpdateOverlay(hideDifficulty, vanilla, difficulty, pickingEntrance/*, activeMap*/) {
        let wrapper = this.graphic.querySelector('.node-overlay-wrapper');

        if (!wrapper) {
            return true;
        }

        let label = wrapper.querySelector('.node-overlay')?.innerHTML ?? '';
        let data = wrapper.dataset;

        return data.checksize != String(MapNode.state.checkSize)
               || data.difficulty != difficulty
               || data.hidedifficulty != String(hideDifficulty)
               || data.vanilla != vanilla
               || data.boss != (this.boss?.mappedTo ?? '')
               || data.item != (this.item ?? '')
               || data.pickingentrance != String(pickingEntrance)
               || data.activemap != this.activeMap
               || data.behindKeys != this.behindKeys
               || data.behindRupees != this.behindRupees
               || label != (this.isDungeon() ? this.dungeonName(pickingEntrance)[1]
                                                           : (this.connectorLabel ?? ''))
    }

    updateOverlay(activeMap, pickingEntrance, difficulty/*, classes*/) {
        let hideDifficulty = pickingEntrance;
        hideDifficulty |= this.checks.length == 0
                          && this.entrance?.isMapped()
                          && this.entrance?.connectedTo() != 'landfill'
                          && (!this.entrance?.connectedToDummy()
                              || activeMap != 'overworld');
        hideDifficulty |= difficulty == 'checked'
                          && this.entrance
                          && (this.entrance.isConnectedToConnector()
                              || !inOutEntrances()
                              || !coupledEntrances());
        hideDifficulty |= !MapNode.state.settings.showChecked
                          && difficulty == 'checked';
        hideDifficulty |= MapNode.state.args.randomstartlocation
                          && !Entrance.isMapped(MapNode.state.startHouse);
        hideDifficulty |= MapNode.state.args.randomstartlocation
                          && this.entrance?.connectedTo() == MapNode.state.startHouse
                          && this.difficulty == 'checked';
        hideDifficulty |= this.boss != null;

        let vanilla = this.isVanilla && this.difficulty != 'checked' ? '-vanilla' : '';

        if (!this.shouldUpdateOverlay(hideDifficulty, vanilla, difficulty, pickingEntrance, activeMap)) {
            return;
        }

        let overlay = createElement('div', {
            class: 'node-overlay-wrapper',
            'data-checkSize': MapNode.state.checkSize,
            'data-difficulty': difficulty,
            'data-hideDifficulty': hideDifficulty,
            'data-vanilla': vanilla,
            'data-boss': this.boss?.mappedTo ?? '',
            'data-item': this.item ?? '',
            'data-connectorLabel': this.connectorLabel ?? '',
            'data-pickingEntrance': pickingEntrance,
            'data-activeMap': activeMap,
        });

        if (!hideDifficulty) {
            let iconWrapper = createElement('div', {
                class: `icon-wrapper icon-difficulty-${difficulty} check-size-${MapNode.state.checkSize} check-vanilla-${vanilla}`,
                css: `width: ${MapNode.state.checkSize}px;
                      height: ${MapNode.state.checkSize}px;`,
            });
            let svg = createElement('svg', {
                class: 'icon',
                css: `width: ${MapNode.state.checkSize}px;
                      height: ${MapNode.state.checkSize}px;`,
            });
            let use = createElement('use', {
                'xlink:href': `#difficulty-${difficulty}${vanilla}`,
            });

            let hollowSvgHtml = "";

            if (this.behindKeys || this.behindRupees || this.behindTrackerLogic) {
                let hollowSvg = createElement('svg', {
                    class: 'icon hollow',
                    css: `width: ${MapNode.state.checkSize}px;
                        height: ${MapNode.state.checkSize}px;`,
                });
                let hollowUse = createElement('use', {
                    'xlink:href': `#difficulty-${difficulty}-hollow`,
                });

                hollowSvg.innerHTML = hollowUse.outerHTML;
                hollowSvgHtml = hollowSvg.outerHTML;
            }

            svg.innerHTML = use.outerHTML;
            iconWrapper.innerHTML = svg.outerHTML + hollowSvgHtml;
            overlay.appendChild(iconWrapper);
        }

        if (this.boss) {
            let itemOverlay = createElement('img', {
                src: `/images/${this.boss.mappedTo}.png`,
                class: "node-boss-overlay",
                onmousedown: "preventDoubleClick(event)"
            });

            overlay.appendChild(itemOverlay);
        }

        if (this.logicHint) {
            let itemOverlay = createElement('img', {
                src: `/images/${this.logicHint.metadata.image}`,
                class: "node-logic-hint-overlay",
                style: `transform: scale(${this.scaling.x}) translate(-50%, -50%) translate(${this.logicHint.locations[0].offsetX}px, ${this.logicHint.locations[0].offsetY}px); transform-origin: top left;`,
                onmousedown: "preventDoubleClick(event)"
            });

            overlay.appendChild(itemOverlay);
        }

        if (this.item) {
            let itemOverlay = createElement('img', {
                src: `/images/${this.item}_1.png`,
                class: "node-item-overlay",
                'data-node-item': this.item,
                onmousedown: "preventDoubleClick(event)"
            });

            overlay.appendChild(itemOverlay);
        }

        if ((this.connectorLabel && !pickingEntrance)
            || (this.isDungeon(pickingEntrance)
                && activeMap == 'overworld')) {

            let shadowSize = 1 / (MapNode.state.settings.checkSize / MapNode.state.checkSize);
            let connectorLabel = this.connectorLabel;

            if (!coupledEntrances()) {
                let connection = Connection.existingConnectionByEntrance(this.entrance?.id);
                if (connection) {
                    connectorLabel += (connection.entrances.indexOf(this.entrance.id) + 1).toString();
                }
            }

            let connectorOverlay = createElement('p', {
                class: "node-overlay",
                'data-connector-label': connectorLabel,
                css: `font-size: ${MapNode.state.checkSize * 0.72}px;
                      text-shadow: -${shadowSize}px -${shadowSize}px 0 black,  
                                    ${shadowSize}px -${shadowSize}px 0 black,
                                    -${shadowSize}px  ${shadowSize}px 0 black,
                                    ${shadowSize}px  ${shadowSize}px 0 black;`,
                onmousedown: "preventDoubleClick(event)"
            });

            let label;
            if (this.connectorLabel) {
                label = connectorLabel;
            }
            else {
                label = this.dungeonName(pickingEntrance)[1];
            }

            connectorOverlay.innerHTML = label;
            overlay.appendChild(connectorOverlay);
        }

        let overlayClasses = ['behind-keys', 'one-way-out', 'one-way-in', 'owl', 'unmapped-entrance', 'possible-start-location', 
                              'start-location', 'behind-tracker', 'entrance-behind-tracker', 'partial-entrance', 'behind-rupees', 'boss-beatable'];
        for (const overlayClass of overlayClasses) {
            let newOverlay = createElement('div', {
                class: overlayClass + "-overlay",
            });

            overlay.appendChild(newOverlay);
        }

        this.graphic.innerHTML = '';
        this.graphic.appendChild(overlay);
    }

    createGraphic() {
        let coords = MapNode.coordsFromId(this.id());
        let size = Number(MapNode.state.checkSize);
        let x = coords.x;
        let y = coords.y;

        if (this.boss) {
            let extra = MapNode.state.checkSize * 0.5;
            size += extra;
            x -= extra / 2;
            y -= extra / 2;
        }

        let options = {
            'id': this.id(),
            'draggable': false,
            'data-node-id': this.id(),
            css: `top: ${y}px;
                  left: ${x}px;
                  width: ${size}px;
                  height: ${size}px;`,
        };

        if (this.item) {
            options['data-item'] = this.item;
        }

        if (this.boss) {
            options['data-boss'] = this.boss?.id;
        }

        this.graphic = createElement('div', options);

        $(this.graphic).on('click', (e) => { 
            checkGraphicLeftClick(e);
        });
        $(this.graphic).on('auxclick', (e) => { 
            if (e.button == 1) {
                nodeMiddle(e.currentTarget);
            }
        });
        $(this.graphic).on('contextmenu', (e) => { 
            checkGraphicRightClick(e);
            return false;
        });
        $(this.graphic).on('mouseenter', (e) => {
            checkGraphicMouseEnter(e.currentTarget);

            MapNode.tip.tooltip(this, e);
            // vueNodeTooltip(nodes[this.id()], e);
        });
        $(this.graphic).on('mouseleave', (e) => {
            checkGraphicMouseLeave(e.currentTarget);
        });
    }

    entranceOptions() {
        let options = null;

        if (MapNode.state.args.entranceshuffle == 'none'
            && MapNode.state.args.dungeonshuffle
            && this.entrance.isDungeon()) {

            options = MapNode.state.randomizedEntrances.filter(x => Entrance.isDungeon(x)
                && !Entrance.isFound(x)
                && !Entrance.isInside(x))
                .map(x => [x, MapNode.state.entranceDict[x].name]);
            options = sortByKey(options, x => [x[0]])
        }
        else if (MapNode.state.args.entranceshuffle != 'none'
                 && this.entrance.type != 'stairs'
                 && coupledEntrances()
                 && inOutEntrances()
                 && (this.entrance.type != "connector"
                     || MapNode.state.args.entranceshuffle == 'mixed')
                 && !this.entrance.isMapped()) {

            options = Entrance.validConnections(this.entrance.id, "simple");
            options = sortByKey(options, x => [x[1]]);
        }

        return options?.map(x => MapNode.state.entranceDict[x[0]]);
    }

    usesConnectorDialog() {
        return coupledEntrances() && inOutEntrances()
            && (this.entrance.type == "connector" || MapNode.state.args.entranceshuffle == 'mixed');
    }

    usesAdvancedEr() {
        return MapNode.state.args.entranceshuffle != 'none'
            && this.entrance.type != 'stairs'
            && advancedER();
    }

    usesAdvancedErInOut() {
        return this.usesAdvancedEr()
            && inOutEntrances();
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

    static init() {
        if (!MapNode.state) {
            MapNode.state = useStateStore();
            MapNode.tip = useNodeTooltipStore();
            MapNode.accessibility = useAccessibilityStore();
        }
    }
}
