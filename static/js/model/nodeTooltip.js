class NodeTooltip {
    constructor(node) {
        this.node = node;
    }

    tooltipHtml(pinned, connectionType, hoveredCheckId) {
        const titleTemplate = `<div class='tooltip-body'>
    {areas}
    {entrance}
    {boss}
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
        const checkTemplate = `<li class="list-group-item tooltip-check">
    <div class='text-start d-flex p-1 mb-0 align-items-center' data-check-id='{check-id}'{vanilla}>
        {graphic}
        <div class='tooltip-text ps-2'>
            <span class='tooltip-text-span'>{name}</span>
        </div>
    </div>
</li>`;
        const helperTemplate = `<img class='helper' src='static/images/light-question-circle.svg'>`;
        const helperTooltipTemplate = ` data-bs-toggle='tooltip' data-bs-custom-class="secondary-tooltip" data-bs-html='true' data-bs-title='<img src="static/images/checks/{id}.png">'`;

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
            let helperTooltipAttrs = "";

            if ('image' in metadata) {
                helperTooltipAttrs = helperTooltipTemplate.replace('{id}', metadata.image);
                name += helperTemplate;
            }

            if (!(metadata.area in areas)) {
                areas[metadata.area] = '';
            }

            let line = checkTemplate.replace('{check-id}', id)
                            .replace('{graphic}', graphic)
                            .replace('{name}', name)
                            .replace('{vanilla}', isVanilla ? ' data-vanilla="true"' : '');

            areas[metadata.area] += this.createCheckDropdown(line, "toggleSingleNodeCheck($(this).find('[data-check-id]'));", pinned, id, helperTooltipAttrs, hoveredCheckId);
        }

        for (const area of sortByKey(Object.keys(areas), x => [x])) {
            areaHtml += areaTemplate.replace('{area}', area)
                                    .replace('{checks}', areas[area]);
        }

        if (pinned == "true") {
            pinnedHtml = this.getPinnedHtml();
        }

        let entranceHtml = this.getEntranceHtml(connectionType);

        let bossHtml = this.getBossHtml(pinned);

        let title = titleTemplate.replace('{areas}', areaHtml)
                                 .replace('{entrance}', entranceHtml)
                                 .replace('{boss}', bossHtml)
                                 .replace('{pinned}', pinnedHtml);

        return title;
    }

    createCheckDropdown(title, action, pinned, checkId, helperTooltipAttrs="", hoveredCheckId=null) {
        let items = '';
        let onmouseover = `onmouseover="if (!document.querySelector('.dropdown-menu.show')) { updateTooltip(document.querySelector(\`div[data-node-id='\${this.dataset.parentNodeId}']\`), '${checkId}')}"`;

        if (hoveredCheckId == checkId) {
            if (pinned) {
                items = NodeTooltip.getItemList(checkId);
            }

            onmouseover = '';
        }

        return `<div class="btn-group dropend">
        <button type="button" class="btn tooltip-item text-start p-0" onclick="${action}"${helperTooltipAttrs}>${title}</button>
        <button type="button" class="btn tooltip-item dropdown-toggle dropdown-toggle-split ps-4 pe-2 text-end" data-bs-toggle="dropdown" aria-expanded="false" data-parent-node-id="${this.node.id()}"${onmouseover}></button>
        <ul class="dropdown-menu">
            ${items}
        </ul>
      </div>`;
    }

    getBossHtml(pinned) {
        if (!this.node.boss) {
            return '';
        }

        let html = `<div class='tooltip-text align-middle p-2'>
        ${bossDataDict[this.node.boss.mappedTo].name}
    </div>`

        if (pinned == 'true') {
            let bossTemplate = `<li>
                                    <button class="dropdown-item tooltip-item boss-item" type="button" onclick="{action}">
                                        <div class="boss-menu-image-wrapper me-2">
                                            <img class="boss-menu-image" src="static/images/{bossId}.png">
                                        </div>
                                        {name}
                                    </button>
                                </li>`
            let bossList = '';

            for (let boss of this.node.boss.mapOptions()) {
                bossList += bossTemplate.replace('{action}', `mapBoss('${this.node.boss.id}', '${boss.id}')`)
                                        .replace('{bossId}', boss.id)
                                        .replace('{name}', boss.name);
            }

            html += `<div class="btn-group dropend">
                        <button type="button" class="btn tooltip-item text-start p-0">Change</button>
                        <button type="button" class="btn tooltip-item dropdown-toggle dropdown-toggle-split ps-4 pe-2 text-end" data-bs-toggle="dropdown" aria-expanded="false"></button>
                        <ul class="dropdown-menu">
                            ${bossList}
                        </ul>
                    </div>`;
        }

        return html;
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
                let connection = entranceDict[entrance.connectedTo()];

                if (entrance.isConnected()) {
                    let connection = entrance.mappedConnection();
                    connection.name = connection.otherSides(entrance.id)
                                               .map(x => entranceDict[x].name)
                                               .join(', ');

                    if (!connection.isSimple()) {
                        connection.name += ` via ${connection.connector.name}`;
                    }
                }

                entranceHtml += connectionTemplate.replace('{connection}', `To ${Entrance.isInside(connection.id) ? 'inside' : 'outside'} ${connection.name}`);
            }

            if (entrance.isFound()
                && !entrance.isMappedToSelf()
                && !entrance.isConnectedToConnector()
                && connectionType == 'none') {
                let connection = entranceDict[entrance.connectedFrom()];
                if (connection && inOutEntrances() && coupledEntrances()) {
                    entranceHtml += connectionTemplate.replace('{connection}', `Found at ${connection.name}`);
                }
            }

            if (connectionType == 'simple' && entrance.metadata.interiorImage && entrance.isInside()) {
                entranceHtml += interiorImageTemplate.replace('{image}', entrance.metadata.interiorImage);
            }
            else if(connectionType == 'none'
                    && entrance.isMapped()
                    && !['right_taltal_connector1', 'right_taltal_connector2', 'landfill'].includes(entrance.connectedTo())) {
                let connection = entranceDict[entrance.connectedTo()];
                if (connection.interiorImage && Entrance.isInside(connection.id)) {
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
            && !Entrance.isMapped(startHouse)) {
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

            let action = `startGraphicalConnection('${entrance.id}', 'simple')`;
            let optionAction = `connectEntrances('${entrance.id}', $(this).attr('data-value'))`;

            pinnedHtml += NodeTooltip.createEntranceDropdown('Connect to...', action, options, optionAction);
        }
        else if (args.entranceshuffle != 'none'
                 && entrance.type != 'stairs') {
            let action = `startGraphicalConnection('${entrance.id}', '{type}')`;

            if (coupledEntrances() && inOutEntrances()) {
                if (entrance.type == "connector" || args.entranceshuffle == 'mixed') {
                    if (!entrance.isMapped() || entrance.isIncompleteConnection()) {
                        let text = 'Connect to via connector... <img class="helper" data-bs-toggle="tooltip" data-bs-custom-class="secondary-tooltip" data-bs-title="Used when you can access at least two entrances of a connector" src="static/images/light-question-circle.svg">';
                        pinnedHtml += menuItemTemplate.replace('{action}', action.replace('{type}', 'connector'))
                                                    .replace('{text}', text)
                                                    .replace('{classes}', '')
                                                    .replace('{attributes}', '');
                    }

                    if (!entrance.isMapped()) {
                        let text = 'Connect one connector end... <img class="helper" data-bs-toggle="tooltip" data-bs-custom-class="secondary-tooltip" data-bs-title="Used when you can only access one entrance of a connector" src="static/images/light-question-circle.svg">';
                        pinnedHtml += menuItemTemplate.replace('{action}', `openDeadEndDialog('${entrance.id}')`)
                                                    .replace('{text}', text)
                                                    .replace('{classes}', '')
                                                    .replace('{attributes}', '');
                    }
                }

                if ((entrance.type != "connector" || args.entranceshuffle == 'mixed')
                    && !entrance.isMapped()) {
                    let optionAction = `connectEntrances('${entrance.id}', $(this).attr('data-value'))`;
                    let title = 'Connect to simple entrance...';

                    let options = Entrance.validConnections(entrance.id, "simple");
                    options = sortByKey(options, x => [x[1]]);

                    pinnedHtml += NodeTooltip.createEntranceDropdown(title, action.replace('{type}', 'simple'), options, optionAction);
                }
            }
            else if (!entrance.isMapped()) {
                if (inOutEntrances()) {
                    let target = entrance.isInside() ? 'overworld' : 'underworld';
                    let text = 'Connect to {target}...';
                    pinnedHtml += menuItemTemplate.replace('{action}', action.replace('{type}', target))
                                                .replace('{text}', text)
                                                .replace('{target}', target)
                                                .replace('{classes}', '')
                                                .replace('{attributes}', '');
                }
                else {
                    let text = 'Connect to overworld...';
                    pinnedHtml += menuItemTemplate.replace('{action}', action.replace('{type}', 'overworld'))
                                                .replace('{text}', text)
                                                .replace('{classes}', '')
                                                .replace('{attributes}', '');

                    text = 'Connect to underworld...';
                    pinnedHtml += menuItemTemplate.replace('{action}', action.replace('{type}', 'underworld'))
                                                .replace('{text}', text)
                                                .replace('{classes}', '')
                                                .replace('{attributes}', '');
                }
            }

            if (entrance.connectedTo() != 'landfill') {
                pinnedHtml += menuItemTemplate.replace('{action}', `mapToLandfill('${entrance.id}')`)
                                            .replace('{text}', 'Mark as useless')
                                            .replace('{classes}', '')
                                            .replace('{attributes}', ` data-node-id="${this.node.id()}"`);
            }
        }

        if (spoilerLog) {
                pinnedHtml += menuItemTemplate.replace('{action}', `spoilEntrance('${entrance.id}')`)
                                              .replace('{text}', 'Spoil entrance')
                                              .replace('{classes}', '')
                                              .replace('{attributes}', '');
        }

        if ((entrance.isMapped() || (!coupledEntrances() && entrance.isFound())) && !entrance.isVanilla()) {
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

    static createEntranceDropdown(title, action, options, optionAction) {
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
        let graphicTemplate = "<div class='tooltip-check-graphic difficulty-{difficulty}{vanilla} align-middle'><div class='tooltip-check-graphic icon-wrapper{behind-keys}{owl}'><div class='behind-keys-overlay'></div><div class='difficulty-8-overlay'></div><div class='owl-overlay'></div><svg class='tooltip-check-graphic align-middle'><use xlink:href='#difficulty-{difficulty}{iconVanilla}'></use></svg></div>{overlay}</div>";
        let graphic = '';

        for (const check of checks) {
            let difficulty = check.isChecked() ? 'checked' : check.difficulty;
            let behindKeys = check.behindKeys ? ' behind-keys' : '';
            let vanilla = check.isVanilla ? ' vanilla' : '';
            let owl = check.isOwl() ? ' owl' : '';
            let iconVanilla = check.isVanilla ? '-vanilla' : '';
            let overlay = '';

            if (check.item) {
                overlay = check.itemOverlay();
                $(`#text-item-${check.id}`).html(check.itemTextImage());
            }
            else {
                $(`#text-item-${check.id}`).html('');
            }

            graphic += graphicTemplate.replaceAll('{difficulty}', difficulty)
                                      .replaceAll('{behind-keys}', behindKeys)
                                      .replaceAll('{owl}', owl)
                                      .replaceAll('{vanilla}', vanilla)
                                      .replaceAll('{iconVanilla}', iconVanilla)
                                      .replaceAll('{overlay}', overlay);
        }

        return graphic;
    }

    entranceGraphicHtml() {
        return "<div class='tooltip-check-graphic entrance-only'></div>";
    }

    static getItemList(checkId) {
        const itemList = [
            ['SHIELD', 'Shield'],
            ['SWORD', 'Sword'],
            ['TOADSTOOL', 'Toadstool'],
            ['MAGIC_POWDER', 'Magic Powder'],
            ['MAX_POWDER_UPGRADE', 'Magic Powder Capacity'],
            ['SHOVEL', 'Shovel'],
            ['BOMB', 'Bomb'],
            ['MAX_BOMBS_UPGRADE', 'Bomb Capacity'],
            ['BOW', 'Bow'],
            ['MAX_ARROWS_UPGRADE', 'Arrow Capacity'],
            ['FEATHER', 'Feather'],
            ['ROOSTER', 'Rooster'],
            ['POWER_BRACELET', 'Power Bracelet'],
            ['PEGASUS_BOOTS', 'Pegasus Boots'],
            ['FLIPPERS', 'Flippers'],
            ['HOOKSHOT', 'Hookshot'],
            ['MAGIC_ROD', 'Magic Rod'],
            ['BLUE_TUNIC', 'Blue Tunic'],
            ['RED_TUNIC', 'Red Tunic'],
            ['OCARINA', 'Ocarina'],
            ['SONG1', 'Ballad of the Windfish'],
            ['SONG2', "Manbo's Mambo"],
            ['SONG3', "Frog's Song of Soul"],
            ['BOWWOW', 'Bow Wow'],
            ['BOOMERANG', 'Boomerang'],
            ['SEASHELL', 'Secret Seashell'],
            ['TAIL_KEY', 'Tail Key'],
            ['ANGLER_KEY', 'Angler Key'],
            ['FACE_KEY', 'Face Key'],
            ['BIRD_KEY', 'Bird Key'],
            ['SLIME_KEY', 'Slime Key'],
            ['GOLD_LEAF', 'Golden Leaf'],
            ['TRADING_ITEM_YOSHI_DOLL', 'Yoshi Doll'],
            ['TRADING_ITEM_RIBBON', 'Ribbon'],
            ['TRADING_ITEM_DOG_FOOD', 'Dog Food'],
            ['TRADING_ITEM_BANANAS', 'Bananas'],
            ['TRADING_ITEM_STICK', 'Stick'],
            ['TRADING_ITEM_HONEYCOMB', 'Honeycomb'],
            ['TRADING_ITEM_PINEAPPLE', 'Pineapple'],
            ['TRADING_ITEM_HIBISCUS', 'Hibiscus'],
            ['TRADING_ITEM_LETTER', 'Letter'],
            ['TRADING_ITEM_BROOM', 'Broom'],
            ['TRADING_ITEM_FISHING_HOOK', 'Fishing Hook'],
            ['TRADING_ITEM_NECKLACE', "Mermaid's Necklace"],
            ['TRADING_ITEM_SCALE', "Mermaid's Scale"],
            ['TRADING_ITEM_MAGNIFYING_GLASS', 'Magnifying Glass'],
            ['HEART_CONTAINER', 'Heart Container'],
            ['HEART_PIECE', 'Piece of Heart'],
            ['RUPEES_20', '20 Rupees'],
            ['RUPEES_50', '50 Rupees'],
            ['RUPEES_100', '100 Rupees'],
            ['RUPEES_200', '200 Rupees'],
            ['RUPEES_500', '500 Rupees'],
            ['INSTRUMENT1', 'Full Moon Cello'],
            ['INSTRUMENT2', 'Conch Horn'],
            ['INSTRUMENT3', "Sea Lily's Bell"],
            ['INSTRUMENT4', 'Surf Harp'],
            ['INSTRUMENT5', 'Wind Marimba'],
            ['INSTRUMENT6', 'Coral Triangle'],
            ['INSTRUMENT7', 'Organ of Evening Calm'],
            ['INSTRUMENT8', 'Thunder Drum'],
            ['KEY1', 'D1 Small Key'],
            ['KEY2', 'D2 Small Key'],
            ['KEY3', 'D3 Small Key'],
            ['KEY4', 'D4 Small Key'],
            ['KEY5', 'D5 Small Key'],
            ['KEY6', 'D6 Small Key'],
            ['KEY7', 'D7 Small Key'],
            ['KEY8', 'D8 Small Key'],
            ['KEY0', 'D0 Small Key'],
            ['NIGHTMARE_KEY1', 'D1 Nightmare Key'],
            ['NIGHTMARE_KEY2', 'D2 Nightmare Key'],
            ['NIGHTMARE_KEY3', 'D3 Nightmare Key'],
            ['NIGHTMARE_KEY4', 'D4 Nightmare Key'],
            ['NIGHTMARE_KEY5', 'D5 Nightmare Key'],
            ['NIGHTMARE_KEY6', 'D6 Nightmare Key'],
            ['NIGHTMARE_KEY7', 'D7 Nightmare Key'],
            ['NIGHTMARE_KEY8', 'D8 Nightmare Key'],
            ['NIGHTMARE_KEY0', 'D0 Nightmare Key'],
            ['MAP1', 'D1 Map'],
            ['MAP2', 'D2 Map'],
            ['MAP3', 'D3 Map'],
            ['MAP4', 'D4 Map'],
            ['MAP5', 'D5 Map'],
            ['MAP6', 'D6 Map'],
            ['MAP7', 'D7 Map'],
            ['MAP8', 'D8 Map'],
            ['MAP0', 'D0 Map'],
            ['COMPASS1', 'D1 Compass'],
            ['COMPASS2', 'D2 Compass'],
            ['COMPASS3', 'D3 Compass'],
            ['COMPASS4', 'D4 Compass'],
            ['COMPASS5', 'D5 Compass'],
            ['COMPASS6', 'D6 Compass'],
            ['COMPASS7', 'D7 Compass'],
            ['COMPASS8', 'D8 Compass'],
            ['COMPASS0', 'D0 Compass'],
            ['STONE_BEAK1', 'D1 Stone Beak'],
            ['STONE_BEAK2', 'D2 Stone Beak'],
            ['STONE_BEAK3', 'D3 Stone Beak'],
            ['STONE_BEAK4', 'D4 Stone Beak'],
            ['STONE_BEAK5', 'D5 Stone Beak'],
            ['STONE_BEAK6', 'D6 Stone Beak'],
            ['STONE_BEAK7', 'D7 Stone Beak'],
            ['STONE_BEAK8', 'D8 Stone Beak'],
            ['STONE_BEAK0', 'D0 Stone Beak'],
            ['MEDICINE', 'Medicine'],
            ['SINGLE_ARROW', '1 Arrow'],
            ['ARROWS_10', '10 Arrows'],
            ['GEL', 'Zol'],
            ['MESSAGE', "Master Stalfos' Message"]
        ];

        let imageTemplate = `<img class="check-item-image" src="static/images/{item}_1.png">`;
        let itemTemplate = `<li><button class="dropdown-item tooltip-item plando-item" type="button" data-item="{item}" onclick="setCheckContents('${checkId}', '{item}');"><div class="check-item-image-wrapper me-2">{image}</div>{name}</button></li>`;
        let spoilerTemplate = `<li><button class="dropdown-item tooltip-item plando-item" type="button" data-item="" onclick="spoilLocation('${checkId}');"><div class="check-item-image-wrapper me-2">{image}</div>{name}</button></li>`

        let items = itemTemplate.replaceAll('{image}', '')
            .replaceAll('{item}', '')
            .replaceAll('{name}', 'Unknown');

        if (checkId in itemsByLocation) {
            items += spoilerTemplate.replaceAll('{image}', '')
                .replaceAll('{name}', 'Load from spoiler log');
        }

        for (const item of itemList) {
            items += itemTemplate.replaceAll('{image}', imageTemplate)
                .replaceAll('{item}', item[0])
                .replaceAll('{name}', item[1]);
        }

        return items;
    }
}