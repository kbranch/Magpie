<script setup>
import {$} from '@/moduleWrappers.js';
import TextCheckArea from './TextCheckArea.vue';
import { ref, onMounted, computed, onUpdated } from 'vue';

const props = defineProps({
    logic: {
        required: true,
    },
    checks: {
        required: true,
    },
    misc: {
        required: true,
    },
});

const diff = ref(props.logic.difficulty);
const lowerDiff = computed(() => String(props.logic.difficulty).toLowerCase());
const collapse = ref(null);
const grid = ref(null);
const checksByArea = computed(() => Object.groupBy(props.checks, check => check.metadata.area));

onMounted(() => {
    $(grid.value).masonry({
        transitionDuration: 0,
        columnWidth: '.text-check-card-wrapper:not(.hidden)',
    });

    collapse.value.addEventListener('shown.bs.collapse', applyMasonry);
});

onUpdated(() => {
    applyMasonry();
});

function applyMasonry() {
    $(grid.value).masonry('reloadItems')
                    .masonry();
}

</script>

<template>
<div :class="`accordion-item${checks.length == 0 ? ' hidden' : ''}`">
    <h2 :id="`heading-${diff}`" class="accordion-header">
        <button :class="`accordion-button${diff == 0 ? '' : ' collapsed'}`" type="button" data-bs-toggle="collapse" :data-bs-target="`#collapse-${diff}`" :aria-expanded="logic.difficulty == 0" :aria-controls="`collapse-${diff}`">
            <div :class="`tooltip-check-graphic difficulty-${lowerDiff}`">
                <svg class="tooltip-check-graphic"><use :xlink:href="`#difficulty-${lowerDiff}`"></use></svg>
            </div>
            <span class="ps-2">{{logic.friendlyName}}</span>
        </button>
    </h2>

    <div ref="collapse" :id="`collapse-${diff}`" :class="`accordion-collapse collapse${diff == 0 ? ' show' : ''}`" :aria-labelledby="`heading-${diff}`" data-bs-parent="#mapAccordion">
        <div class="accordion-body">
            <div class="container">
                <div ref="grid" class="row grid" data-masonry='{"percentPosition": true }' onclick="preventDoubleClick(event)">
                    <TextCheckArea v-for="area in Object.keys(checksByArea)" :key="area" :area="area" :checks="checksByArea[area]" :misc="misc" />
                </div>
            </div>
        </div>
    </div>
</div>
</template>