<script setup>
import { Entrance } from '@/model/entrance';
import { advancedER, coupledEntrances, inOutEntrances, pickingEntrances } from '@/moduleWrappers';
import { Connection } from '@/model/connection';
import { useLocationStore } from '@/stores/locationStore';
import { useStateStore } from '@/stores/stateStore';
import { computed } from 'vue';

const state = useStateStore();
const loc = useLocationStore();

const props = defineProps(['node', 'checkSize']);

const checkSize = computed(() => {
    return `${props.checkSize}px`;
});

const hideDifficulty = computed(() => {
    let hide = pickingEntrances();
    hide |= props.node.checks.length == 0
                && props.node.entrance?.isMapped()
                && props.node.entrance?.connectedTo() != 'landfill'
                && (!props.node.entrance?.connectedToDummy()
                    || loc.activeMap != 'overworld');
    hide |= props.node.difficulty == 'checked'
                && props.node.entrance
                && (props.node.entrance.isConnectedToConnector()
                    || !inOutEntrances()
                    || !coupledEntrances());
    hide |= !state.settings.showChecked
                && difficulty.value == 'checked';
    hide |= state.args.randomstartlocation
                && !Entrance.isMapped(state.startHouse);
    hide |= state.args.randomstartlocation
                && props.node.entrance?.connectedTo() == state.startHouse
                && props.node.difficulty == 'checked';
    hide |= props.node.boss != null;

    return hide
});

const mappedEntrance = computed(() => {
    if (!props.node.entrance) {
        return null;
    }

    if (!advancedER() && props.node.entrance.isInside()) {
        return props.node.entrance;
    }

    return new Entrance(props.node.entrance.connectedTo());;
});

const entrance = computed(() => {
    if (!props.node.entrance) {
        return null;
    }

    if (!advancedER() && props.node.entrance.isInside()) {
        return new Entrance(props.node.entrance.connectedTo());
    }

    return props.node.entrance;
});

const connection = computed(() => {
    if (!entrance.value) {
        return null;
    }

    return entrance.value.mappedConnection();
})

const classes = computed(() => {
    let classes = {};

    classes[`difficulty-${props.node.difficulty}`] = true;
    classes['vanilla-node'] = vanilla.value;
    classes['boss-node'] = props.node.boss;

    let items = props.node.checks.filter(x => x.item)
                            .map(x => x.item);
    let hoverItems = items.filter(x => state.hoveredItems.includes(x));
    classes['spoiler-highlight'] = hoverItems.length > 0 || props.node.inFilter() || props.node.hintHighlighted();

    return classes
});

const showEntranceIcon = computed(() => {
    return (props.node.isChecked || props.node.checks?.length == 0)
           && props.node.entrance.isMapped();
});

const isHollow = computed(() => {
    return props.node.behindKeys || props.node.behindRupees || props.node.behindTrackerLogic;
});

const vanilla = computed(() => {
    return props.node.isVanilla && props.node.difficulty != 'checked' ? '-vanilla' : '';
});

const behindRupees = computed(() => {
    return props.node.behindRupees && props.node.difficulty != 'checked';
});

const behindKeys = computed(() => {
    return props.node.behindKeys && props.node.difficulty != 'checked';
});

const behindTrackerLogic = computed(() => {
    if (!props.node.entrance || props.node.entrance.isMapped()) {
        return props.node.behindTrackerLogic && difficulty.value != 'checked';
    }

    return props.node.entrance.behindTrackerLogic && difficulty.value != 'checked';
});

const bossBeatable = computed(() => {
    return props.node.bossBeatable && props.node.difficulty != 'checked';
});

const hintIcon = computed(() => {
    return props.node.isOnlyVanillaOwls() && props.node.checks.length > 0;
});

const difficulty = computed(() => {
    return !props.node.entrance || props.node.entrance.isMapped() ? props.node.difficulty : props.node.entrance.difficulty;
});

const textShadow = computed(() => {
    let shadowSize = 1 / (state.settings.checkSize / props.checkSize);
    return `-${shadowSize}px -${shadowSize}px 0 black,
            ${shadowSize}px -${shadowSize}px 0 black,
            -${shadowSize}px  ${shadowSize}px 0 black,
            ${shadowSize}px  ${shadowSize}px 0 black`;
});

const textSize = computed(() => {
    return `${state.checkSize * 0.72}px`;
})

const textLabel = computed(() => {
    let pickingEntrance = pickingEntrances();

    let connectorLabel = connection.value?.label;

    if (!(connectorLabel && !pickingEntrance)
        && !(props.node.isDungeon(pickingEntrance)
             && loc.activeMap == 'overworld')) {
        return null;
    }

    if (!coupledEntrances()) {
        // let connection = Connection.existingConnectionByEntrance(props.node.entrance?.id);
        if (connection.value) {
            connectorLabel += (connection.value.entrances.indexOf(props.node.entrance.id) + 1).toString();
        }
    }

    if (connectorLabel) {
        return connectorLabel;
    }

    return props.node.dungeonName(pickingEntrance)[1];
});

</script>

<template>

<div :id="node.id()" class="map-node" :class="classes" draggable="false"
    :style="`top: ${node.y}px; left: ${node.x}px;`">

    <template v-if="!hideDifficulty">
        <svg class="node-inside">
            <use :xlink:href="`#difficulty-${difficulty}${vanilla}`"></use>
        </svg>
        <svg v-if="isHollow" class="node-inside hollow">
            <use :xlink:href="`#difficulty-${difficulty}-hollow`"></use>
        </svg>

        <img v-if="behindRupees" src="/images/vector-rupee.svg" class="behind-rupees node-inside"/>
        <img v-if="behindKeys" src="/images/lock-fill.svg" class="behind-keys node-inside"/>
        <img v-if="behindTrackerLogic" src="/images/tracker-logic.svg" class="behind-tracker node-inside"/>
        <img v-if="bossBeatable" src="/images/boss.svg" class="boss-beatable node-inside"/>
        <img v-if="hintIcon" src="/images/lightbulb-fill.svg" class="hint-icon node-inside"/>
        <img v-if="node.item" :src="`/images/${node.item}_1.png`" class="node-item node-inside"/>
    </template>

    <template v-if="state.args.randomstartlocation && !Entrance.isMapped(state.startHouse)">
        <template v-if="node.entrance != null">
            <img src="/images/house.svg" class="node-inside"/>
            <img src="/images/unmapped-entrance.svg" class="possible-start-location node-inside"/>
        </template>
    </template>

    <img v-else-if="node.boss" :src="`/images/${node.boss.mappedTo}.png`" class="boss node-inside"/>

    <template v-else-if="node.entrance != null">
        <img v-if="showEntranceIcon && connection?.vanilla" src="/images/vanilla-entrance.svg" class="node-inside" />
        <img v-else-if="showEntranceIcon" src="/images/entrance.svg" class="node-inside" />

        <template v-if="node.entrance.isMapped()">
            <img v-if="state.args.randomstartlocation && mappedEntrance.id == state.startHouse"
                src="/images/house.svg" class="node-inside"/>

            <img v-if="Connection.thisSideBlocked(entrance.id)" src="/images/one-way-out.svg" class="one-way node-inside" />
            <img v-else-if="Connection.otherSideBlocked(entrance.id)" src="/images/one-way-in.svg" class="one-way node-inside" />

            <img v-if="connection?.isIncomplete() || (entrance.isConnectedToConnector() && !entrance.isConnected())"
                src="/images/partial-entrance.svg" class="node-inside" />
            
            <img v-if="mappedEntrance.id == 'bk_shop:inside'" src="/images/BK.svg" class="node-inside" />
        </template>
        <template v-else-if="!hideDifficulty">
            <img src="/images/entrance.svg" class="small-entrance node-inside" />
        </template>
    </template>

    <img v-else-if="node.logicHint" :src="`/images/${node.logicHint.metadata.image}`" class="logic-hint node-inside"
        :style="`transform: scale(${loc.mapScaling.x}) translate(-50%, -50%) translate(${node.logicHint.locations[0].offsetX}px, ${node.logicHint.locations[0].offsetY}px);`" />

    <p v-if="textLabel" class="node-label node-inside">{{ textLabel }}</p>
</div>

</template>

<style scoped>

.node-inside {
    position: absolute;
    width: 100%;
    height: 100%;
}

.map-node {
    position: absolute;
    display: flex;
    width: v-bind(checkSize);
    height: v-bind(checkSize);
    transform: translate(-50%, -50%);
    z-index: 2;
}

.vanilla-node {
    z-index: 1;
}

.boss-node {
    z-index: 1;
}

svg.hollow {
    transform: scale(60%);
}

.difficulty-3 svg.hollow,
.difficulty-4 svg.hollow {
    transform: scale(50%);
}

.difficulty-2 svg.hollow {
    transform: scale(45%)
               translate(0, 20%);
}

.difficulty-1 svg.hollow {
    transform: scale(55%)
               translate(0, 5%);
}

.behind-rupees {
    left: 10%;
    top: 50%;
    width: 90%;
    height: 90%;
    transform: translate(-50%, -50%)
               scale(90%);
}

.behind-keys {
    left: 7%;
    top: 49%;
    transform: translate(-50%, -50%)
               scale(65%);
}

.behind-tracker  {
    border-style: none;
    left: 85%;
    top: 25%;
    width: 60%;
    height: 60%;
    transform: translate(-50%, -50%);
}

.boss-beatable {
    left: 50%;
    top: 105%;
    transform: translate(-50%, -50%)
               scale(50%);
}

.boss {
    left: 50%;
    top: 50%;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    aspect-ratio: 1;
    user-select: none;
    pointer-events: none;
    transform: translate(-50%, -50%)
               scale(150%);
}

.logic-hint {
    width: auto;
    height: auto;
    left: 50%;
    top: 50%;
    user-select: none;
    transform-origin: top left;
}

.hint-icon {
    left: 50%;
    top: 50%;
    width: 55%;
    height: 55%;
    transform: translate(-50%, -50%);
}

.node-item {
    left: 85%;
    top: 75%;
    height: auto;
    width: auto;
    max-height: 60%;
    min-height: 60%;
    user-select: none;
    pointer-events: none;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0px 0px 0.5px #000)
            drop-shadow(0px 0px 0.5px #000)
            drop-shadow(0px 0px 0.5px #000)
            drop-shadow(0px 0px 0.5px #000)
            drop-shadow(0px 0px 0.5px #000);
}

.node-label {
    text-shadow: v-bind(textShadow);
    font-size: v-bind(textSize);
    font-weight: bold;
    user-select: none;
}

.map-node:hover, .spoiler-highlight {
    filter: drop-shadow(0px 0px 5px #ccc) drop-shadow(0px 0px 5px #ccc);
    z-index: 999 !important;
}

.possible-start-location {
    width: 80%;
    height: 80%;
    margin-left: 10%;
    margin-top: 15%;
}

.one-way {
    width: 140%;
    height: 140%;
    bottom: -120%;
    left: -20%;
}

.small-entrance {
    left: 50%;
    top: 50%;
    width: 50%;
    height: 50%;
    transform: translate(-50%, -35%);
}

</style>