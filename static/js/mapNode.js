class MapNode {
    constructor(x, y, entrance=null) {
        this.x = x;
        this.y = y;

        this.checks = [];
        this.entrance = entrance;
    }

    id() {
        return MapNode.nodeId(this.x, this.y);
    }

    uniqueCheckIds() {
        return new Set(this.checks.map(x => x.id));
    }

    checksWithId(id) {
        return this.checks.filter(x => x.id == id);
    }

    addCheck(id, behindKeys, difficulty) {
        this.checks.push(new Check(id, behindKeys, difficulty));
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
        this.isChecked = this.checks.length > 0
                         && this.checks.every(x => x.isChecked());
    }

    update() {
        this.updateDifficulty();
        this.updateBehindKeys();
        this.updateIsChecked();
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
            && this.entrance.id != reverseEntranceMap['start_house']) {

            if (!args.dungeonshuffle) {
                return true;
            }

            if (args.dungeonshuffle
                && startLocations.includes(this.entrance.id)) {
                return true;
            }
        }
    }

    checkGraphicHtml(id) {
        let checks = this.checksWithId(id);
        let graphicTemplate = "<div class='tooltip-check-graphic align-self-center difficulty-{difficulty}{behind-keys}'></div>";
        let graphic = '';

        for (const check of checks) {
            let difficulty = check.isChecked() ? 'checked' : check.difficulty;
            let behindKeys = check.behindKeys ? ' behind-keys' : '';

            graphic += graphicTemplate.replace('{difficulty}', difficulty)
                                    .replace('{behind-keys}', behindKeys);
        }

        return graphic;
    }

    entranceGraphicHtml() {
        return "<div class='tooltip-check-graphic align-self-center entrance-only'></div>";
    }

    tooltipHtml(pinned) {
        const titleTemplate = `<div class='tooltip-body'>
    {areas}
    {entrance}
    {pinned}
</div>`;
        const areaTemplate = `<div class='card tooltip-area-card'>
    <div class='card-header tooltip-area-header'>
        {area}
    </div>
    <ul class='list-group'>
        {checks}
    </ul>
</div>`;
        const checkTemplate = `<li class="list-group-item tooltip-item">
    <div class='text-start d-flex p-1 mb-0' data-check-id='{check-id}' onclick='toggleSingleNodeCheck(this);' oncontextmenu='return false;'>
        {graphic}
        <div class='tooltip-text align-middle ps-2'>
            {name}
        </div>
    </div>
</li>`;

        let uniqueIds = this.uniqueCheckIds();
        let areaHtml = '';
        let areas = {};
        let pinnedHtml = '';

        for (const id of uniqueIds) {
            let metadata = coordDict[id];
            let graphic = this.checkGraphicHtml(id);

            if (!(metadata.area in areas)) {
                areas[metadata.area] = '';
            }

            let line = checkTemplate.replace('{check-id}', id)
                            .replace('{graphic}', graphic)
                            .replace('{name}', metadata.name);


            areas[metadata.area] += line;
        }

        for (const area of sortByKey(Object.keys(areas), x => [x])) {
            areaHtml += areaTemplate.replace('{area}', area)
                                    .replace('{checks}', areas[area]);
        }

        if (pinned == "true") {
            pinnedHtml = this.getPinnedHtml();
        }

        let entranceHtml = this.getEntranceHtml();

        let title = titleTemplate.replace('{areas}', areaHtml)
                                 .replace('{entrance}', entranceHtml)
                                 .replace('{pinned}', pinnedHtml);

        return title;
    }

    getEntranceHtml() {
        const entranceTemplate = `<div class='text-start tooltip-item d-flex p-1 mb-0' data-entrance-id='{entrance-id}' oncontextmenu='return false;'>
        {graphic}
        <div class='tooltip-text align-middle ps-2'>
            {name}
        </div>
    </div>`;
        const connectionTemplate = `<li class="list-group-item text-start tooltip-item">
    <div class='tooltip-text text-start align-middle'>
        {connection}
    </div>
</li>`;
        let entranceHtml = '';

        if (this.entrance != null) {
            let graphic = this.entranceGraphicHtml();
            entranceHtml = entranceTemplate.replace('{entrance-id}', this.entrance.id)
                                            .replace('{graphic}', graphic)
                                            .replace('{name}', this.entrance.name);
            if (this.entrance.id in entranceMap
                && entranceMap[this.entrance.id] != this.entrance.id) {
                let connection = entranceDict[entranceMap[this.entrance.id]];
                entranceHtml += connectionTemplate.replace('{connection}', `To ${connection.name}`);
            }
            if (this.entrance.id in reverseEntranceMap
                && reverseEntranceMap[this.entrance.id] != this.entrance.id) {
                let connection = entranceDict[reverseEntranceMap[this.entrance.id]];
                entranceHtml += connectionTemplate.replace('{connection}', `From ${connection.name}`);
            }
        }

        return entranceHtml;
    }

    getPinnedHtml() {
        const menuItemTemplate = `<li class="list-group-item text-start tooltip-item p-1"{attributes} onclick='{action}' oncontextmenu='return false;'>
    {text}
</li>`
        let pinnedHtml = '';

        if (this.entrance != null) {
            let isDungeon = args.dungeonshuffle
                            && this.entrance.id.startsWith('d')
                            && this.entrance.id.length == 2;

            if (startLocations.includes(this.entrance.id)
                && !(this.entrance.id in entranceMap)) {
                pinnedHtml += menuItemTemplate.replace('{action}', `setStartLocation("${this.entrance.id}");`)
                                              .replace('{text}', 'Set as start location')
                                              .replace('{attributes}', ` data-node-id="${this.id()}"`);
            }

            if (args.entranceshuffle == 'none'
                && isDungeon) {

                let options = entrances.filter(x => x.startsWith('d') && x.length == 2)
                        .map(x => [x, entranceDict[x].name]);
                
                options = sortByKey(options, x => [x[0]]);

                let optionAction = `connectEntrances('${this.entrance.id}', $(this).attr('data-value'))`;

                pinnedHtml += MapNode.createDropdown('Connect to...', '', options, optionAction);
            }
            else if (args.entranceshuffle != 'none') {
                let requireConnector = this.entrance.entranceType == 'connector';
                let options = entrances.filter(x => (entranceDict[x].entranceType == 'connector') == requireConnector
                                                     && entranceDict[x].entranceType != 'dummy')
                                       .map(x => [x, entranceDict[x].name]);
                
                options = sortByKey(options, x => [x[1]]);

                let optionAction = `connectEntrances('${this.entrance.id}', $(this).attr('data-value'))`;

                pinnedHtml += MapNode.createDropdown('Connect to...', '', options, optionAction);

                if (entranceMap[this.entrance.id] != 'landfill') {
                    pinnedHtml += menuItemTemplate.replace('{action}', `mapToLandfill("${this.entrance.id}")`)
                                                    .replace('{text}', 'Map to Landfill')
                                                    .replace('{attributes}', ` data-node-id="${this.id()}"`);
                }
            }

            if (this.entrance.id in entranceMap) {
                pinnedHtml += menuItemTemplate.replace('{action}', `clearEntranceMapping("${this.entrance.id}")`)
                                              .replace('{text}', 'Clear Mapping')
                                              .replace('{attributes}', ` data-node-id="${this.id()}"`);
            }
        }

        if (pinnedHtml != '') {
            pinnedHtml = '<hr class="m-1">' + pinnedHtml;
        }

        return pinnedHtml;
    }

    static createDropdown(title, action, options, optionAction) {
        let itemTemplate = `<li><button class="dropdown-item tooltip-item" type="button" data-value="{value}" onclick="${optionAction}">{name}</button></li>`;
        let items = '';

        for (const option of options) {
            items += itemTemplate.replace('{value}', option[0])
                                 .replace('{name}', option[1]);
        }

        return `<div class="btn-group dropend">
        <button type="button" class="btn tooltip-item text-start p-1" onclick="${action}">${title}</button>
        <button type="button" class="btn tooltip-item dropdown-toggle dropdown-toggle-split px-2 text-end" data-bs-toggle="dropdown" aria-expanded="false"></button>
        <ul class="dropdown-menu">
            ${items}
        </ul>
      </div>`;
    }

    static nodeId(x, y) {
        return `${x},${y}`;
    }

    static coordsFromId(id) {
        let chunks = id.split(',');
        return {
            x: Number(chunks[0]),
            y: Number(chunks[1])
        };
    }
}

class Check {
    constructor(id, behindKeys, difficulty) {
        this.id = id;
        this.metadata = coordDict[this.id];
        this.behindKeys = behindKeys;

        if (this.fullName in checkedChecks) {
            this.difficulty = -1;
        }
        else {
            this.difficulty = difficulty;
        }
    }

    isChecked() {
        return this.fullName() in checkedChecks;
    }

    fullName() {
        return `${this.metadata.area}-${this.metadata.name}`;
    }
}