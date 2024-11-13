<script setup>
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';

const tip = useTextTooltipStore();
defineProps(['logics']);
</script>

<template>
<div class="d-flex flex-wrap py-1">
    <div class="flex-grow-1 d-flex flex-wrap justify-content-center">
        <div v-for="logic in logics" :key="logic.difficulty" class="col-auto px-2">
            <svg class="tooltip-check-graphic">
                <use :xlink:href="`#difficulty-${logic.difficulty}`"></use>
            </svg>
            <span class="p-0 m-0 logic-name">: {{ logic.name }}</span>
        </div>
        <div class="col-auto px-2">
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
        <div class="col-auto px-2">
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
        <div class="col-auto px-2">
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
        <div class="col-auto px-2">
            <svg class="tooltip-check-graphic">
                <use xlink:href="#difficulty-0-vanilla"></use>
            </svg>: Vanilla
        </div>
        <div class="col-auto px-2">
            <svg class="tooltip-check-graphic">
                <use xlink:href="#difficulty-9"></use>
            </svg>: Out of logic
        </div>
        <div class="col-auto px-2">
            <div class="tooltip-check-graphic left-click"></div>: Toggle
        </div>
        <div class="col-auto px-2">
            <div class="tooltip-check-graphic right-click"></div>: Pin
        </div>
        <div class="col-auto px-2">
            Ctrl+Z: Undo
        </div>
        <div class="col-auto ps-2">
            <div class="tooltip-check-graphic middle-click"></div> or Ctrl+
        </div>
        <div class="col-auto pe-2">
            <div class="tooltip-check-graphic left-click"></div>: View Dungeon
        </div>
    </div>
    <div id="item-blank"></div>
</div>
</template>

<style scoped>
#item-blank {
    width: 294px;
}

span.logic-name {
    text-transform: capitalize;
}
</style>