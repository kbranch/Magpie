import { connectors, connectorsMixed, coupledEntrances, inOutEntrances, vanillaConnectors } from "@/moduleWrappers";
import { useStateStore } from "@/stores/stateStore";
import { Connection } from "./connection";
import { useAccessibilityStore } from "@/stores/accessibilityStore";

export class Entrance {
    constructor(id) {
        this.id = id;
        this.metadata = Entrance.state.entranceDict[id];
        this.type = this.metadata.type;
        this.difficulty = Entrance.accessibility.entrances[id]?.difficulty ?? -1;
        this.behindTrackerLogic = Entrance.accessibility.entrances[id]?.behindTrackerLogic ?? false;

        if (!Entrance.state.settings.showHigherLogic && this.difficulty > 0) {
            this.difficulty = 9;
        }

        if (!Entrance.state.settings.showLogic) {
            this.difficulty = 0;
            this.behindTrackerLogic = false;
        }
    }

    connectedTo() {
        return Entrance.connectedTo(this.id);
    }

    connectedToMetadata() {
        let to = this.connectedTo();

        return to ? Entrance.state.entranceDict[this.connectedTo()] : null;
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
        return Entrance.isDungeon(this.connectedTo()) && Entrance.isInside(this.connectedTo());
    }

    isConnector() {
        return Entrance.isConnector(this.id);
    }

    isVanilla() {
        return Entrance.isVanilla(this.id);
    }

    isConnectedToConnector() {
        let target = this.connectedTo();

        if (this.isInside()) {
            target = this.id;
        }

        return this.connectedTo() != null 
               && inOutEntrances()
               && coupledEntrances()
               && Entrance.isConnector(target);
    }

    isConnected() {
        return Entrance.isConnected(this.id);
    }

    mappedConnection() {
        return Entrance.mappedConnection(this.id);
    }

    isMappedToSelf() {
        if (Entrance.state.args.randomstartlocation
            && Entrance.state.args.entranceshuffle == 'none'
            && Entrance.state.startHouse in Entrance.state.entranceMap
            && !(this.id in Entrance.state.reverseEntranceMap)
            && !(this.id in Entrance.state.entranceMap))
        {
            return true;
        }

        return this.connectedTo() == this.id;

    }

    isRemapped() {
        return this.isMapped() && !this.isMappedToSelf();
    }

    canBeStart() {
        return Entrance.state.startLocations.includes(this.id);
    }

    isOneWayBlocked() {
        return this.entrance?.metadata.oneWayBlocked ?? false;
    }

    shouldDraw() {
        if (this.difficulty == 9
              && !Entrance.state.settings.showOutOfLogic
              && (!Entrance.state.args.randomstartlocation || Entrance.isMapped(Entrance.state.startHouse) || this.isMixedConnector())
              && this.connectedTo() != Entrance.state.startHouse
              && !this.isConnected()
              && (Entrance.state.args.entranceshuffle == 'none' || (this.isConnector() && !this.isMixedConnector()))) {
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
    
    isConnectedToInside() {
        return Entrance.isInside(this.connectedTo());
    }

    canBeLandfill() {
        return !this.isVanilla() && !['landfill', Entrance.state.startHouse].includes(this.connectedTo());
    }

    canBeCleared() {
        return (this.isMapped() || (!coupledEntrances() && this.isFound())) && !this.isVanilla();
    }
    
    isConnectedToStairs() {
        return Entrance.isStairs(this.connectedTo());
    }

    foundAt() {
        if (!this.isFound()) {
            return null;
        }

        let connection = Entrance.state.entranceDict[this.connectedFrom()];

        if (inOutEntrances()) {
            connection = Entrance.state.entranceDict[Entrance.connectedFrom(Entrance.getInside(this.id))];
        }

        return connection;
    }

    isRandomized() {
        return Entrance.state.randomizedEntrances.includes(this.id);
    }
    
    static validConnections(sourceId, type) {
        let requireConnector = !connectorsMixed() && Entrance.isConnector(sourceId);
        let isUnderworld = type == "underworld";
        let requireSimple = type == "simple" || (!connectorsMixed() && !Entrance.isConnector(sourceId));
        let options = [];
        if (requireConnector) {
            options = Entrance.state.randomizedEntrances.filter(x => Entrance.state.entranceDict[x].type == 'connector'
                                                      && (!Entrance.isConnected(x)
                                                          || Connection.isIncomplete({ exterior: x }))
                                                      && Entrance.connectedTo(x) != 'landfill'
                                                      && Entrance.isInside(x) == isUnderworld
                                                      && x != sourceId)
                                         .map(x => [x, Entrance.state.entranceDict[x].name]);
        }
        else {
            options = Entrance.state.randomizedEntrances.filter(x => (!requireSimple || Entrance.state.entranceDict[x].type != 'connector')
                                                      && ((!requireSimple && Entrance.state.args.shufflejunk) || Entrance.state.entranceDict[x].type != 'dummy')
                                                      && (Entrance.state.args.goal.includes('bingo')
                                                          || Entrance.state.args.shufflejunk
                                                          || Entrance.state.entranceDict[x].type != 'bingo')
                                                      && (Entrance.state.args.tradequest
                                                          || Entrance.state.args.shufflejunk
                                                          || Entrance.state.entranceDict[x].type != 'trade')
                                                      && Entrance.isInside(x) == isUnderworld
                                                      && ((coupledEntrances()
                                                           && ((requireSimple && ((Entrance.isInside(sourceId) && !Entrance.isMapped(x))
                                                                                  || (!Entrance.isInside(sourceId) && !Entrance.isFound(x)))
                                                               || !requireSimple && (!Entrance.isMapped(x)
                                                                                     || (Entrance.isConnected(x)
                                                                                         && Connection.isIncomplete({ exterior: x }))))))
                                                          || (!coupledEntrances()
                                                              && !Entrance.isFound(x)
                                                              /*&& !Entrance.isMapped(x)*/))
                                                )
                                         .map(x => [x, Entrance.state.entranceDict[x].name]);

            options.push(['bk_shop', Entrance.state.entranceDict['bk_shop'].name])
        }

        return options;
    }

    static isShuffledConnector(id) {
        return ['split', 'mixed', 'chaos', 'insane'].includes(Entrance.state.args.entranceshuffle) && Entrance.isConnector(id);
    }

    static isMixedConnector(id) {
        return ['mixed', 'chaos', 'insane'].includes(Entrance.state.args.entranceshuffle) && Entrance.isConnector(id);
    }

    static usefulConnectors() {
        return connectors.filter(x => x.obstacleTypes.length > 0);
    }

    static isMapped(id) {
        return id in Entrance.state.entranceMap;
    }

    static isFound(id) {
        if (Entrance.state.args.randomstartlocation
            && Entrance.state.args.entranceshuffle == 'none'
            && (Entrance.state.args.dungeonshuffle && !Entrance.isDungeon(id))
            && Entrance.state.startHouse in Entrance.state.entranceMap)
        {
            return true;
        }

        if (!Entrance.state.randomizedEntrances.includes(id)) {
            return true;
        }

        if (coupledEntrances()
            && (Entrance.state.args.entranceshuffle != 'none' || Entrance.state.args.dungeonshuffle)
            && !Entrance.isInside(id)) {
            id = Entrance.getInsideOut(id);
        }

        return id in Entrance.state.reverseEntranceMap;
    }

    static isDungeon(id) {
        if (id && Entrance.isInside(id)) {
            id = Entrance.getInsideOut(id);
        }

        return id
               && id.startsWith('d')
               && id.length == 2;
    }

    static isConnector(id) {
        return ['connector', 'stairs'].includes(Entrance.state.entranceDict[Entrance.getOutside(id)].type);
    }

    static isStairs(id) {
        return Entrance.state.entranceDict[Entrance.getOutside(id)].type == 'stairs';
    }

    static isConnected(id) {
        return ((!coupledEntrances() && !Entrance.isStairs(id))
                || (Entrance.connectedTo(id) != null
                    && (Entrance.isConnector(Entrance.connectedTo(id))
                        || !inOutEntrances())))
               && Entrance.state.connections.some(x => x.containsEntrance(id));
    }

    static mappedConnection(id) {
        return Entrance.state.connections.filter(x => x.containsEntrance(id))[0];
    }

    static connectedTo(id) {
        if (!(id in Entrance.state.entranceMap)) {
            return null;
        }

        return Entrance.state.entranceMap[id];
    }

    static connectedFrom(id) {
        if (!(id in Entrance.state.reverseEntranceMap)) {
            return null;
        }

        return Entrance.state.reverseEntranceMap[id];
    }

    static connectedToDummy(id) {
        let entrance = Entrance.connectedTo(id);
        return Entrance.state.entranceDict[entrance].type == 'dummy';
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

    static getInside(id) {
        let outside = Entrance.getOutside(id);
        return !outside ? outside : outside + ':inside';
    }

    static init() {
        if (!Entrance.state) {
            Entrance.state = useStateStore();
            Entrance.accessibility = useAccessibilityStore();
        }
    }
}
