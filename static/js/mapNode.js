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
        this.behindKeys = this.checks.length > 0 
                          && this.checks.filter(x => x.difficulty == this.difficulty)
                                        .every(x => x.behindKeys);
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

    update() {
        this.updateDifficulty();
        this.updateBehindKeys();
        this.sortChecks();
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
</div>`;
        const areaTemplate = `<div class='card tooltip-area-card'>
    <div class='card-header tooltip-area-header'>
        {area}
    </div>
    <ul class='list-group'>
        {checks}
        {entrance}
    </ul>
</div>`;
        const checkTemplate = `<li class="list-group-item tooltip-item">
    <div class='text-start d-flex p-1 mb-0 {top-padding}' data-check-id='{check-id}' onclick='toggleSingleNodeCheck(this);' oncontextmenu='return false;'>
        {graphic}
        <div class='tooltip-text align-middle ps-2'>
            {name}
        </div>
    </div>
</li>`;

        let uniqueIds = this.uniqueCheckIds();
        let areaHtml = '';
        let areas = {};
        let padding = 'pt-2';
        let entranceArea = '';

        if (this.entrance != null) {
            entranceArea = this.entrance.area;
            areas[entranceArea] = '';
        }

        for (const id of uniqueIds) {
            let metadata = coordDict[id];
            let graphic = this.checkGraphicHtml(id);

            if (!(metadata.area in areas)) {
                areas[metadata.area] = '';
            }

            let line = checkTemplate.replace('{check-id}', id)
                            .replace('{graphic}', graphic)
                            .replace('{name}', metadata.name)
                            .replace('{top-padding}', padding);

            padding = '';

            areas[metadata.area] += line;
        }

        for (const area of sortByKey(Object.keys(areas), x => [x == entranceArea, x])) {
            let entranceHtml = this.getEntranceHtml(area, padding);

            padding = '';

            areaHtml += areaTemplate.replace('{area}', area)
                                    .replace('{checks}', areas[area])
                                    .replace('{entrance}', entranceHtml);
        }

        if (pinned == "true") {
            areaHtml += this.getPinnedHtml();
        }

        let title = titleTemplate.replace('{areas}', areaHtml);

        return title;
    }

    getEntranceHtml(area, padding) {
        const entranceTemplate = `<li class="list-group-item tooltip-item">
    <div class='text-start d-flex p-1 mb-0 {top-padding}' data-entrance-id='{entrance-id}' oncontextmenu='return false;'>
        {graphic}
        <div class='tooltip-text align-middle ps-2'>
            {name}
        </div>
    </div>
</li>`;
        const connectionTemplate = `<li class="list-group-item tooltip-item">
    <div class='tooltip-text align-middle ps-2'>
        {connection}
    </div>
</li>`;
        let entranceHtml = '';

        if (this.entrance != null && this.entrance.area == area) {
            let graphic = this.entranceGraphicHtml();
            entranceHtml = entranceTemplate.replace('{entrance-id}', this.entrance.id)
                                            .replace('{graphic}', graphic)
                                            .replace('{name}', this.entrance.name)
                                            .replace('{top-padding}', padding);
            if (this.entrance.id in entranceMap
                && entranceMap[this.entrance.id] != this.entrance.id) {
                let connection = entranceDict[entranceMap[this.entrance.id]];
                entranceHtml += connectionTemplate.replace('{connection}', `Leads to ${connection.area}: ${connection.name}`);
            }
            if (this.entrance.id in reverseEntranceMap
                && reverseEntranceMap[this.entrance.id] != this.entrance.id) {
                let connection = entranceDict[entranceMap[this.entrance.id]];
                entranceHtml += connectionTemplate.replace('{connection}', `Accessed from ${connection.area}: ${connection.name}`);
            }
        }

        return entranceHtml;
    }

    getPinnedHtml() {
        const menuItemTemplate = `<li class="list-group-item tooltip-item p-1"{attributes} onclick='{action}' oncontextmenu='return false;'>
    {text}
</li>`
        let pinnedHtml = '';

        if (this.entrance != null) {
            if (startLocations.includes(this.entrance.id)) {
                pinnedHtml += menuItemTemplate.replace('{action}', 'setStartLocation(this);')
                                              .replace('{text}', 'Set as start location')
                                              .replace('{attributes}', ` data-node-id=${this.id()}`);
            }

            if (args.entranceshuffle == 'none'
                && args.dungeonshuffle
                && this.entrance.id.startsWith('d')
                && this.entrance.id.length == 2) {
                
            }
        }

        return pinnedHtml;
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