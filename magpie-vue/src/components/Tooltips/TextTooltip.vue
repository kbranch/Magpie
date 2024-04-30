<script setup>
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { computed, onBeforeMount, onBeforeUpdate, onMounted, onUpdated, ref } from 'vue';

defineProps(['textColor']);

const state = useTextTooltipStore();
const tooltip = ref(null);
const rootRect = ref(null);
const rect = ref(null);
const updateComputed = ref(false);

const tipLeft = computed(() => {
    let tipRect = tooltip.value?.getBoundingClientRect();

    if (!rect.value || !tipRect) {
        return 0;
    }

    let left = rect.value.left - tipRect.width / 2 + rect.value.width / 2;

    if (left < rootRect.value.left) {
        left = 5;
    }
    else if (left + tipRect.width + 5 > rootRect.value.right) {
        left = rootRect.value.right - 5 - tipRect.width;
    }

    // Trick this into updating on command
    updateComputed.value;

    return left;
});

const tipTop = computed(() => {
    let tipRect = tooltip.value?.getBoundingClientRect();

    if (!rect.value || !tipRect) {
        return 0;
    }

    let top = rect.value.top - 5 - tipRect.height;
    
    if (top < 0) {
        top = rect.value.bottom + 5;
    }

    // Trick this into updating on command
    updateComputed.value;

    return top;
});

onMounted(() => {
    watch();
    updateComputed.value = !updateComputed.value;
});
onUpdated(() => {
    watch();
    updateComputed.value = !updateComputed.value;
});

onBeforeUpdate(updateRootRect);
onBeforeMount(updateRootRect);

function updateRootRect() {
    rootRect.value = document.body.getBoundingClientRect();
    rect.value = state.element?.getBoundingClientRect();
}

let watchTimeout = null;
function watch() {
    updateComputed.value = !updateComputed.value;
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
    <div ref="tooltip" v-if="state.show && state.text" class="textTooltip" :style="`top: ${tipTop}px; left: ${tipLeft}px; color: ${textColor};`">
        <span class="tooltipText">{{ state.text }}</span>
    </div>
</template>

<style scoped>
.textTooltip {
    background-color: black;
    text-align: center;
    border-radius: 6px;
    width: fit-content;
    max-width: 500px;
    padding: 5px 10px 5px 10px;
    position: absolute;
    z-index: 999999;
}
</style>