<script setup>
import { onMounted } from 'vue';

const props = defineProps({
    logic: {
        required: true,
    },
});

onMounted(() => {
    $(`#collapse-${props.logic.difficulty}`).on('shown.bs.collapse', () => applyMasonry());
});
</script>

<template>
<h2 :id="`heading-${logic.difficulty}`" class="accordion-header">
    <button :class="`accordion-button${logic.difficulty == 0 ? '' : ' collapsed'}`" type="button" data-bs-toggle="collapse" :data-bs-target="`#collapse-${logic.difficulty}`" :aria-expanded="logic.difficulty == 0" :aria-controls="`collapse-${logic.difficulty}`">
        <div :class="`tooltip-check-graphic difficulty-${logic.difficulty} align-middle`">
            <svg class="tooltip-check-graphic align-middle"><use :xlink:href="`#difficulty-${logic.difficulty}`"></use></svg>
        </div>
        <span :id="`difficulty${logic.difficulty}AccordionName`" class="ps-2">{{logic.friendlyName}}</span>
    </button>
</h2>

<div :id="`collapse-${logic.difficulty}`" :class="`accordion-collapse collapse${logic.difficulty == 0 ? ' show' : ''}`" :aria-labelledby="`heading-${logic.difficulty}`" data-bs-parent="#mapAccordion">
    <div class="accordion-body">
        <div class="container">
            <div class="row grid" :data-difficulty="logic.difficulty" data-masonry='{"percentPosition": true }' onclick="preventDoubleClick(event)">
            </div>
        </div>
    </div>
</div>
</template>