<script setup>
import { closeAllTooltips, removeNodes, drawNodes, win } from '@/moduleWrappers.js';
import OpenBroadcastView from '@/components/OpenBroadcastView.vue';
import ConnectorModal from './ConnectorModal.vue';
import { computed, onUpdated, ref } from 'vue';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { useStateStore } from '@/stores/stateStore';

const tip = useTextTooltipStore();
const state = useStateStore();
defineProps(['broadcastMode']);

const maps = ['overworld', 'underworld', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd0'];
const mapTooltips = {
    'overworld': undefined,
    'underworld': undefined,
    'd1': 'Tail Cave',
    'd2': 'Bottle Grotto',
    'd3': 'Key Cavern',
    'd4': 'Angler\'s Tunnel',
    'd5': 'Catfish\'s Maw',
    'd6': 'Face Shrine',
    'd7': 'Eagle\'s Tower',
    'd8': 'Turtle Rock',
    'd0': 'Color Dungeon'
};

const activeTab = ref('overworld');
const mapPaths = computed(() => maps.reduce((acc, x) => {
    acc[x] = getMapPath(x);
    return acc;
}, {}));

function getMapPath(map) {
    let mapPath = state.settings.colorAssistMaps ? `/images/colorAssist/${map}.png` : `/images/${map}.png`;
    if (state.args.overworld == 'alttp' && map == 'overworld') {
        mapPath = '/images/alttp-overworld.png';
    }

    return mapPath;
}

onUpdated(() => {
    removeNodes();
    closeAllTooltips();

    drawNodes(activeTab.value, false);
    win.broadcastMapTab(activeTab.value);
})
</script>

<template>
<ul class="nav" id="mapTabs">
    <li v-for="map in maps" :key="map" :class="['tab-button', { active: map == activeTab }]" :data-mapname="map" @mouseenter="tip.tooltip(mapTooltips[map], $event)">
        <button class="btn map-button" :id="`${map}Tab`" type="button" @click="activeTab = map">
            {{ map }}
        </button>
    </li>

    <div class="col"></div>
    <div v-if="broadcastMode == 'send'" class="col-auto pt-2">
        <OpenBroadcastView type="map" />
    </div>
</ul>

<div class="tabs" id="tabContents">
    <div v-for="map in maps" :key="map"
        :class="['tab', 'map-container', 'text-center', { active: map == activeTab }]" :id="`${map}TabContent`">
        <div class="map-wrapper">
            <img class="map" :data-mapname="map" :src="mapPaths[map]" width="2592" height="2079"
                @click="closeAllTooltips();" @contextmenu.prevent="" draggable="false">
        </div>
    </div>
    <Transition>
        <div v-if="!state.settings.showLegend" id="showLegend">
            <img src="/images/chevron-down.svg" class="invert show-button" @mouseenter="tip.tooltip('Show legend', $event)" @click="state.settings.showLegend = true">
        </div>
    </Transition>
</div>

<ConnectorModal />
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}

.tab-button.active {
    border-bottom: 3px;
    border-bottom-color: rgba(255, 255, 255, 0.3);
    border-bottom-style: solid;
}

.tab-button:not(.active):hover {
    background-color: rgba(255, 255, 255, 0.075) !important;
}

.tab-button {
    border-radius: 5px 5px 0px 0px;
    background-color: rgba(255, 255, 255, 0.05) !important;
    margin-right: 4px;
    margin-top: 6px;
}

.map-container {
    display: inline-block;
    position: relative;
    pointer-events: auto;
    width: 100%;
}

.map-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
}

.map {
    width: 100%;
    height: auto;
    object-fit: contain;
    max-height: 100%;
    aspect-ratio: 1182/948 !important;
}

.tab:not(.active) {
    display: none;
}

.map-button {
    text-transform: capitalize;
    color: inherit;
}

#showLegend {
    transform: translate(0, -100%);
    position: absolute;
    width: 32px;
    height: 32px;
}

.show-button {
    height: 100%;
    width: 100%;
    opacity: 0.85;
    padding: 4px;
}

.show-button:hover {
    background-color: #ccc;
    border-radius: 5px;
}

</style>