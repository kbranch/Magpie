<script setup>
import { computed } from 'vue';
import TextLogic from './TextLogic.vue';
import MapLegend from './MapLegend.vue';

const props = defineProps([
    'logics',
    'checkAccessibility',
    'misc'
]);

const filteredChecks = computed(() => props.checkAccessibility.filter(check => (check.shouldDraw() || check.difficulty == 9) && check.isEnabled()));
const checksByDifficulty = computed(() => Object.groupBy(filteredChecks.value, check => props.misc.checkedChecks?.has(check.id) ? -1 : check.difficulty));
const totalChecks = computed(() => new Set(props.checkAccessibility.filter(x => !x.isVanillaOwl() 
                                                                                && x.id != 'egg' 
                                                                                && !x.metadata.vanillaItem 
                                                                                && x.isEnabled())
                                                                   .map(x => x.id))
                                                                   .size);

// let startTime;
// import { onBeforeMount, onBeforeUpdate, onMounted, onUpdated } from 'vue';
// onBeforeMount(() => startTime = Date.now());
// onBeforeUpdate(() => startTime = Date.now());
// onMounted(() => console.log(`CheckList mounted in ${Date.now() - startTime}`));
// onUpdated(() => console.log(`CheckList updated in ${Date.now() - startTime}`));

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
<MapLegend :logics="logics" />

<div id="mapAccordion" class="accordion">
    <TextLogic v-for="logic in [
        ...logics,
        { difficulty: 9, friendlyName: 'Out of logic' },
        { difficulty: 'Checked', friendlyName: 'Checked' }
    ]"
        :key="logic.difficulty" :logic="logic" :checks="getChecks(logic.difficulty)" :total-check-count="totalChecks" :misc="misc" />
</div>

<p>Total checks: {{ totalChecks }}</p>
</template>