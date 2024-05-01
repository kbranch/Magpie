<script setup>
import { useNodeTooltipStore } from '@/stores/nodeTooltipStore.js';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { computed, onBeforeMount, onBeforeUpdate, onMounted, onUpdated, ref } from 'vue';

const props = defineProps(['type']);

const state = props.type == 'text' ? useTextTooltipStore() : useNodeTooltipStore();
const tooltip = ref(null);
const rootRect = ref(null);
const parentRect = ref(null);
const tipRect = ref(null);
const parentClean = ref(false);
const tipClean = ref(false);

const show = computed(() => state.show && (props.type == 'text' ? state.text : state.node) && state.element && tipClean.value && parentClean.value);
const tipLeft = computed(() => getTooltipLeft(parentRect.value, tipRect.value, rootRect.value));
const tipTop = computed(() => getTooltipTop(parentRect.value, tipRect.value));

const rootObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        rootRect.value = entry.boundingClientRect;
    }
}, { threshold: 1.0 });

const parentObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        let rect = entry.boundingClientRect;
        if (!rectsSame(parentRect.value, rect)) {
            parentRect.value = rect;
            parentClean.value = true;
        }
    }
}, { threshold: 1.0 });

const tipObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
        let rect = { 
            left: 0,
            top: 0,
            width: entry.borderBoxSize[0].inlineSize,
            height: entry.borderBoxSize[0].blockSize,
        };

        if (!rectsSame(tipRect.value, rect)) {
            tipRect.value = rect;
        }
    }

    tipClean.value = true;
}, { threshold: 1.0 });

onBeforeMount(() => {
    rootObserver.observe(document.body);
    observe();
});
onMounted(() => {
    observe();
    watch();
});
onBeforeUpdate(() => observe());
onUpdated(() => watch());

let scrollChanged = false;
window.addEventListener('scroll', () => {
    scrollChanged = true;
    observe();
});

let observedParent = null;
let observedTip = null;
function observe() {
    if (!state.element || !tooltip.value) {
        parentObserver.disconnect();
        tipObserver.disconnect();

        observedParent = null;
        observedTip = null;

        return;
    }

    if (observedParent != state.element || scrollChanged) {
        parentClean.value = false;
        scrollChanged = false;
        observedParent = state.element;

        parentObserver.disconnect();
        parentObserver.observe(state.element);
    }

    if (observedTip != tooltip.value) {
        tipClean.value = false;
        observedTip = tooltip.value;

        tipObserver.disconnect();
        tipObserver.observe(tooltip.value);
    }
}

function rectsSame(r1, r2) {
    if (!r1 || !r2) {
        return false;
    }
    
    return Math.abs(r1.left - r2.left) < 1
        && Math.abs(r1.top - r2.top) < 1
        && Math.abs(r1.width - r2.width) < 1
        && Math.abs(r1.height - r2.height) < 1;
}

function getTooltipLeft(parentRect, tipRect, rootRect) {
    if (!parentRect || !tipRect) {
        return 0;
    }

    let left = parentRect.left - tipRect.width / 2 + parentRect.width / 2;

    if (left < rootRect.left) {
        left = 5;
    }
    else if (left + tipRect.width + 5 > rootRect.right) {
        left = rootRect.right - 5 - tipRect.width;
    }

    return left;
}

function getTooltipTop(parentRect, tipRect) {
    if (!parentRect || !tipRect) {
        return 0;
    }

    let top = parentRect.top - 5 - tipRect.height;
    
    if (top < 0) {
        top = parentRect.bottom + 5;
    }

    return top;
}

let watchTimeout = null;
function watch() {
    if (!state.element || !state.element.matches(':hover')) {
        if (watchTimeout) {
            clearTimeout(watchTimeout);
        }

        state.clearTooltip();

        return;
    }

    setTimeout(watch, 250);
}
</script>

<template>
    <div ref="tooltip" class="vueTooltip" :style="`top: 0px; left: 0px; transform: translate(${tipLeft}px, ${tipTop}px); visibility: ${show ? 'visible' : 'hidden'}`">
        <template v-if="type == 'text'">
            <span class="tooltipText">{{ state.text }}</span>
        </template>

        <template v-else>
            <p class="tooltipText">X:{{ state.node?.x }}, Y:{{ state.node?.y }} this is some longer text to see what happens if it gets really long</p>
            <p class="tooltipText">X:{{ state.node?.x }}, Y:{{ state.node?.y }}</p>
            <p class="tooltipText">X:{{ state.node?.x }}, Y:{{ state.node?.y }}</p>
            <p class="tooltipText">X:{{ state.node?.x }}, Y:{{ state.node?.y }}</p>
        </template>
    </div>
</template>

<style scoped>
.vueTooltip {
    background-color: black;
    color: #ccc;
    text-align: center;
    border-radius: 6px;
    /* width: fit-content; */
    max-width: 500px;
    padding: 5px 10px 5px 10px;
    position: fixed;
    z-index: 999999;
}
</style>