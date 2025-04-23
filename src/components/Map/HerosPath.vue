<script setup>

import { getMapScaling } from '@/moduleWrappers';
import { useLocationStore } from '@/stores/locationStore';
import { useStateStore } from '@/stores/stateStore';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps(['mapImage', 'mapContainer', 'activeMap']);

const loc = useLocationStore();
const state = useStateStore();

const mapSize = ref({ width: 0, height: 0 });
const canvas = ref(null);
const borderCanvas = ref(null);
const imageLoaded = ref(false);

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
                && state.linkFaceShowing
                && imageLoaded.value

    if (props.mapContainer) {
        const scaling = getMapScaling(props.mapContainer);
        return scaling;
    }

    return null;
});

watch(mapScaling, () => loc.mapScaling = mapScaling.value)

function pointDistance(start, end) {
    let diffX = Math.abs(end.x - start.x);
    let diffY = Math.abs(end.y - start.y);
    return Math.sqrt(diffX * diffX + diffY * diffY);
}

const historyPaths = computed(() => {
    let maxPoints = state.settings.linkPathLength;
    let points = [];
    let paths = [points];

    let scaling = mapScaling.value;

    if (scaling) {
        let i = 0;
        let history = state.locationHistory;

        if (history.length > maxPoints && maxPoints < 1000) {
            history = history.slice(maxPoints * -1);
        }

        let length = history.length;
        let lastCoord = null;

        for (const point of history) {
            let coord = loc.getLocationCoords(point.room, point.x, point.y);

            if (coord.map != props.activeMap
                || (lastCoord
                    && pointDistance(lastCoord, coord) > 100)) {

                if (points.length) {
                    points = [];
                    paths.push(points);
                }

                lastCoord = coord;
                i++;

                continue;
            }

            points.push({
                x: coord.x * scaling.x + scaling.offset.x,
                y: coord.y * scaling.y + scaling.offset.y,
                alpha: 1.15 - 3 ** (-10 * (0.5 * (i / length) ** 2)),
            });

            lastCoord = coord;
            i++;
        }
    }

    return paths;
});

watch(() => props.mapImage, newImage);

onMounted(() => {
    mapResizeObserver.observe(props.mapContainer);
    newImage();
});

watch(historyPaths, () => {
    let tempPaths = [...historyPaths.value];
    if (imageLoaded.value) {
        setTimeout(() => drawPaths(tempPaths), 250);
    }
});

function newImage() {
    if (!props.mapImage) {
        return;
    }

    updateMapSize();

    if (props.mapImage.complete) {
        imageLoaded.value = true;
        nextTick(() => drawPaths(historyPaths.value));
    }
    else {
        imageLoaded.value = false;
        props.mapImage.addEventListener("load", imageLoadedEvent);
    }
}

function updateMapSize() {
    let rect = props.mapContainer?.getBoundingClientRect();

    if (!rect) {
        return;
    }

    mapSize.value.width = rect.width;
    mapSize.value.height = rect.height;
}

function imageLoadedEvent() {
    imageLoaded.value = true;
    nextTick(() => {
        drawPaths(historyPaths.value);
    });
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

function drawPaths(paths) {
    let borderContext;
    let context;

    if (canvas.value) {
        context = canvas.value.getContext("2d");
        context.clearRect(0, 0, canvas.value.width, canvas.value.height);
    }
    else {
        return;
    }

    if (borderCanvas.value) {
        borderContext = borderCanvas.value.getContext("2d");
        borderContext.clearRect(0, 0, borderCanvas.value.width, borderCanvas.value.height);
    }

    if (!state.settings.linkPathEnabled
        || (!state.linkFaceShowing)) {
        return;
    }

    context.lineCap = "round";
    borderContext.lineCap = "round";

    let width = Number(state.settings.linkPathWidth);

    for (const path of paths) {
        drawPath(path, hexToRgba(state.settings.linkPathBorder), width + 4, borderContext);
        drawPath(path, hexToRgba(state.settings.linkPathColor), width, context);
    }
}

function drawPath(points, color, width, context) {
    let lastPoint = null;
    let globalAlpha = Number(state.settings.linkPathAlpha) / 100;

    context.lineWidth = width;
    context.fillStyle = '#fff';

    for (const point of points) {
        if (lastPoint){
            let alpha = point.alpha * globalAlpha;
            let segmentColor = structuredClone(color);
            segmentColor.a = alpha;

            context.strokeStyle = rgbaStr(segmentColor);

            drawSegment(lastPoint, point, width, context, alpha);
        }

        lastPoint = point;
    }
}

function drawSegment(start, end, width, context, alpha) {
    // Clearing the end cap makes the nodes look a little less weird overall
    // Alpha threshold chosen by trial and error - doing this makes the line look weird at high alpha values
    if (alpha < 0.85) {
        context.beginPath();
        context.globalCompositeOperation = 'destination-out';
        context.arc(start.x, start.y, width / 2, 0, Math.PI * 2);
        context.fill();
        context.globalCompositeOperation = 'source-over';
    }

    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
}

</script>

<template>

<div id="pathContainer">
    <canvas ref="borderCanvas" :width="mapSize.width" :height="mapSize.height"></canvas>
    <canvas ref="canvas" :width="mapSize.width" :height="mapSize.height"></canvas>
</div>

</template>

<style scoped>

canvas {
    position: absolute;
}

#pathContainer {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
    pointer-events: none;
}

</style>