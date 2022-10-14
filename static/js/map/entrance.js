class Entrance {
    constructor(id) {
        this.id = id;
        this.metadata = entranceDict[id];
        this.type = this.metadata.type;
    }

    connectedTo() {
        return Entrance.connectedTo(this.id);
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

    isConnector() {
        return Entrance.isConnector(this.id);
    }

    isConnected() {
        return Entrance.isConnected(this.id);
    }

    mappedConnection() {
        return Entrance.mappedConnection(this.id);
    }

    isMappedToSelf() {
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
    
    static validConnections(sourceId) {
        let entrance = entranceDict[sourceId];
        let requireConnector = entrance.type == 'connector';
        let options = [];
        if (requireConnector) {
            options = randomizedEntrances.filter(x => entranceDict[x].type == 'connector'
                                                      && (!Entrance.isConnected(x)
                                                          || Connection.isIncomplete({ exterior: x }))
                                                      && Entrance.connectedTo(x) != 'landfill')
                                         .map(x => [x, entranceDict[x].name]);
        }
        else {
            options = randomizedEntrances.filter(x => entranceDict[x].type != 'connector'
                                                      && entranceDict[x].type != 'dummy'
                                                      && (['bingo', 'bingo-full'].includes(args.goal)
                                                          || entranceDict[x].type != 'bingo')
                                                      && (args.tradequest
                                                          || entranceDict[x].type != 'trade')
                                                    //   && (args.logic == 'hell'
                                                    //       || entranceDict[x].type != 'hell')
                                                      && !Entrance.isFound(x))
                                         .map(x => [x, entranceDict[x].name]);
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
        return id in reverseEntranceMap;
    }

    static isDungeon(id) {
        return id.startsWith('d')
               && id.length == 2;
    }

    static isConnector(id) {
        return entranceDict[id].type == 'connector';
    }

    static isConnected(id) {
        return Entrance.isConnector(id) && connections.some(x => x.containsEntrance(id));
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
}