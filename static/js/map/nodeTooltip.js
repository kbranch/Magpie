
class NodeTooltip {
    constructor(node) {
        this.node = node;
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
    <div class='text-start d-flex p-1 mb-0' data-check-id='{check-id}'{vanilla} onclick='toggleSingleNodeCheck(this);' oncontextmenu='return false;'>
        {graphic}
        <div class='tooltip-text align-middle ps-2'>
            {name}
        </div>
    </div>
</li>`;

        let uniqueIds = this.node.uniqueCheckIds();
        let areaHtml = '';
        let areas = {};
        let pinnedHtml = '';

        for (const id of uniqueIds) {
            let checks = this.node.checksWithId(id);
            let isVanilla = checks.every(x => x.isVanilla);
            let metadata = coordDict[id];
            let graphic = this.checkGraphicHtml(id);

            if (!(metadata.area in areas)) {
                areas[metadata.area] = '';
            }

            let line = checkTemplate.replace('{check-id}', id)
                            .replace('{graphic}', graphic)
                            .replace('{name}', metadata.name)
                            .replace('{vanilla}', isVanilla ? ' data-vanilla="true"' : '');

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
        let entrance = this.node.entrance;

        if (entrance != null) {
            let graphic = this.entranceGraphicHtml();
            entranceHtml = entranceTemplate.replace('{entrance-id}', entrance.id)
                                            .replace('{graphic}', graphic)
                                            .replace('{name}', entrance.name);
            if (entrance.id in entranceMap
                && entranceMap[entrance.id] != entrance.id) {
                let connection = entranceDict[entranceMap[entrance.id]];
                entranceHtml += connectionTemplate.replace('{connection}', `To ${connection.name}`);
            }
            if (entrance.id in reverseEntranceMap
                && reverseEntranceMap[entrance.id] != entrance.id) {
                let connection = entranceDict[reverseEntranceMap[entrance.id]];
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
        let entrance = this.node.entrance;

        if (entrance != null) {
            let isDungeon = args.dungeonshuffle
                            && entrance.id.startsWith('d')
                            && entrance.id.length == 2;

            if (startLocations.includes(entrance.id)
                && !(entrance.id in entranceMap)) {
                pinnedHtml += menuItemTemplate.replace('{action}', `setStartLocation("${entrance.id}");`)
                                              .replace('{text}', 'Set as start location')
                                              .replace('{attributes}', ` data-node-id="${this.node.id()}"`);
            }

            if (args.entranceshuffle == 'none'
                && isDungeon) {

                let options = entrances.filter(x => x.startsWith('d')
                                                    && x.length == 2
                                                    && !(x in reverseEntranceMap))
                                       .map(x => [x, entranceDict[x].name]);
                
                options = sortByKey(options, x => [x[0]]);

                let action = `graphicalConnection('${entrance.id}')`;
                let optionAction = `connectEntrances('${entrance.id}', $(this).attr('data-value'))`;

                pinnedHtml += NodeTooltip.createDropdown('Connect to...', action, options, optionAction);
            }
            else if (args.entranceshuffle != 'none') {
                let options = MapNode.getValidConnections(entrance.id);
                options = sortByKey(options, x => [x[1]]);

                let action = `graphicalConnection('${entrance.id}')`;
                let optionAction = `connectEntrances('${entrance.id}', $(this).attr('data-value'))`;

                pinnedHtml += NodeTooltip.createDropdown('Connect to...', action, options, optionAction);

                if (entranceMap[entrance.id] != 'landfill') {
                    pinnedHtml += menuItemTemplate.replace('{action}', `mapToLandfill("${entrance.id}")`)
                                                    .replace('{text}', 'Mark as useless')
                                                    .replace('{attributes}', ` data-node-id="${this.node.id()}"`);
                }
            }

            if (entrance.id in entranceMap) {
                pinnedHtml += menuItemTemplate.replace('{action}', `clearEntranceMapping("${entrance.id}")`)
                                              .replace('{text}', 'Clear Mapping')
                                              .replace('{attributes}', ` data-node-id="${this.node.id()}"`);
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

    checkGraphicHtml(id) {
        let checks = this.node.checksWithId(id);
        let graphicTemplate = "<div class='tooltip-check-graphic align-self-center difficulty-{difficulty}{behind-keys}{vanilla}'></div>";
        let graphic = '';

        for (const check of checks) {
            let difficulty = check.isChecked() ? 'checked' : check.difficulty;
            let behindKeys = check.behindKeys ? ' behind-keys' : '';
            let vanilla = check.isVanilla ? ' vanilla' : '';

            graphic += graphicTemplate.replace('{difficulty}', difficulty)
                                      .replace('{behind-keys}', behindKeys)
                                      .replace('{vanilla}', vanilla);
        }

        return graphic;
    }

    entranceGraphicHtml() {
        return "<div class='tooltip-check-graphic align-self-center entrance-only'></div>";
    }
}