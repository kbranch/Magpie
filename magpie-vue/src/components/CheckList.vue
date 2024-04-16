<script setup>
import { computed } from 'vue';
import TextLogic from './TextLogic.vue';

const props = defineProps({
    logics: {
        required: true,
    },
    checkAccessibility: {
        required: true,
    },
});

const filteredChecks = computed(() => props.checkAccessibility.filter(check => (check.shouldDraw() || check.difficulty == 9)));
const checksByDifficulty = computed(() => Object.groupBy(filteredChecks.value, check => check.difficulty));

function compare(a, b) {
    if (a > b) {
        return 1
    } else if (a < b) {
        return -1
    } else {
        return 0
    }
}

function sortByKey(arr, key) {
    return arr.sort((a, b) => compare(key(a), key(b)))
}

function getChecks(difficulty) {
    let diff = difficulty == 'Checked' ? -1 : difficulty;

    if (!(diff in checksByDifficulty.value)) {
        return [];
    }

    return sortByKey(checksByDifficulty.value[diff], x => [x.metadata.area, x.metadata.name]);
}
</script>

<template>
<div class="d-flex flex-wrap py-1">
    <div id="legend" class="flex-grow-1 d-flex flex-wrap justify-content-center">
        <div v-for="logic in logics" :key="logic.difficulty" :id="`legendDifficulty${logic.difficulty}`" class="col-auto px-2 legend-difficulty">
            <svg class="tooltip-check-graphic align-middle"><use :xlink:href="`#difficulty-${logic.difficulty}`"></use></svg><span :id="`legendDifficultyName${logic.difficulty}`" class="p-0 m-0 logic-name">: {{logic.name}}</span>
        </div>
        <div class="col-auto px-2">
            <div class="behind-tracker static-difficulty-wrapper align-middle">
                <svg class="icon static-difficulty"><use xlink:href="#difficulty-0"></use></svg>
                <svg class="icon static-difficulty hollow"><use xlink:href="#difficulty-0-hollow"></use></svg>
                <div class="behind-tracker-overlay"></div>
            </div>: Tracker
            <img id="trackerLogicHelp" class="invert" src="/images/question-circle.svg" data-bs-toggle="tooltip" data-bs-custom-class="secondary-tooltip" data-bs-title="Probably accessible, but not technically in logic">
        </div>
        <div class="col-auto px-2">
            <div class="difficulty-0 static-difficulty-wrapper behind-keys align-middle">
                <svg class="icon static-difficulty"><use xlink:href="#difficulty-0"></use></svg>
                <svg class="icon static-difficulty hollow"><use xlink:href="#difficulty-0-hollow"></use></svg>
                <div class="behind-rupees-overlay"></div>
                <div class="behind-keys-overlay"></div>
            </div>: Needs keys
        </div>
        <div class="col-auto px-2">
            <div class="difficulty-0 static-difficulty-wrapper requires-rupees align-middle">
                <svg class="icon static-difficulty"><use xlink:href="#difficulty-0"></use></svg>
                <svg class="icon static-difficulty hollow"><use xlink:href="#difficulty-0-hollow"></use></svg>
                <div class="behind-rupees-overlay"></div>
                <div class="behind-keys-overlay"></div>
            </div>: Needs rupees
        </div>
        <div class="col-auto px-2">
            <svg class="tooltip-check-graphic align-middle"><use xlink:href="#difficulty-0-vanilla"></use></svg>: Vanilla
        </div>
        <div class="col-auto px-2">
            <svg class="tooltip-check-graphic align-middle"><use xlink:href="#difficulty-9"></use></svg>: Out of logic
        </div>
        <div class="col-auto px-2">
            <div class="tooltip-check-graphic left-click align-middle"></div>: Toggle
        </div>
        <div class="col-auto px-2">
            <div class="tooltip-check-graphic right-click align-middle"></div>: Pin
        </div>
        <div class="col-auto px-2">
            Ctrl+Z: Undo
        </div>
        <div class="col-auto ps-2">
            <div class="tooltip-check-graphic middle-click align-middle"></div> or Ctrl+
        </div>
        <div class="col-auto pe-2">
            <div class="tooltip-check-graphic left-click align-middle"></div>: View Dungeon
        </div>
    </div>
    <div id="item-blank"></div>
</div>

<div id="mapAccordion" class="accordion">
    <TextLogic v-for="logic in [...logics,
                                { difficulty: 9, friendlyName: 'Out of logic' },
                                { difficulty: 'Checked', friendlyName: 'Checked' }]"
        :key="logic.difficulty" :logic="logic" :checks="getChecks(logic.difficulty)" />
</div>

<p id="checkCounter"></p>
</template>