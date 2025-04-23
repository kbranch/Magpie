<script setup>
import { useLocationStore } from '@/stores/locationStore';
import { useMapNodeStore } from '@/stores/mapNodeStore';
import { useStateStore } from '@/stores/stateStore';
import { computed } from 'vue';
import MapNode from './MapNode.vue';

const state = useStateStore();
const loc = useLocationStore();
const map = useMapNodeStore();

const linkFaceLeft = computed(() => {
    return `${Math.round(loc.locationCoords.x * loc.mapScaling?.x + loc.mapScaling?.offset.x)}px`;
});
const linkFaceTop = computed(() => {
    return `${Math.round(loc.locationCoords.y * loc.mapScaling?.y + loc.mapScaling?.offset.y)}px`;
});

const checkSize = computed(() => {
    return `${state.checkSize}px`;
});

const drawLink = computed(() => {
    return (loc.playerMap == loc.activeMap
            || (loc.activeMap == 'overworld'
                && loc.overworldRoom != null))
           && state.linkFaceShowing;
})

</script>

<template>

<img v-if="drawLink" id="linkFace" :src="`/images${state.settings.graphicsPack}/linkface.png`" />
<MapNode v-for="node in map.nodes" :key="node.id()" :node="node" :check-size="state.checkSize" />

</template>

<style scoped>

#linkFace {
    top: v-bind(linkFaceTop);
    left: v-bind(linkFaceLeft);
    width: v-bind(checkSize);
    max-width: v-bind(checkSize);
    min-width: v-bind(checkSize);
    height: v-bind(checkSize);
    max-height: v-bind(checkSize);
    min-height: v-bind(checkSize);

    position: absolute;
    filter: drop-shadow(0px 0px 5px #ccc) drop-shadow(0px 0px 5px #ccc);
    transition: all .5s linear;
    z-index: 1;
    transform: translate(-50%, -50%);
}

</style>