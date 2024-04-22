<script setup>
import { closeAllTooltips, removeNodes, drawNodes, win } from '@/moduleWrappers.js';
import OpenBroadcastView from '@/components/OpenBroadcastView.vue';
import ConnectorModal from './ConnectorModal.vue';
import { computed, onUpdated, ref } from 'vue';

const props = defineProps(['broadcastMode', 'args', 'settings']);

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
    let mapPath = props.localSettings?.colorAssistMaps ? `/images/colorAssist/${map}.png` : `/images/${map}.png`;
    if (props.args?.overworld == 'alttp' && map == 'overworld') {
        mapPath =  '/images/alttp-overworld.png';
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
    <li v-for="map in maps" :key="map" :class="['tab-button', { active: map == activeTab }]" :data-mapname="map"
        data-bs-toggle="tooltip" :data-bs-title="mapTooltips[map]" data-bs-trigger="hover">
        <button class="btn tab-link map-button" :id="`${map}Tab`" type="button" @click="activeTab = map">
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
</div>

<ConnectorModal />
</template>

<style scoped>
.tab-button.active .tab-link {
    border-color: #fff;
    border-radius: 5px 5px 0px 0px;
    color: #fff;
}

.tab-button:not(.active) .tab-link:hover {
    border-color: #ccc;
    border-radius: 5px 5px 0px 0px;
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
    object-fit:contain;
    max-height: 100%;
    aspect-ratio: 1182/948 !important;
}

.tab:not(.active) {
    display: none;
}

.map-button {
    text-transform: capitalize;
}
</style>