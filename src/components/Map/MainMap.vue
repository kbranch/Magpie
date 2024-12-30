<script setup>
import { closeAllTooltips, removeNodes, drawNodes, win, getMapScaling, getLocationCoords } from '@/moduleWrappers.js';
import OpenBroadcastView from '@/components/OpenBroadcastView.vue';
import ConnectorModal from './ConnectorModal.vue';
import { computed, onMounted, onUpdated, ref, watch } from 'vue';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { useStateStore } from '@/stores/stateStore';
import MapLegend from '@/components/Map/MapLegend.vue';

const tip = useTextTooltipStore();
const state = useStateStore();
const props = defineProps(['broadcastMode']);

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

const mapSize = ref({ width: 0, height: 0 });
const tabWrapper = ref(null);
const mapImage = ref(null);
const canvas = ref(null);
const activeTab = ref('overworld');
const mapPaths = computed(() => maps.reduce((acc, x) => {
    acc[x] = getMapPath(x);
    return acc;
}, {}));

const mapResizeObserver = new ResizeObserver(updateMapSize, { threshold: 1.0 });

const mapScaling = computed(() => {
    // Dumb way to get things to react to the things we want it to
    // eslint-disable-next-line no-unused-vars
    let dummy = mapSize.value.width
                && mapSize.value.width
                && state.settings.linkPathAlpha
                && state.settings.linkPathBorder
                && state.settings.linkPathColor
                && state.settings.linkPathEnabled
                && state.settings.linkPathWidth
                && state.settings.enableAutotracking

    if (mapImage.value) {
        const scaling = getMapScaling(mapImage.value, false);
        return scaling;
    }

    return null;
});

const historyPaths = computed(() => {
    let maxPoints = state.settings.linkPathLength;
    let points = [];
    let paths = [points];

    let scaling = mapScaling.value;

    if (scaling) {
        let i = 0;
        let history = state.locationHistory;

        if (history.length > maxPoints) {
            history = history.slice(maxPoints * -1);
        }

        let length = history.length;

        for (const point of history) {
            let coords = getLocationCoords(point.room, point.x, point.y);

            if (coords.map != activeTab.value) {
                if (points.length) {
                    points = [];
                    paths.push(points);
                }

                i++;

                continue;
            }

            points.push({
                x: coords.x * scaling.x + scaling.offset.x,
                y: coords.y * scaling.y + scaling.offset.y,
                alpha: 1 - 3 ** (-10 * (0.5 * (i / length) ** 2)),
            });

            i++;
        }
    }

    return paths;
});

watch(historyPaths, () => { setTimeout(drawPaths, 250) });

onMounted(() => {
    mapResizeObserver.observe(tabWrapper.value);
});

onUpdated(() => {
    removeNodes();
    closeAllTooltips();

    drawNodes(activeTab.value, false);

    if (props.broadcastMode == 'send') {
        win.broadcastMapTab(activeTab.value);
    }
})

function getMapPath(map) {
    let mapPath = state.settings.colorAssistMaps ? `/images/colorAssist/${map}.png` : `/images/${map}.png`;
    if (state.args.overworld == 'alttp' && map == 'overworld') {
        mapPath = '/images/alttp-overworld.png';
    }

    return mapPath;
}

function updateMapSize() {
    let rect = tabWrapper.value?.getBoundingClientRect();
    mapSize.value.width = rect.width;
    mapSize.value.height = rect.height;
}

// Requires #RRGGBB format
function hexToRgba(hex) {
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
        a: 1,
    };
}

function rgbaStr(c) {
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
}

function drawPaths() {
    let context;

    if (canvas.value) {
        context = canvas.value.getContext("2d");
        context.clearRect(0, 0, canvas.value.width, canvas.value.height);
    }

    if (!state.settings.linkPathEnabled
        || (window.allowAutotracking && !state.settings.enableAutotracking)) {
        return;
    }

    let paths = historyPaths.value;

    context.globalCompositeOperation = 'copy';
    context.lineCap = "round";

    let width = Number(state.settings.linkPathWidth);

    for (const path of paths) {
        drawPath(path, hexToRgba(state.settings.linkPathBorder), width + 4, context);
        drawPath(path, hexToRgba(state.settings.linkPathColor), width, context);
    }
}

function drawPath(points, color, width, context) {
    let lastPoint = null;
    let globalAlpha = Number(state.settings.linkPathAlpha) / 100;

    context.lineWidth = width;

    for (const point of points) {
        if (lastPoint){
            let alpha = point.alpha * globalAlpha;
            let segmentColor = structuredClone(color);
            segmentColor.a = alpha;

            context.fillStyle = rgbaStr(segmentColor);

            drawSegment(lastPoint, point, width, context);
        }

        lastPoint = point;
    }
}

// This is dumb, but the only way I could find to get the alpha behavior I wanted
function drawSegment(start, end, width, context) {
    let diffX = Math.abs(end.x - start.x);
    let diffY = Math.abs(end.y - start.y);
    let distance = Math.sqrt(diffX * diffX + diffY * diffY);
    let step = 2;
    let position = 0;

    // Stamp a circle over and over to fake a line
    while (position <= distance) {
        let progress = Math.min(1, position / distance);

        let x = start.x + (end.x - start.x) * progress;
        let y = start.y + (end.y - start.y) * progress;

        context.beginPath();
        context.arc(x, y, width / 2, 0, Math.PI * 2);
        context.fill();
        position += step;
    }
}

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
    <div ref="tabWrapper" id="tabWrapper">
        <div ref="mapImage" :class="['tab', 'map-container', 'text-center', 'active']" :id="`${activeTab}TabContent`">
            <div class="map-wrapper">
                <img class="map" :data-mapname="activeTab" :src="mapPaths[activeTab]" width="2592" height="2079"
                    @click="closeAllTooltips();" @contextmenu.prevent="" draggable="false">
            </div>
        </div>
        <Transition>
            <div v-if="!state.settings.showLegend" id="showLegend">
                <img src="/images/chevron-down.svg" class="invert show-button" @mouseenter="tip.tooltip('Show legend', $event)" @click="state.settings.showLegend = true">
            </div>
        </Transition>
        <div id="mapCanvas">
            <canvas ref="canvas" :width="mapSize.width" :height="mapSize.height"></canvas>
        </div>
    </div>

    <MapLegend />
</div>

<ConnectorModal />
</template>

<style scoped>
#tabWrapper {
    position: relative;
}

#mapCanvas {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
}

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