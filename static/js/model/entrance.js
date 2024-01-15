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
        return Entrance.isDungeon(this.connectedTo()) && this.isInside();
    }

    isConnector() {
        return Entrance.isConnector(this.id);
    }

    isVanilla() {
        return Entrance.isVanilla(this.id);
    }

    isConnectedToConnector() {
        return this.connectedTo() != null && inOutEntrances() && coupledEntrances() && Entrance.isConnector(this.connectedTo());
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
            && startHouse in entranceMap
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
              && (!args.randomstartlocation || Entrance.isMapped(startHouse) || this.isMixedConnector())
              && this.connectedTo() != startHouse
              && !this.isConnected()
              && (args.entranceshuffle == 'none' || (this.isConnector() && !this.isMixedConnector()))) {
            return false;
        }

        return true;
    }

    isIncompleteConnection() {
        return this.isMapped()
               && Connection.isIncomplete({ interior: this.connectedTo() });
    }

    isMixedConnector() {
        return Entrance.isMixedConnector(this.id);
    }

    isShuffledConnector() {
        return Entrance.isShuffledConnector(this.id);
    }

    isInside() {
        return Entrance.isInside(this.id);
    }
    
    static validConnections(sourceId, type) {
        let requireConnector = !connectorsMixed() && Entrance.isConnector(sourceId);
        let isUnderworld = type == "underworld";
        let requireSimple = type == "simple" || (!connectorsMixed() && !Entrance.isConnector(sourceId));
        let options = [];
        if (requireConnector) {
            options = randomizedEntrances.filter(x => entranceDict[x].type == 'connector'
                                                      && (!Entrance.isConnected(x)
                                                          || Connection.isIncomplete({ exterior: x }))
                                                      && Entrance.connectedTo(x) != 'landfill'
                                                      && Entrance.isInside(x) == isUnderworld
                                                      && x != sourceId)
                                         .map(x => [x, entranceDict[x].name]);
        }
        else {
            options = randomizedEntrances.filter(x => (!requireSimple || entranceDict[x].type != 'connector')
                                                      && ((!requireSimple && args.shufflejunk) || entranceDict[x].type != 'dummy')
                                                      && (['bingo', 'bingo-full'].includes(args.goal)
                                                          || args.shufflejunk
                                                          || entranceDict[x].type != 'bingo')
                                                      && (args.tradequest
                                                          || args.shufflejunk
                                                          || entranceDict[x].type != 'trade')
                                                      && Entrance.isInside(x) == isUnderworld
                                                      && ((coupledEntrances()
                                                           && ((requireSimple && !Entrance.isFound(x)
                                                               || !requireSimple && !Entrance.isMapped(x))))
                                                          || (!coupledEntrances()
                                                              && !Entrance.isFound(x)
                                                              /*&& !Entrance.isMapped(x)*/))
                                                )
                                         .map(x => [x, entranceDict[x].name]);

            options.push(['bk_shop', entranceDict['bk_shop'].name])
        }

        return options;
    }

    static isShuffledConnector(id) {
        return ['split', 'mixed', 'chaos', 'insane'].includes(args.entranceshuffle) && Entrance.isConnector(id);
    }

    static isMixedConnector(id) {
        return ['mixed', 'chaos', 'insane'].includes(args.entranceshuffle) && Entrance.isConnector(id);
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
            && startHouse in entranceMap)
        {
            return true;
        }

        if (!randomizedEntrances.includes(id)) {
            return true;
        }

        if (coupledEntrances() && !Entrance.isInside(id)) {
            id = Entrance.getInsideOut(id);
        }

        return id in reverseEntranceMap;
    }

    static isDungeon(id) {
        return id
               && id.startsWith('d')
               && id.length == 2;
    }

    static isConnector(id) {
        return ['connector', 'stairs'].includes(entranceDict[id].type);
    }

    static isStairs(id) {
        return entranceDict[id].type == 'stairs';
    }

    static isConnected(id) {
        return ((!coupledEntrances() && !Entrance.isStairs(id))
                || (Entrance.connectedTo(id) != null
                    && (Entrance.isConnector(Entrance.connectedTo(id))
                        || !inOutEntrances())))
               && connections.some(x => x.containsEntrance(id));
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

    static isVanilla(id) {
        return (vanillaConnectors() && Entrance.isConnector(id)) || Entrance.isStairs(id);
    }

    static isInside(id) {
        return id.endsWith(':inside');
    }

    static getInsideOut(id) {
        if (Entrance.isInside(id)) {
            return id.replace(':inside', '');
        }

        return id + ':inside';
    }

    static getOutside(id) {
        return id?.replace(':inside', '');
    }
}