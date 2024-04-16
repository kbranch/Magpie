<script setup>
import TextLogic from './TextLogic.vue';

defineProps({
    logics: {
        required: true,
    },
});
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
        <div v-for="logic in logics" :key="logic.difficulty" :id="`difficulty${logic.difficulty}Accordion`" :data-difficulty="logic.difficulty" :class="`accordion-item${logic.difficulty == 0 ? '' : ' hidden'}`">
            <TextLogic :logic="logic" />
        </div>

        <div id="difficulty9Accordion" data-difficulty="9" class="accordion-item hidden">
            <h2 id="heading-9" class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-9" aria-expanded="false" aria-controls="collapse-9">
                    <div class="tooltip-check-graphic difficulty-9 align-middle">
                        <svg class="tooltip-check-graphic align-middle"><use xlink:href="#difficulty-9"></use></svg>
                    </div>
                    <span id="difficulty9AccordionName" class="ps-2">Out of logic</span>
                </button>
            </h2>
    
            <div id="collapse-9" class="accordion-collapse collapse" aria-labelledby="heading-9" data-bs-parent="#mapAccordion">
                <div class="accordion-body">
                    <div class="container">
                        <div class="row grid" data-difficulty="9" data-masonry='{"percentPosition": true }' onclick="preventDoubleClick(event)">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
        <div id="difficultyCheckedAccordion" data-difficulty="checked" class="accordion-item hidden">
            <h2 id="heading-Checked" class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-Checked" aria-expanded="false" aria-controls="collapse-Checked">
                    <div class="tooltip-check-graphic difficulty-checked align-middle">
                        <svg class="tooltip-check-graphic align-middle"><use xlink:href="#difficulty-checked"></use></svg>
                    </div>
                    <span class="ps-2">Checked</span>
                </button>
            </h2>
    
            <div id="collapse-Checked" class="accordion-collapse collapse" aria-labelledby="heading-Checked" data-bs-parent="#mapAccordion">
                <div class="accordion-body">
                    <div class="container">
                        <div class="row grid" data-difficulty="checked" data-masonry='{"percentPosition": true }' onclick="preventDoubleClick(event)">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

<p id="checkCounter"></p>
</template>