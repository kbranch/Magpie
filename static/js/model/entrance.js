class Entrance {
    constructor(id) {
        this.id = id;
        this.metadata = entranceDict[id];
        this.type = this.metadata.type;
        this.difficulty = entranceAccessibility[id]?.difficulty ?? -1

        if (!localSettings.showHigherLogic && this.difficulty > 0 && this.difficulty != 8) {
            this.difficulty = 9;
        }
    }

    connectedTo() {
        return Entrance.connectedTo(this.id);
    }

    connectedToDummy() {
        return Entrance.connectedToDummy(this.id);
    }

    connectedFrom() {
        return Entrance.connectedFrom(this.id);
    }

    isMapped() {
        return Entrance.isMapped(this.id);
    }

    isFound() {
        return Entrance.isFound(this.id);
    }

    isDungeon() {
        return Entrance.isDungeon(this.id);
    }

    isMappedToDungeon() {
        return Entrance.isDungeon(this.connectedTo());
    }

    isConnector() {
        return Entrance.isConnector(this.id);
    }

    isConnectedToConnector() {
        return this.connectedTo() != null && Entrance.isConnector(this.connectedTo());
    }

    isConnected() {
        return Entrance.isConnected(this.id);
    }

    mappedConnection() {
        return Entrance.mappedConnection(this.id);
    }

    isMappedToSelf() {
        if (args.randomstartlocation
            && args.entranceshuffle == 'none'
            && 'start_house' in entranceMap
            && !(this.id in reverseEntranceMap)
            && !(this.id in entranceMap))
        {
            return true;
        }

        return this.connectedTo() == this.id;

    }

    isRemapped() {
        return this.isMapped() && !this.isMappedToSelf();
    }

    canBeStart() {
        return startLocations.includes(this.id);
    }

    isOneWayBlocked() {
        return this.entrance?.metadata.oneWayBlocked ?? false;
    }

    shouldDraw() {
        if (this.difficulty == 9
              && !localSettings.showOutOfLogic
              && (!args.randomstartlocation || Entrance.isFound(startHouse) || (args.entranceshuffle != 'mixed' && this.isConnector()))
              && this.connectedTo() != startHouse
              && !this.isConnected()
              && (args.entranceshuffle == 'none' || (args.entranceshuffle != 'mixed' && this.isConnector()))) {
            return false;
        }

        return true;
    }
    
    static validConnections(sourceId, simpleOnly=false) {
        let entrance = entranceDict[sourceId];
        let requireConnector = args.entranceshuffle != 'mixed' && entrance.type == 'connector';
        let requireSimple = simpleOnly || (args.entranceshuffle != 'mixed' && entrance.type != 'connector');
        let options = [];
        if (requireConnector) {
            options = randomizedEntrances.filter(x => entranceDict[x].type == 'connector'
                                                      && (!Entrance.isConnected(x)
                                                          || Connection.isIncomplete({ exterior: x }))
                                                      && Entrance.connectedTo(x) != 'landfill'
                                                      && x != sourceId)
                                         .map(x => [x, entranceDict[x].name]);
        }
        else {
            options = randomizedEntrances.filter(x => (!requireSimple || entranceDict[x].type != 'connector')
                                                      && ((!requireSimple && args.shufflejunk) || entranceDict[x].type != 'dummy')
                                                      && (['bingo', 'bingo-full'].includes(args.goal)
                                                          || entranceDict[x].type != 'bingo')
                                                      && (args.tradequest
                                                          || entranceDict[x].type != 'trade')
                                                      && ((requireSimple && !Entrance.isFound(x)
                                                           || !requireSimple && !Entrance.isMapped(x))))
                                         .map(x => [x, entranceDict[x].name]);

            options.push(['bk_shop', entranceDict['bk_shop'].name])
        }

        return options;
    }

    static usefulConnectors() {
        return connectors.filter(x => x.obstacleTypes.length > 0);
    }

    static isMapped(id) {
        return id in entranceMap;
    }

    static isFound(id) {
        if (args.randomstartlocation
            && args.entranceshuffle == 'none'
            && (args.dungeonshuffle && !Entrance.isDungeon(id))
            && 'start_house' in entranceMap)
        {
            return true;
        }

        return id in reverseEntranceMap;
    }

    static isDungeon(id) {
        return id
               && id.startsWith('d')
               && id.length == 2;
    }

    static isConnector(id) {
        return entranceDict[id].type == 'connector';
    }

    static isConnected(id) {
        return Entrance.connectedTo(id) != null && Entrance.isConnector(Entrance.connectedTo(id)) && connections.some(x => x.containsEntrance(id));
    }

    static mappedConnection(id) {
        return connections.filter(x => x.containsEntrance(id))[0];
    }

    static connectedTo(id) {
        if (!(id in entranceMap)) {
            return null;
        }

        return entranceMap[id];
    }

    static connectedFrom(id) {
        if (!(id in reverseEntranceMap)) {
            return null;
        }

        return reverseEntranceMap[id];
    }

    static connectedToDummy(id) {
        let entrance = Entrance.connectedTo(id);
        return entranceDict[entrance].type == 'dummy';
    }
}