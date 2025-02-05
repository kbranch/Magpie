import { logicHintDict } from "@/moduleWrappers";

export class LogicHint {
    constructor(hintInfo) {
        this.id = hintInfo.id;
        this.metadata = logicHintDict[this.id];
        this.behindKeys = hintInfo.behindKeys;
        this.behindTrackerLogic = hintInfo.behindTrackerLogic;
        this.isVanilla = hintInfo.vanilla || (this.metadata.vanilla ?? false);
        this.locations = this.metadata.locations;
        this.baseDifficulty = hintInfo.difficulty;
        this.hollow = false;
        this.source = hintInfo;

        let dungeonMaps = this.locations.map(x => x.map)
                                        .filter(x => !['overworld', 'underworld', 'vanillaOverworld'].includes(x));
        if (dungeonMaps.length == 0) {
            this.mapName = 'overworld';
        }
        else {
            this.mapName = dungeonMaps[0];
        }

        if (this.behindKeys || this.requiredRupees || this.behindTrackerLogic) {
            this.hollow = true;
        }
    }
}
