<script setup>
import { useLocationStore } from '@/stores/locationStore';
import { useStateStore } from '@/stores/stateStore';
import { computed } from 'vue';

const state = useStateStore();
const loc = useLocationStore();

const linkFaceLeft = computed(() => {
    return Math.round(loc.locationCoords.x * loc.scaling.x + loc.scaling.offset.x);
});
const linkFaceTop = computed(() => {
    return Math.round(loc.locationCoords.y * loc.scaling.y + loc.scaling.offset.y);
});

const checkSize = computed(() => {
    return state.checkSize;
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
<!-- <div>
</div> -->

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
}
</style>