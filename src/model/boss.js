import { bossDataDict, bosses } from "@/moduleWrappers";

export class Boss {
    constructor(metadata) {
        Object.assign(this, metadata);
        this.mappedTo = this.id;
    }

    mapOptions() {
        return bosses.filter(x => x.type == this.type
                                 && x.id != this.mappedTo);
    }

    mappedToMetadata() {
        return bossDataDict[this.mappedTo];
    }
}