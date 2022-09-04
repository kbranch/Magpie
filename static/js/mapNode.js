class MapNode {
    constructor(x, y, entrance=null) {
        this.x = x;
        this.y = y;

        this.checks = [];
        this.entrance = entrance;
    }

    id() {
        return nodeId(self.x, self.y);
    }

    uniqueCheckIds() {
        return new Set(this.checks.map(x => x.id));
    }

    checksWithId(id) {
        return this.checks.filter(x => x.id == id);
    }

    addCheck(id, behindKeys, difficulty) {
        this.checks.push(new Check(id, behindKeys, difficulty));
    }

    sortChecks() {
        this.checks.sort((a, b) => a.metadata.index - b.metadata.index);
    }

    updateBehindKeys() {
        this.behindKeys = this.checks.filter(x => x.difficulty == this.difficulty)
                                     .every(x => x.behindKeys);
    }

    updateDifficulty() {
        this.difficulty = 'checked';

        for (const check of this.checks) {
            if (!check.isChecked()) {
                if ((check.difficulty < this.difficulty || this.difficulty == 'checked')) {
                    this.difficulty = check.difficulty;
                }
            }
        }
    }

    update() {
        this.updateDifficulty();
        this.updateBehindKeys();
        this.sortChecks();
    }

    static nodeId(x, y) {
        return `${x},${y}`;
    }

    static coordsFromId(id) {
        let chunks = id.split(',');
        return {
            x: Number(chunks[0]),
            y: Number(chunks[1])
        };
    }
}

class Check {
    constructor(id, behindKeys, difficulty) {
        this.id = id;
        this.metadata = coordDict[this.id];
        this.behindKeys = behindKeys;

        if (this.fullName in checkedChecks) {
            this.difficulty = -1;
        }
        else {
            this.difficulty = difficulty;
        }
    }

    isChecked() {
        return this.fullName() in checkedChecks;
    }

    fullName() {
        return `${this.metadata.area}-${this.metadata.name}`;
    }
}