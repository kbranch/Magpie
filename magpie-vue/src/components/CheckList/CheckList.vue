<script setup>
import {$} from '@/moduleWrappers.js';
import { computed, ref, watch } from 'vue';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import MapLegend from './MapLegend.vue';
import TextCheckArea from './TextCheckArea.vue';

const tip = useTextTooltipStore();

const props = defineProps([
    'logics',
    'checkAccessibility',
    'misc'
]);

const activeTab = ref('dynamic');
const checksDiv = ref(null);

watch(props.checkAccessibility, () => {
    console.log('watchin');
});

// const filteredChecks = computed(() => props.checkAccessibility.filter(check => (check.shouldDraw() || check.difficulty == 9) && check.isEnabled()));
// const checksByDifficulty = computed(() => Object.groupBy(filteredChecks.value, check => props.misc.checkedChecks?.has(check.id) ? -1 : check.difficulty));
const totalChecks = computed(() => new Set(props.checkAccessibility.filter(x => !x.isVanillaOwl() 
                                                                                && x.id != 'egg' 
                                                                                && !x.metadata.vanillaItem 
                                                                                && x.isEnabled())
                                                                   .map(x => x.id))
                                                                   .size);

const activeChecks = computed(() => {
    let checks = [];
    let areasWithChecks = new Set();

    props.checkAccessibility.map(x => x.updateChecked());

    if (activeTab.value == 'dynamic') {
        checks = props.checkAccessibility.filter(check => (check.difficulty != 9
                                                           || props.misc.localSettings.showOutOfLogic)
                                                          && (!check.isVanilla
                                                              || props.misc.localSettings.showVanilla)
                                                          && (!check.isOwnedVanillaPickup()
                                                              || props.misc.localSettings.showOwnedPickups)
                                                          && (!check.isHigherLogic()
                                                              || props.misc.localSettings.showHigherLogic)
                                                          && (!check.checked
                                                              || props.misc.localSettings.showChecked)
                                                          && check.isEnabled()
                                                );
    }

    if (activeTab.value == 'higherLogic') {
        checks = props.checkAccessibility.filter(check => check.isHigherLogic()
                                                          && !check.checked
                                                          && (!check.isVanilla
                                                              || props.misc.localSettings.showVanilla)
                                                          && (!check.isOwnedVanillaPickup()
                                                              || props.misc.localSettings.showOwnedPickups)
                                                          && check.isEnabled());
    }

    if (activeTab.value == 'checked') {
        checks = props.checkAccessibility.filter(check => check.checked
                                                          && (!check.isVanilla
                                                                  || props.misc.localSettings.showVanilla)
                                                              && (!check.isOwnedVanillaPickup()
                                                                  || props.misc.localSettings.showOwnedPickups)
                                                              && check.isEnabled());
    }

    if (activeTab.value == 'outOfLogic') {
        checks = props.checkAccessibility.filter(check => check.difficulty == 9
                                                          && (!check.isVanilla
                                                                  || props.misc.localSettings.showVanilla)
                                                              && (!check.isOwnedVanillaPickup()
                                                                  || props.misc.localSettings.showOwnedPickups)
                                                              && check.isEnabled());
    }

    checks.map(x => {
        if (!x.checked && x.difficulty < 9) { 
            areasWithChecks.add(x.metadata.area)
        }
    });

    return sortByKey(checks, x => [!areasWithChecks.has(x.metadata.area), x.metadata.area, x.checked, x.difficulty, x.metadata.name]);
});

const checksByArea = computed(() => {
    let result = Object.groupBy(activeChecks.value, check => check.metadata.area)
    return result;
});

function applyMasonry() {
    $(checksDiv.value).masonry('reloadItems')
                      .masonry('layout');
}

let startTime;
import { onBeforeMount, onBeforeUpdate, onMounted, onUpdated } from 'vue';
onBeforeMount(() => startTime = Date.now());
onBeforeUpdate(() => startTime = Date.now());
onMounted(() => console.log(`CheckList mounted in ${Date.now() - startTime}`));
onUpdated(() => {
    applyMasonry();
    console.log(`CheckList updated in ${Date.now() - startTime}`)
});

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

// function getChecks(difficulty) {
//     let diff = difficulty == 'Checked' ? -1 : difficulty;

//     if (!(diff in checksByDifficulty.value)) {
//         return [];
//     }

//     return sortByKey(checksByDifficulty.value[diff], x => [x.metadata.area, x.metadata.name]);
// }
</script>

<template>
<MapLegend :logics="logics" />

<ul id="tabButtons">
    <li :class="['tab-button', { active: activeTab == 'dynamic' }]" @mouseenter="tip.tooltip('Checks', $event)">
        <button class="btn tab-link" type="button" @click="activeTab = 'dynamic'">
            <div :class="`tooltip-check-graphic difficulty-0`">
                <svg class="tooltip-check-graphic"><use :xlink:href="`#difficulty-0`"></use></svg>
            </div>
        </button>
    </li>

    <li :class="['tab-button', { active: activeTab == 'higherLogic' }]" @mouseenter="tip.tooltip('Higher logic levels', $event)">
        <button class="btn tab-link" type="button" @click="activeTab = 'higherLogic'">
            <img src="/images/higher-logic.svg" class="quicksettings-icon align-middle tooltip-check-graphic">
        </button>
    </li>

    <li :class="['tab-button', { active: activeTab == 'checked' }]" @mouseenter="tip.tooltip('Checked', $event)">
        <button class="btn tab-link" type="button" @click="activeTab = 'checked'">
            <div :class="`tooltip-check-graphic difficulty-checked`">
                <svg class="tooltip-check-graphic"><use :xlink:href="`#difficulty-checked`"></use></svg>
            </div>
        </button>
    </li>

    <li :class="['tab-button', { active: activeTab == 'outOfLogic' }]" @mouseenter="tip.tooltip('Out of logic', $event)">
        <button class="btn tab-link" type="button" @click="activeTab = 'outOfLogic'">
            <div :class="`tooltip-check-graphic difficulty-9`">
                <svg class="tooltip-check-graphic"><use :xlink:href="`#difficulty-9`"></use></svg>
            </div>
        </button>
    </li>
</ul>

<div ref="checksDiv" id="checks" onclick="preventDoubleClick(event)"
     data-masonry='{ "transitionDuration": 0, "columnWidth": ".text-check-card-wrapper" }'>
    <TextCheckArea v-for="area in Object.keys(checksByArea)" :key="area" :area="area" :checks="checksByArea[area]" :misc="misc" />
    <!-- <div v-for="area in Object.keys(checksByArea)">
    </div> -->
</div>

<!-- <div id="mapAccordion" class="accordion">
    <TextLogic v-for="logic in [
        ...logics,
        { difficulty: 9, friendlyName: 'Out of logic' },
        { difficulty: 'Checked', friendlyName: 'Checked' }
    ]"
        :key="logic.difficulty" :logic="logic" :checks="getChecks(logic.difficulty)" :total-check-count="totalChecks" :misc="misc" />
</div> -->

<p>Total checks: {{ totalChecks }}</p>
</template>

<style scoped>
.tab-button.active .tab-link {
    background-color: rgba(255, 255, 255, 0.05) !important;
}

.tab-link:hover {
    background-color: rgba(255, 255, 255, 0.035) !important;
}

.btn {
    border-width: 0px !important;
}

.tab-button .tab-link {
    border-radius: 5px 5px 0px 0px;
}

li {
    list-style: none;
}

ul {
    display: flex;
}

#checks {
    padding-top: 0px;
    border-radius: 0px 5px 5px 5px;
    margin: 0px -4px 0px -4px;
    /* background-color: rgba(255, 255, 255, 0.025) !important; */
}

#tabButtons {
    padding-left: 0px;
    margin: 0px;
}
</style>