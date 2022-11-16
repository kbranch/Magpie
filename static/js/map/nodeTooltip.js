
class NodeTooltip {
    constructor(node) {
        this.node = node;
    }

    tooltipHtml(pinned, connectionType) {
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
        <div class='tooltip-text ps-2'>
            <span class='tooltip-text-span'>{name}</span>
        </div>
    </div>
</li>`;
        const helperTemplate = `<img class='helper' data-bs-toggle='tooltip' data-bs-custom-class="secondary-tooltip" data-bs-html='true' data-bs-title='{title}' src='static/images/light-question-circle.svg'>`;
        const helperTitleTemplate = `<img src="static/images/checks/{id}.png">`;

        let uniqueIds = this.node.uniqueCheckIds();
        let areaHtml = '';
        let areas = {};
        let pinnedHtml = '';

        for (const id of uniqueIds) {
            let checks = this.node.checksWithId(id);
            let isVanilla = checks.every(x => x.isVanilla);
            let metadata = coordDict[id];
            let graphic = this.checkGraphicHtml(id);
            let name = metadata.name;

            if ('image' in metadata) {
                let title = helperTitleTemplate.replace('{id}', metadata.image);
                name += helperTemplate.replace('{title}', title);
            }

            if (!(metadata.area in areas)) {
                areas[metadata.area] = '';
            }

            let line = checkTemplate.replace('{check-id}', id)
                            .replace('{graphic}', graphic)
                            .replace('{name}', name)
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

        let entranceHtml = this.getEntranceHtml(connectionType);

        let title = titleTemplate.replace('{areas}', areaHtml)
                                 .replace('{entrance}', entranceHtml)
                                 .replace('{pinned}', pinnedHtml);

        return title;
    }

    getEntranceHtml(connectionType) {
        const interiorImageTemplate = `<div>
            <img src="static/images/entrances/{image}.png">
        </div>`
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
                                            .replace('{name}', entrance.metadata.name);
            if (entrance.isRemapped() && connectionType == 'none') {
                let connectionName = entranceDict[entrance.connectedTo()].name;

                if (entrance.isConnected()) {
                    let connection = entrance.mappedConnection();
                    connectionName = connection.otherSides(entrance.id)
                                               .map(x => entranceDict[x].name)
                                               .join(', ');

                    if (!connection.isSimple()) {
                        connectionName += ` via ${connection.connector.name}`;
                    }
                }

                entranceHtml += connectionTemplate.replace('{connection}', `To ${connectionName}`);
            }

            if (entrance.isFound()
                && !entrance.isMappedToSelf()
                && !entrance.isConnector()
                && connectionType == 'none') {
                let connection = entranceDict[entrance.connectedFrom()];
                entranceHtml += connectionTemplate.replace('{connection}', `Found at ${connection.name}`);
            }

            if (connectionType == 'simple' && entrance.metadata.interiorImage) {
                entranceHtml += interiorImageTemplate.replace('{image}', entrance.metadata.interiorImage);
            }
            else if(connectionType == 'none'
                    && entrance.isMapped()
                    && entrance.connectedTo() != 'landfill') {
                let connection = entranceDict[entrance.connectedTo()];
                if (connection.interiorImage) {
                    entranceHtml += interiorImageTemplate.replace('{image}', connection.interiorImage);
                }
            }
        }

        return entranceHtml;
    }

    getPinnedHtml() {
        const menuItemTemplate = `<li class="list-group-item text-start tooltip-item p-1 text-align-middle {classes}"{attributes} onclick="{action}" oncontextmenu="return false;">
    {text}
</li>`
        let pinnedHtml = '';
        let entrance = this.node.entrance;

        if (entrance == null) {
            return '';
        }

        if (entrance.canBeStart()
            && !entrance.isMapped()
            && !Entrance.isFound(startHouse)) {
            pinnedHtml += menuItemTemplate.replace('{action}', `setStartLocation('${entrance.id}');`)
                                          .replace('{text}', 'Set as start location')
                                          .replace('{classes}', '')
                                          .replace('{attributes}', ` data-node-id="${this.node.id()}"`);
        }

        if (args.entranceshuffle == 'none'
            && args.dungeonshuffle
            && entrance.isDungeon()) {

            let options = randomizedEntrances.filter(x => Entrance.isDungeon(x)
                                                            && !Entrance.isFound(x))
                                                .map(x => [x, entranceDict[x].name]);
            
            options = sortByKey(options, x => [x[0]]);

            let action = `startGraphicalConnection("${entrance.id}")`;
            let optionAction = `connectEntrances('${entrance.id}', $(this).attr('data-value'))`;

            pinnedHtml += NodeTooltip.createDropdown('Connect to...', action, options, optionAction);
        }
        else if (args.entranceshuffle != 'none') {
            let options = Entrance.validConnections(entrance.id);
            options = sortByKey(options, x => [x[1]]);

            let action = `startGraphicalConnection('${entrance.id}')`;

            if (entrance.type == "connector") {
                let text = 'Connect to... <img class="helper" data-bs-toggle="tooltip" data-bs-custom-class="secondary-tooltip" data-bs-title="Used when you can access at least two entrances of a connector" src="static/images/light-question-circle.svg">';
                pinnedHtml += menuItemTemplate.replace('{action}', action)
                                              .replace('{text}', text)
                                              .replace('{classes}', '')
                                              .replace('{attributes}', '');

                text = 'Connect one end... <img class="helper" data-bs-toggle="tooltip" data-bs-custom-class="secondary-tooltip" data-bs-title="Used when you can only access one entrance of a connector" src="static/images/light-question-circle.svg">';
                pinnedHtml += menuItemTemplate.replace('{action}', `openDeadEndDialog('${entrance.id}')`)
                                              .replace('{text}', text)
                                              .replace('{classes}', '')
                                              .replace('{attributes}', '');
            }
            else {
                let optionAction = `connectEntrances('${entrance.id}', $(this).attr('data-value'))`;
                let title = 'Connect to...';

                pinnedHtml += menuItemTemplate.replace('{action}', action)
                                              .replace('{text}', "Connect using map...")
                                              .replace('{classes}', '')
                                              .replace('{attributes}', '');

                pinnedHtml += NodeTooltip.createDropdown(title, action, options, optionAction);
            }

            if (entrance.connectedTo() != 'landfill') {
                pinnedHtml += menuItemTemplate.replace('{action}', `mapToLandfill('${entrance.id}')`)
                                              .replace('{text}', 'Mark as useless')
                                              .replace('{classes}', '')
                                              .replace('{attributes}', ` data-node-id="${this.node.id()}"`);
            }
        }

        if (entrance.isMapped()) {
            pinnedHtml += menuItemTemplate.replace('{action}', `clearEntranceMapping('${entrance.id}')`)
                                          .replace('{text}', 'Clear Mapping')
                                          .replace('{classes}', '')
                                          .replace('{attributes}', ` data-node-id="${this.node.id()}"`);
        }

        if (pinnedHtml != '') {
            pinnedHtml = '<hr class="m-1">' + pinnedHtml;
        }

        return pinnedHtml;
    }

    static createDropdown(title, action, options, optionAction) {
        const helperTemplate = `<img class='helper' data-bs-toggle='tooltip' data-bs-custom-class="secondary-tooltip" data-bs-html='true' data-bs-title='{title}' src='static/images/light-question-circle.svg'>`;
        const helperTitleTemplate = `<img src="static/images/entrances/{id}.png">`;
        let itemTemplate = `<li><button class="dropdown-item tooltip-item" type="button" data-value="{value}" onclick="${optionAction}">{name}</button></li>`;
        let items = '';

        for (const option of options) {
            let name = option[1];

            if (option[0] in entranceDict) {
                let metadata = entranceDict[option[0]];
                if ('interiorImage' in metadata) {
                    let helperTitle = helperTitleTemplate.replace('{id}', metadata.interiorImage);
                    name += helperTemplate.replace('{title}', helperTitle);
                }
            }

            items += itemTemplate.replace('{value}', option[0])
                                 .replace('{name}', name);
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
        let graphicTemplate = "<div class='tooltip-check-graphic difficulty-{difficulty}{behind-keys}{vanilla}'></div>";
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
        return "<div class='tooltip-check-graphic entrance-only'></div>";
    }
}