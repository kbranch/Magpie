<script setup>
import { useStateStore } from '@/stores/stateStore';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { computed, nextTick, onBeforeMount, ref, watch } from 'vue';

const state = useStateStore();
const tip = useTextTooltipStore();

const legendWrapper = ref(null);
const legendHeight = ref('unset');
const showLegend = computed(() => state.settings.showLegend);

const rootResizeObserver = new ResizeObserver(() => nextTick(updateLegendHeight), { threshold: 1.0 });

onBeforeMount(() => {
    rootResizeObserver.observe(document.body);
});

watch(showLegend, () => {
    nextTick(updateLegendHeight);
});

function updateLegendHeight() {
    legendHeight.value = state.settings.showLegend ? `${legendWrapper.value?.getBoundingClientRect().height}px` : '0px';
}
</script>

<template>
<div id="wrapper" class="pb-1">
<Transition>
<div ref="legendWrapper" v-show="state.settings.showLegend" id="legendWrapper" class="d-flex flex-wrap py-1">
    <div class="flex-grow-1 d-flex flex-wrap justify-content-center">
        <div class="col-auto close-button-wrapper">
            <img src="/images/chevron-up.svg" class="invert close-button"
                 @mouseenter="tip.tooltip('Hide legend', $event)"
                 @click="() => { state.settings.showLegend = false; tip.clearTooltip(); }">
        </div>
        <div class="col"></div>
        <div v-for="logic in state.logics" :key="logic.difficulty" class="col-auto pe-3">
            <svg class="tooltip-check-graphic">
                <use :xlink:href="`#difficulty-${logic.difficulty}`"></use>
            </svg>
            <span class="p-0 m-0 logic-name">: {{ logic.name }}</span>
        </div>
        <div class="col-auto pe-3">
            <div class="behind-tracker static-difficulty-wrapper align-middle">
                <svg class="icon static-difficulty">
                    <use xlink:href="#difficulty-0"></use>
                </svg>
                <svg class="icon static-difficulty hollow">
                    <use xlink:href="#difficulty-0-hollow"></use>
                </svg>
                <div class="behind-tracker-overlay"></div>
            </div>: Tracker
            <img class="invert" src="/images/question-circle.svg" @mouseenter="tip.tooltip('Probably accessible, but not technically in logic', $event)">
        </div>
        <div class="col-auto pe-3">
            <div class="difficulty-0 static-difficulty-wrapper behind-keys align-middle">
                <svg class="icon static-difficulty">
                    <use xlink:href="#difficulty-0"></use>
                </svg>
                <svg class="icon static-difficulty hollow">
                    <use xlink:href="#difficulty-0-hollow"></use>
                </svg>
                <div class="behind-keys-overlay"></div>
            </div>: Needs keys
        </div>
        <div class="col-auto pe-3">
            <div class="difficulty-0 static-difficulty-wrapper requires-rupees align-middle">
                <svg class="icon static-difficulty">
                    <use xlink:href="#difficulty-0"></use>
                </svg>
                <svg class="icon static-difficulty hollow">
                    <use xlink:href="#difficulty-0-hollow"></use>
                </svg>
                <div class="behind-rupees-overlay"></div>
            </div>: Needs rupees
        </div>
        <div class="col-auto pe-3">
            <svg class="tooltip-check-graphic">
                <use xlink:href="#difficulty-0-vanilla"></use>
            </svg>: Vanilla
        </div>
        <!-- <div class="col-auto pe-3">
            <svg class="tooltip-check-graphic">
                <use xlink:href="#difficulty-9"></use>
            </svg>: Out of logic
        </div> -->
        <div class="col-auto pe-3">
            <div class="tooltip-check-graphic left-click"></div>: Toggle
        </div>
        <div class="col-auto pe-3">
            <div class="tooltip-check-graphic right-click"></div>: Pin
        </div>
        <div class="col-auto pe-3">
            Ctrl+Z: Undo
        </div>
        <!-- <div class="col-auto">
            <div class="tooltip-check-graphic middle-click"></div> or Ctrl+
        </div>
        <div class="col-auto">
            <div class="tooltip-check-graphic left-click"></div>: View Dungeon
        </div> -->
    </div>
    <div id="itemBlank"></div>
</div>
</Transition>
</div>
</template>

<style scoped>
#legendWrapper.v-enter-active,
#legendWrapper.v-leave-active {
    transition: transform 0.3s ease;
}

#legendWrapper.v-enter-from,
#legendWrapper.v-leave-to {
    transform: translateY(-100%);
}

#legendWrapper {
    overflow: hidden;
}

#wrapper {
    overflow: hidden;
    transition: max-height 0.3s ease;
    max-height: v-bind(legendHeight);
}

#itemBlank {
    width: 294px;
}

span.logic-name {
    text-transform: capitalize;
}

.close-button {
    max-height: 100%;
    width: auto;
    height: auto;
    opacity: 0.5;
    padding: 4px;
    cursor: pointer;
}

.close-button:hover {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
}
</style>