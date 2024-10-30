<script setup>
import { useNodeTooltipStore } from '@/stores/nodeTooltipStore.js';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { nodes } from '@/moduleWrappers.js';
import { computed, onBeforeMount, onBeforeUpdate, onMounted, onUpdated, ref } from 'vue';
import CheckItem from '@/components/Tooltips/CheckItem.vue';
import PinnedChunk from '@/components/Tooltips/PinnedChunk.vue';
import EntranceChunk from './EntranceChunk.vue';
import BossChunk from './BossChunk.vue';

const props = defineProps(['type', 'textColor', 'args']);

const state = props.type == 'text' ? useTextTooltipStore() : useNodeTooltipStore();
const tooltip = ref(null);
const rootRect = ref(null);
const parentRect = ref(null);
const tipRect = ref(null);
const parentClean = ref(false);
const tipClean = ref(false);
const allNodes = ref(nodes);
const stateNode = computed(() => props.type == 'node' ? state.node : state.auxNode);
const stateShow = computed(() => props.type == 'auxNode' ? state.auxShow : state.show);
const stateElement = computed(() => props.type == 'auxNode' ? state.auxElement : state.element);
const zIndex = computed(() => node?.value?.pinned ? 20010 : 1000);

window.nodes = allNodes.value;

const node = computed(() => allNodes.value[stateNode.value?.id()]);
const show = computed(() => stateShow.value && (props.type == 'text' ? state.text : node.value) && stateElement.value && tipClean.value && parentClean.value);
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
    watchMouseOut();
});
onBeforeUpdate(() => observe());
onUpdated(() => watchMouseOut());

let scrollChanged = false;
window.addEventListener('scroll', () => {
    scrollChanged = true;
    observe();
});

let observedParent = null;
let observedTip = null;
function observe() {
    if (!stateElement.value || !tooltip.value) {
        parentObserver.disconnect();
        tipObserver.disconnect();

        observedParent = null;
        observedTip = null;

        return;
    }

    if (observedParent != stateElement.value || scrollChanged) {
        parentClean.value = false;
        scrollChanged = false;
        observedParent = stateElement.value;

        parentObserver.disconnect();
        parentObserver.observe(stateElement.value);
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
function watchMouseOut() {
    if (!stateElement.value || (!stateElement.value.matches(':hover') && (!node.value || !node.value.pinned))) {
        if (watchTimeout) {
            clearTimeout(watchTimeout);
        }

        state.clearTooltip(props.type);

        return;
    }

    setTimeout(watchMouseOut, 250);
}
</script>

<template>
    <div ref="tooltip" class="vue-tooltip" :class="type == 'text' ? 'text-tooltip' : 'node-tooltip'"
        :style="`top: 0px; left: 0px; transform: translate(${tipLeft}px, ${tipTop}px); visibility: ${show ? 'visible' : 'hidden'}; color: ${textColor}`">

        <template v-if="type == 'text'">
            <span class="tooltipText">{{ state.text }}</span>
        </template>

        <template v-else-if="node">
            <div class="tooltip-body" :class="[{ 'pinned': node.pinned }]">
                <div v-for="area in node.areaChecks()" :key="area" class='card tooltip-area-card'>
                    <div class='card-header tooltip-area-header'>
                        {{ area.name }}
                    </div>
                    <ul class='list-group'>
                        <div v-for="check in area.uniqueChecks" :key="check.id" class="btn-group dropend">
                            <CheckItem :unique-check="check" :show="show" />
                        </div>
                    </ul>
                </div>
                <EntranceChunk v-if="node.entrance" :node="node" :args="args" />
                <PinnedChunk v-if="node.entrance && node.pinned" :node="node" :args="args" />
                <BossChunk v-if="node.boss" :node="node" />

                <div v-if="node.logicHint" class='tooltip-text align-middle p-2'>
                    {{ node.logicHint.metadata.text }}
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.vue-tooltip {
    background-color: black;
    font-size: 14px;
    text-align: center;
    border-radius: 6px;
    max-width: 500px;
    padding: 0.25em 0.5em 0.25em 0.5em;
    position: fixed;
    z-index: v-bind(zIndex);
}

.text-tooltip {
    z-index: 9999999;
}
</style>