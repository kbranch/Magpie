<script setup>
import { useNodeTooltipStore } from '@/stores/nodeTooltipStore.js';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { toggleSingleNodeCheck, openCheckLogicViewer, nodes } from '@/moduleWrappers.js';
import { computed, onBeforeMount, onBeforeUpdate, onMounted, onUpdated, ref } from 'vue';
import ItemDropdown from '@/components/ItemDropdown.vue';

const props = defineProps(['type', 'textColor']);
const textTip = useTextTooltipStore();

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
    <div ref="tooltip" class="vueTooltip" :class="type == 'text' ? 'text-tooltip' : 'node-tooltip'" :style="`top: 0px; left: 0px; transform: translate(${tipLeft}px, ${tipTop}px); visibility: ${show ? 'visible' : 'hidden'}; color: ${textColor}`">
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
                            <button type="button" @click="toggleSingleNodeCheck(`#tooltip-check-${check.id}`)" class="btn tooltip-item text-start p-0"
                              :data-bs-toggle="'image' in check.checks[0].metadata ? 'tooltip' : null" data-bs-html="true" 
                              :data-bs-title='"image" in check.checks[0].metadata ? `<img src="/images/checks/${check.id}.png` : null'>
                                <li class="list-group-item tooltip-check">
                                    <div :id="`tooltip-check-${check.id}`" class='text-start d-flex p-1 mb-0 align-items-center' :data-check-id='check.id' :data-vanilla="[{ 'true': check.checks[0].isVanilla }]">
                                        <div v-for="subCheck in check.checks" :key="subCheck.id" class='tooltip-check-graphic align-middle' :class="[`difficulty-${subCheck.isChecked() ? 'checked' : subCheck.difficulty}`, subCheck.isVanilla ? 'vanilla' : '']">
                                            <div class='tooltip-check-graphic icon-wrapper' :class="[{ 'behind-keys': subCheck.behindKeys },
                                                                                                     { 'requires-rupees': subCheck.requiredRupees },
                                                                                                     { 'behind-tracker': subCheck.behindTrackerLogic },
                                                                                                     { 'owl': subCheck.isOwl() }]">
                                                <div v-if="subCheck.requiredRupees" class='behind-rupees-overlay'></div>
                                                <div v-if="subCheck.behindKeys" class='behind-keys-overlay'></div>
                                                <div v-if="subCheck.behindTrackerLogic" class='behind-tracker-overlay'></div>
                                                <div v-if="subCheck.isOwl()" class='owl-overlay'></div>
                                                <svg class='tooltip-check-graphic align-middle'>
                                                    <use :xlink:href="`#difficulty-${subCheck.isChecked() ? 'checked' : subCheck.difficulty}${subCheck.isVanilla ? '-vanilla' : ''}`"></use>
                                                </svg>
                                                <svg v-if="subCheck.hollow" class='tooltip-check-graphic hollow align-middle'>
                                                    <use :xlink:href="`#difficulty-${subCheck.isChecked() ? 'checked' : subCheck.difficulty}-hollow`"></use>
                                                </svg>
                                            </div>
                                            <img v-if="subCheck.item" class="node-item-overlay" :data-node-item="subCheck.item" :src="`/images/${subCheck.item}_1.png`" onmousedown="preventDoubleClick(event)">
                                        </div>
                                        <div class='tooltip-text ps-2'>
                                            <span class='tooltip-text-span'>
                                                {{ check.checks[0].metadata.name }}
                                                <img v-if="'image' in check.checks[0].metadata" class='helper' src='/images/light-question-circle.svg'>
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            </button>
                            <div class="col-auto">
                                <button type="button" class="btn btn-secondary p-1 logic-button" @click="openCheckLogicViewer(check.id)" @mouseenter="textTip.tooltip('View Logic', $event)">
                                    <img class="invert" src="/images/diagram-2-fill.svg">
                                </button>
                            </div>
                            <ItemDropdown :active="show" :check-id="check.id" />
                        </div>
                    </ul>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.vueTooltip {
    background-color: black;
    font-size: 14px;
    text-align: center;
    border-radius: 6px;
    max-width: 500px;
    padding: 0.25em 0.5em 0.25em 0.5em;
    position: fixed;
    z-index: 999999;
}

.text-tooltip {
    z-index: 9999999;
}
</style>