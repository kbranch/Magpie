class Connection {
    constructor(exteriors, connector, label=null, vanilla=false, map=null) {
        if (!exteriors) {
            return;
        }

        this.vanilla = vanilla;
        this.entrances = exteriors;

        if (connector == null) {
            this.connector = Connection.findConnector({ exterior: exteriors[0] });
        }
        else {
            this.connector = connector;
        }

        this.map = map ?? this.connector.map;

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

            let labelSet = new Set(connections.filter(x => x.map == this.map 
                                                      || (['overworld', 'underworld'].includes(x.map)
                                                          && ['overworld', 'underworld'].includes(this.map)))
                                              .map(x => x.label));
            for (let i = 0; i < 26 * 26; i++) {
                let label = `${String.fromCharCode(65 + i)}`;

                if (i > 25) {
                    label = `${String.fromCharCode(65 + Math.floor(i / 26) - 1)}${String.fromCharCode(65 + i % 26)}`;
                }

                if (!labelSet.has(label)) {
                    this.label = label;
                    break;
                }
            }
        }
        else {
            this.label = label;
        }
    }

    addEntrance(entranceId) {
        if (!this.entrances.includes(entranceId)) {
            this.entrances.push(entranceId);
        }

        let newEntrances = [];
        let head = this.entrances[0];
        let i = 0;
        while (head in reverseEntranceMap && i < this.entrances.length) {
            head = reverseEntranceMap[head];
            i++;
        }

        i = 0;
        while (head in entranceMap && i < this.entrances.length - 1) {
            newEntrances.push(head);

            head = entranceMap[head];
            i++;
        }

        newEntrances.push(head);

        this.entrances = newEntrances;
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
        return inOutEntrances()
               && coupledEntrances()
               && (this.entrances.length / 2 < this.connector?.entrances.length ?? 2);
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

            if (!coupledEntrances()) {
                if (connection.entrances.length <= 2) {
                    connections = connections.filter(x => x != connection);
                    return;
                }

                let linkIndex = connection.entrances.indexOf(entranceId);

                if (linkIndex == 0 || linkIndex == connection.entrances.length - 1) {
                    connection.entrances = connection.entrances.filter(x => x != entranceId);
                    return;
                }

                let newChain = [];
                for (let i = linkIndex + 1; i < connection.entrances.length; i++) {
                    newChain.push(connection.entrances[i]);
                }

                connection.entrances = connection.entrances.filter(x => !newChain.includes(x));

                if (connection.entrances.length <= 1) {
                    connections = connections.filter(x => x != connection);
                }

                if (newChain.length > 1) {
                    Connection.createConnection(newChain, false, 'overworld');
                }
            }
            else if(!inOutEntrances()) {
                connections = connections.filter(x => x != connection);
            }
            else {
                if (connection.entrances.length > 4) {
                    connection.entrances = connection.entrances.filter(x => x != entranceId && x != entranceMap[entranceId]);
                }
                else {
                    connections = connections.filter(x => x != connection);
                }
            }
        }
    }

    static findConnector({ exterior=null, interior=null }) {
        let id = interior != null ? interior : Entrance.connectedTo(exterior);
        id = Entrance.getOutside(id);

        return connectors.filter(x => x.entrances.includes(id))[0];
    }

    static existingConnection(connector) {
        return connections.filter(x => x.connector == connector)[0] || null;
    }

    static existingConnectionByEntrance(entranceId) {
        return connections.filter(x => x.entrances.includes(entranceId))[0] || null;
    }

    static createConnection(entrances, vanilla=false, map=null) {
        let connector = null;

        if (coupledEntrances() && inOutEntrances()) {
            connector = Connection.findConnector({ exterior: entrances[0] });

            let connection = Connection.existingConnection(connector);
            if (connection != null && connector.id != 'outer_rainbow') {
                let newEntrance = entrances.filter(x => !connection.entrances.includes(x))[0];
                connection.entrances.push(newEntrance);

                if (coupledEntrances()) {
                    connection.entrances.push(entranceMap[newEntrance]);
                }

                return;
            }
        }

        connections.push(new Connection(entrances, connector, null, vanilla, map));
    }

    static advancedErConnection(entrances, map) {
        if (!coupledEntrances()) {
            let sourceChain = Connection.existingConnectionByEntrance(entrances[0]);
            let destChain = Connection.existingConnectionByEntrance(entrances[1]);

            if (!sourceChain && !destChain) {
                Connection.createConnection(entrances, false, map);
            }
            else if (sourceChain && destChain) {
                for (const id of destChain.entrances) {
                    sourceChain.addEntrance(id);
                }

                if (sourceChain != destChain) {
                    connections = connections.filter(x => x !== destChain);
                }
            }
            else if (sourceChain) {
                sourceChain.addEntrance(entrances[1]);
            }
            else {
                destChain.addEntrance(entrances[0]);
            }
        }
        else if (!inOutEntrances()) {
            Connection.createConnection(entrances, false, map);
        }
    }

    static isIncomplete({ exterior=null, interior=null }) {
        if (!inOutEntrances() || !coupledEntrances()) {
            return false;
        }

        let connector = Connection.findConnector({ exterior: exterior, interior: interior });
        let connection = this.existingConnection(connector);
        return (connection?.isIncomplete() ?? false)
               || (connector && !connection);
    }

    static unmappedEntrances(connector) {
        return connector.entrances.filter(x => !Entrance.isFound(x));
    }

    static thisSideBlocked(entranceId) {
        if (!inOutEntrances() || !coupledEntrances()) {
            return false;
        }

        let connectedTo = Entrance.connectedTo(entranceId);
        let insideData = entranceDict[connectedTo];
        return Entrance.isInside(connectedTo) && (insideData.oneWayBlocked ?? false);
    }

    static otherSideBlocked(entranceId) {
        let connectedTo = Entrance.connectedTo(entranceId);
        let thisInsideData = entranceDict[connectedTo];
        let connector = Connection.findConnector({ exterior: null, interior: thisInsideData.id });

        if (!connector) {
            return false;
        }

        let otherId = connector.entrances[0] == Entrance.getOutside(thisInsideData.id) ? connector.entrances[1] : connector.entrances[0];
        let otherInsideData = entranceDict[otherId];

        return Entrance.isInside(connectedTo) && (otherInsideData?.oneWayBlocked ?? false);
    }
}