<script setup>
import {$} from '@/moduleWrappers.js';
import { computed, ref, onUpdated } from 'vue';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { useStateStore } from '@/stores/stateStore.js';
import MapLegend from './MapLegend.vue';
import TextCheckArea from './TextCheckArea.vue';

const state = useStateStore();
const tip = useTextTooltipStore();

const props = defineProps([
    'logics',
    'checkAccessibility',
]);

const activeTab = ref('dynamic');
const checksDiv = ref(null);
const searchText = ref('');

const textColor = computed(() => state.settings.textColor);

const countableChecks = computed(() => {
    // This shouldn't be needed - check.checked isn't behaving reactive for some reason
    // eslint-disable-next-line no-unused-vars
    let dummy = state.checkedChecks?.has('asdf');

    return props.checkAccessibility.filter(x => !x.isVanillaOwl()
        && x.id != 'egg'
        && !x.metadata.vanillaItem
        && x.isEnabled())
});

const totalChecks = computed(() => new Set(countableChecks.value.map(x => x.id)).size);

const activeChecks = computed(() => {
    let checks = [];
    let areasWithChecks = new Set();
    
    // This shouldn't be needed - check.checked isn't behaving reactive for some reason
    // eslint-disable-next-line no-unused-vars
    let dummy = state.checkedChecks?.has('asdf');

    props.checkAccessibility.map(x => x.updateChecked());

    if (activeTab.value == 'dynamic') {
        checks = props.checkAccessibility.filter(check => (check.difficulty != 9
                                                           || state.settings.showOutOfLogic)
                                                          && (!check.isVanilla
                                                              || state.settings.showVanilla)
                                                          && (!check.isOwnedVanillaPickup()
                                                              || state.settings.showOwnedPickups)
                                                          && (!check.isHigherLogic()
                                                              || state.settings.showHigherLogic)
                                                          && !check.checked
                                                          && check.isEnabled()
                                                );
    }

    if (activeTab.value == 'higherLogic') {
        checks = props.checkAccessibility.filter(check => check.isHigherLogic()
                                                          && !check.checked
                                                          && (!check.isVanilla
                                                              || state.settings.showVanilla)
                                                          && (!check.isOwnedVanillaPickup()
                                                              || state.settings.showOwnedPickups)
                                                          && check.isEnabled());
    }

    if (activeTab.value == 'checked') {
        checks = props.checkAccessibility.filter(check => check.checked
                                                          && (!check.isVanilla
                                                                  || state.settings.showVanilla)
                                                              && (!check.isOwnedVanillaPickup()
                                                                  || state.settings.showOwnedPickups)
                                                              && check.isEnabled());
    }

    if (activeTab.value == 'outOfLogic') {
        checks = props.checkAccessibility.filter(check => check.difficulty == 9
                                                          && (!check.isVanilla
                                                                  || state.settings.showVanilla)
                                                              && (!check.isOwnedVanillaPickup()
                                                                  || state.settings.showOwnedPickups)
                                                              && check.isEnabled());
    }

    if (searchText.value) {
        checks = checks.filter(x => x.metadata.name.toLowerCase().includes(searchText.value) || x.metadata.area.toLowerCase().includes(searchText.value));
    }

    checks.map(x => {
        if (x.difficulty < 9) { 
            areasWithChecks.add(x.metadata.area)
        }
    });

    checks = sortByKey(checks, x => [!areasWithChecks.has(x.metadata.area), x.metadata.area, x.baseDifficulty, x.metadata.name]);

    checks = Array.from(new Set(checks.map(check => check.id)))
         .map(id => {
             let sharedChecks = checks.filter(x => x.id == id);
             return {
                 'id': id,
                 'allChecks': sharedChecks,
                 'check': sharedChecks[0],
             };
         });

    return checks;
});

const checksByArea = computed(() => Object.groupBy(activeChecks.value, check => check.check.metadata.area));
const checksByDifficulty = computed(() => Object.groupBy(countableChecks.value, check => check.difficulty));

function applyMasonry() {
    $(checksDiv.value).masonry('reloadItems')
                      .masonry('layout');
}

// let startTime;
// import { onBeforeMount, onBeforeUpdate, onMounted } from 'vue';
// onBeforeMount(() => startTime = Date.now());
// onBeforeUpdate(() => startTime = Date.now());
// onMounted(() => console.log(`CheckList mounted in ${Date.now() - startTime}`));

onUpdated(() => {
    applyMasonry();
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
</script>

<template>
<MapLegend :logics="logics" />

<div class="row">
    <div class="col-auto">
        <ul id="tabButtons">
            <li class="me-0" :class="['tab-button', { active: activeTab == 'dynamic' }]" @mouseenter="tip.tooltip('Checks', $event)">
                <button class="btn tab-link" type="button" @click="activeTab = 'dynamic'">
                    <div :class="`tooltip-check-graphic difficulty-0`">
                        <svg class="tooltip-check-graphic"><use :xlink:href="`#difficulty-0`"></use></svg>
                    </div>
                </button>
            </li>

            <!-- <li class="mx-0" :class="['tab-button', { active: activeTab == 'higherLogic' }]" @mouseenter="tip.tooltip('Higher logic levels', $event)">
                <button class="btn tab-link" type="button" @click="activeTab = 'higherLogic'">
                    <img src="/images/higher-logic.svg" class="quicksettings-icon align-middle tooltip-check-graphic">
                </button>
            </li> -->

            <li class="mx-1" :class="['tab-button', { active: activeTab == 'checked' }]" @mouseenter="tip.tooltip('Checked', $event)">
                <button class="btn tab-link" type="button" @click="activeTab = 'checked'">
                    <div :class="`tooltip-check-graphic difficulty-checked`">
                        <svg class="tooltip-check-graphic"><use :xlink:href="`#difficulty-checked`"></use></svg>
                    </div>
                </button>
            </li>

            <li class="mx-0" :class="['tab-button', { active: activeTab == 'outOfLogic' }]" @mouseenter="tip.tooltip('Out of logic', $event)">
                <button class="btn tab-link" type="button" @click="activeTab = 'outOfLogic'">
                    <div :class="`tooltip-check-graphic difficulty-9`">
                        <svg class="tooltip-check-graphic"><use :xlink:href="`#difficulty-9`"></use></svg>
                    </div>
                </button>
            </li>
        </ul>
    </div>
    <div id="checkStats" class="col-auto ps-0">
        <div id="hideButton">
            <img :src="`/images/chevron-${state.settings.showStats ? 'left' : 'right'}.svg`" class="invert close-button ms-2"
                @mouseenter="tip.tooltip(state.settings.showStats ? 'Hide stats' : 'Show stats', $event)"
                @click="() => { state.settings.showStats = !state.settings.showStats; tip.clearTooltip(); }">
        </div>

        <div id="statsWrapperWrapper">
            <Transition>
                <div id="statsWrapper" v-if="state.settings.showStats">
                    <div v-for="difficulty in Object.keys(checksByDifficulty)" :key="difficulty" class="check-stat px-2">
                            <div :class="`tooltip-check-graphic difficulty-${difficulty == -1 ? 'checked' : difficulty}`">
                                <svg class="tooltip-check-graphic"><use :xlink:href="`#difficulty-${difficulty == -1 ? 'checked' : difficulty}`"></use></svg>
                            </div>
                        <span>
                            : {{ checksByDifficulty[difficulty].length }} ({{ (checksByDifficulty[difficulty].length / totalChecks * 100).toFixed(1) }}%)
                        </span>
                    </div>
                    <span>Total: {{ totalChecks }}</span>
                </div>
            </Transition>
        </div>
    </div>
    <div id="searchCol" class="col">
        <img v-if="searchText" src="/images/arrow-clockwise.svg" class="dimvert search-button" @mouseenter="tip.tooltip('Reset filter', $event)" @click="searchText = ''">
        <img src="/images/search.svg" class="dimvert search-button" @mouseenter="tip.tooltip('Filter checks', $event)">
        <input v-model="searchText" id="searchBox" type="text" class="form-control">
    </div>
</div>

<div ref="checksDiv" id="checks" onclick="preventDoubleClick(event)"
     data-masonry='{ "transitionDuration": 0, "columnWidth": ".text-check-card-wrapper" }'>
    <TextCheckArea v-for="area in Object.keys(checksByArea)" :key="area" :area="area" :checks="checksByArea[area]" />
    <span v-if="Object.keys(checksByArea).length == 0" id="noChecks" class="ps-2">{{ searchText ? 'Search found no checks!' : 'No checks!' }}</span>
</div>
</template>

<style scoped>
.search-button {
    height: 24px;
    filter: invert() brightness(0.3);
    padding-right: 8px;
}

#searchBox:not(:focus) {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(0, 0, 0, 0.5);
    color: v-bind(textColor);
}

#searchBox {
    line-height: 1;
    border-radius: 5px;
    max-width: 175px;
    min-width: 50px;
    margin-right: 0px;
}

#searchCol {
    justify-content: end;
    align-items: center;
    display: flex;
    flex-basis: min-content;
    flex-grow: 1;
    flex-shrink: 1;
    padding-top: 6px;
    padding-bottom: 6px;
}

#statsWrapper.v-enter-active,
#statsWrapper.v-leave-active {
  transition: all 0.3s ease;
}

#statsWrapper.v-enter-from,
#statsWrapper.v-leave-to {
    transform: translateX(-100%);
}

.check-stat {
    display: inline-block;
}

.tab-button.active {
    border-bottom: 3px;
    border-bottom-color: rgba(255, 255, 255, 0.3);
    border-bottom-style: solid;
}

.tab-button:hover {
    background-color: rgba(255, 255, 255, 0.075) !important;
}

.btn {
    border-width: 0px;
}

.tab-button .tab-link {
    border-radius: 5px 5px 0px 0px;
    background-color: rgba(255, 255, 255, 0.05) !important;
}

.close-button {
    height: 24px;
    opacity: 0.5;
    padding: 4px;
}

.close-button:hover {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
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
}

#tabButtons {
    padding-left: 0px;
    margin: 0px;
}

#checkStats {
    align-content: center;
    padding-right: 0.4em;
    display: flex;
}

#noChecks {
    font-size: xx-large;
    width: 100%;
    text-align: center;
}

#statsWrapperWrapper {
    overflow: hidden;
    align-content: center;
}

#hideButton {
    align-content: center;
    cursor: pointer;
}
</style>