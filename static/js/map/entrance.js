class Entrance {
    constructor(id) {
        this.id = id;
        this.metadata = entranceDict[id];
        this.type = this.metadata.type;
    }

    connectedTo() {
        if (!(this.id in entranceMap)) {
            return null;
        }

        return entranceMap[this.id];
    }

    connectedFrom() {
        if (!(this.id in reverseEntranceMap)) {
            return null;
        }

        return reverseEntranceMap[this.id];
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

    isMappedToSelf() {
        return this.connectedTo() == this.id;
    }

    isRemapped() {
        return this.isMapped() && !this.isMappedToSelf();
    }

    canBeStart() {
        return startLocations.includes(this.id);
    }
    
    static validConnections(sourceId) {
        let entrance = entranceDict[sourceId];
        let requireConnector = entrance.type == 'connector';
        let options = randomizedEntrances.filter(x => (entranceDict[x].type == 'connector') == requireConnector
                                                      && entranceDict[x].type != 'dummy'
                                                      && !(x in reverseEntranceMap))
                                         .map(x => [x, entranceDict[x].name]);
        return options;
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
}