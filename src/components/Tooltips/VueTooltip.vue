<script setup>
import { useNodeTooltipStore } from '@/stores/nodeTooltipStore.js';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { nodes } from '@/moduleWrappers.js';
import { computed, onBeforeMount, onBeforeUpdate, onMounted, ref, watch } from 'vue';
import CheckItem from '@/components/Tooltips/CheckItem.vue';
import PinnedChunk from '@/components/Tooltips/PinnedChunk.vue';
import EntranceChunk from './EntranceChunk.vue';
import BossChunk from './BossChunk.vue';
import { useStateStore } from '@/stores/stateStore';

const props = defineProps(['type', 'textColor']);
const tip = props.type == 'text' ? useTextTooltipStore() : useNodeTooltipStore();
const state = useStateStore();

const tooltip = ref(null);
const rootRect = ref(null);
const parentRect = ref(null);
const tipRect = ref(null);
const parentClean = ref(false);
const tipClean = ref(false);
const allNodes = ref(nodes);
const stateNode = computed(() => props.type == 'node' ? tip.node : tip.auxNode);
const stateShow = computed(() => props.type == 'auxNode' ? tip.auxShow : tip.show);
const stateElement = computed(() => props.type == 'auxNode' ? tip.auxElement : tip.element);
const zIndex = computed(() => node?.value?.pinned ? 20010 : 1000);

window.nodes = allNodes.value;

const closed = ref(true);
const closing = ref(false);
const hovered = ref(false);
const node = computed(() => allNodes.value[stateNode.value?.id()]);
const show = computed(() => {
    return stateShow.value
           && (props.type == 'text' ? tip.text : node.value)
           && stateElement.value
           && tipClean.value
           && parentClean.value
});
const tipLeft = computed(() => getTooltipLeft(parentRect.value, tipRect.value, rootRect.value));
const tipTop = computed(() => getTooltipTop(parentRect.value, tipRect.value));
const logicHintText = computed(() => {
    if (!node.value?.logicHint) {
        return null;
    }

    let metadata = node.value.logicHint.metadata;
    let text = metadata.text;

    if (metadata.extraText) {
        try {
            text += metadata.extraText();
        }
        catch (error) {
            console.log(`Error processing metadata extraText: ${error}`);
        }
    }

    return text;
});

const rootObserver = new IntersectionObserver(updateRoot, { threshold: 1.0 });
const rootResizeObserver = new ResizeObserver(updateRoot, { threshold: 1.0 });

const parentObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        let rect = entry.boundingClientRect;
        if (!rectsSame(parentRect.value, rect)) {
            parentRect.value = rect;
        }
    }

    parentClean.value = true;
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

watch(hovered, (value) => {
    if (value && !closed.value && closing.value) {
        stopClosing();
    }
    else if (!value && !show.value && !stateShow.value && !closed.value && tipClean.value && parentClean.value) {
        startClosing();
    }
});

let closingTimeout = null;
function startClosing() {
    if (closing.value || node.value?.pinned) {
        return;
    }

    closing.value = true;

    if (closingTimeout == null) {
        closingTimeout = setTimeout(() => {
            closing.value = false;
            closed.value = true;
            closingTimeout = null;
        }, 75);
    }
}

function stopClosing() {
    if (!closing.value) {
        return;
    }

    clearTimeout(closingTimeout);
    closingTimeout = null;
    closing.value = false;
}

watch(stateShow, () => {
    observe();

    stopClosing();
    closed.value = true;

    if (!stateShow.value) {
        startClosing();
    }
});

watch(show, () => {
    closed.value = false;
});

watch(() => node.value?.pinned, (value, oldValue) => {
    if (!value && oldValue) {
        forceClear();
    }
})

onBeforeMount(() => {
    rootObserver.observe(document.body);
    rootResizeObserver.observe(document.body);
    observe();
});
onMounted(() => {
    observe();
    watchMouseOut();
});
onBeforeUpdate(() => observe());

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

function updateRoot() {
    scrollChanged = true;
    rootRect.value = document.body.getBoundingClientRect();
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

function forceClear() {
    tip.clearTooltip(props.type);
    hovered.value = false
    closing.value = false;
    closed.value = true;
}

let forceClearTimeout = null;
function watchMouseOut() {
    setTimeout(watchMouseOut, 100);

    if (!tooltip.value
        || window.getComputedStyle(tooltip.value).getPropertyValue("opacity") <= 0
        || closing.value
        || closed.value) {
        clearTimeout(forceClearTimeout);
        forceClearTimeout = null;
        return;
    }

    if (!stateElement.value || (!stateElement.value.matches(':hover') && (!node.value || !node.value.pinned))) {
        if (tooltip.value.matches(':hover')) {
            clearTimeout(forceClearTimeout);
            forceClearTimeout = null;
        }
        else if (!forceClearTimeout) {
            forceClearTimeout = setTimeout(forceClear, 250);
        }
    }
    else {
        clearTimeout(forceClearTimeout);
        forceClearTimeout = null;
    }
}

function itemDropdownOpened(button) {
    if (node.value.pinned) {
        return;
    }

    node.value.pinned = true;
    tip.tooltip(node.value, { currentTarget: node.value.graphic });

    setTimeout(() => new window.bootstrap.Dropdown(document.getElementById(button.id)).show(), 50);
}
</script>

<template>
    <div ref="tooltip" class="vue-tooltip"
        :class="{
            'closed': !show && (closed || type == 'text' || !state.settings.unpinnedInteract || state.connectionType),
            'text-tooltip': type == 'text',
            'node-tooltip': type != 'text',
            'pinned': node?.pinned,
        }"
        :style="`top: 0px; left: 0px; transform: translate(${tipLeft}px, ${tipTop}px); color: ${textColor}`"
        @mouseover="hovered = true"
        @mouseout="() => {hovered = false}"
        >

        <template v-if="type == 'text'">
            <span class="tooltipText" v-html="tip.text"></span>
        </template>

        <template v-else-if="node">
            <div class="tooltip-body" :class="[{ 'pinned': node.pinned }]">
                <div v-for="area in node.areaChecks()" :key="area" class='card tooltip-area-card'>
                    <div class='card-header tooltip-area-header'>
                        {{ area.name }}
                    </div>
                    <ul class='list-group'>
                        <div v-for="check in area.uniqueChecks" :key="check.id" class="btn-group dropend">
                            <CheckItem :unique-check="check" :show="show" @dropdown_opened="(button) => itemDropdownOpened(button)" />
                        </div>
                    </ul>
                </div>
                <EntranceChunk v-if="node.entrance" :node="node" />
                <PinnedChunk v-if="node.entrance && node.pinned" :node="node" />
                <BossChunk v-if="node.boss" :node="node" />

                <div v-if="node.logicHint" class='tooltip-text align-middle p-2'>
                    {{ logicHintText }}
                </div>

                <hr id="pinnedBar" v-if="node?.pinned" />
            </div>
        </template>
    </div>
</template>

<style scoped>
#pinnedBar {
    margin: 0;
    margin-top: 6px;
    border-top-width: 4px;
    opacity: 0.5;
    margin-bottom: -4px;
}

.closed {
    opacity: 0;
    pointer-events: none;
}

.tooltip-body {
    display: inline-block;
    position: relative;
}

.active .tooltip-body {
    pointer-events: auto;
}

.vue-tooltip {
    background-color: black;
    font-size: 14px;
    text-align: center;
    border-radius: 6px;
    max-width: 500px;
    padding: 0.25em 0.5em 0.25em 0.5em;
    position: fixed;
    z-index: v-bind(zIndex);

    transition: opacity 0.25s ease;
}

.text-tooltip {
    z-index: 9999999;
}
</style>