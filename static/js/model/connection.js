class Connection {
    constructor(exteriors, connector, label=null) {
        if (!exteriors) {
            return;
        }

        this.entrances = exteriors;

        if (connector == null) {
            this.connector = Connection.findConnector({ exterior: exteriors[0] });
        }
        else {
            this.connector = connector;
        }

        if (label == null) {
            // this.connector = connectors.filter(x => x.entrances.includes(fromInterior))[0] || null;
            // if (connector.entrances.length > 2) {
            //     for (const id of connector.entrances) {
            //         let connection = connections.filter(x => x.containsEntrance(Entrance.connectedFrom(id)))[0] || null;
            //         if (connection != null) {
            //             label = connection.label;
            //             break;
            //         }
            //     }
            // }

            let labelSet = new Set(connections.map(x => x.label));
            for (let i = 0; i < 26; i++) {
                let char = String.fromCharCode(65 + i);

                if (!labelSet.has(char)) {
                    this.label = char;
                    break;
                }
            }
        }
        else {
            this.label = label;
        }
    }

    clone() {
        let copy = Object.assign(new Connection(), this);
        copy.entrances = [...this.entrances];
        return copy;
    }

    containsEntrance(entranceId) {
        return this.entrances.includes(entranceId);
    }

    otherSide(entranceId) {
        return this.entrances[0] == entranceId ? this.entrances[1] : this.entrances[0];
    }

    otherSides(entranceId) {
        return this.entrances.filter(x => x != entranceId);
    }

    isIncomplete() {
        return this.entrances.length < this.connector?.entrances.length ?? 2;
    }

    isSimple() {
        return (this.connector ?? null) == null || this.connector?.id == 'outer_rainbow';
    }

    static disconnect(entranceId) {
        if (!Entrance.isConnected(entranceId)) {
            return;
        }

        let connection = connections.filter(x => x.containsEntrance(entranceId));
        if (connection.length > 0) {
            connection = connection[0];

            if (connection.entrances.length > 2) {
                connection.entrances = connection.entrances.filter(x => x != entranceId);
            }
            else {
                connections = connections.filter(x => x != connection);
            }
        }
    }

    static findConnector({ exterior=null, interior=null }) {
        let id = interior != null ? interior : Entrance.connectedTo(exterior);

        return connectors.filter(x => x.entrances.includes(id))[0];
    }

    static existingConnection(connector) {
        return connections.filter(x => x.connector == connector)[0] || null;
    }

    static createConnection(entrances) {
        let connector = Connection.findConnector({ exterior: entrances[0] });

        let connection = Connection.existingConnection(connector);
        if (connection != null && connector.id != 'outer_rainbow') {
            connection.entrances.push(entrances.filter(x => !connection.entrances.includes(x))[0]);
            return;
        }

        connections.push(new Connection(entrances, connector));
    }

    static isIncomplete({ exterior=null, interior=null }) {
        let connector = Connection.findConnector({ exterior: exterior, interior: interior });
        let connection = this.existingConnection(connector);
        return connection?.isIncomplete() ?? false;
    }

    static unmappedEntrances(connector) {
        return connector.entrances.filter(x => !Entrance.isFound(x));
    }

    static thisSideBlocked(entranceId) {
        let insideData = entranceDict[Entrance.connectedTo(entranceId)];
        return insideData.oneWayBlocked ?? false;
    }

    static otherSideBlocked(entranceId) {
        let thisInsideData = entranceDict[Entrance.connectedTo(entranceId)];
        let connector = Connection.findConnector({ exterior: null, interior: thisInsideData.id });
        let otherId = connector.entrances[0] == thisInsideData.id ? connector.entrances[1] : connector.entrances[0];
        let otherInsideData = entranceDict[otherId];
        return otherInsideData?.oneWayBlocked ?? false;
    }
}