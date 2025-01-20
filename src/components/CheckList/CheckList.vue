<script setup>
import { $, drawActiveTab } from '@/moduleWrappers.js';
import { computed, ref, onUpdated } from 'vue';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { useStateStore } from '@/stores/stateStore.js';
import TextCheckArea from './TextCheckArea.vue';
import { watch, nextTick } from 'vue';
import CheckStats from './CheckStats.vue';

const state = useStateStore();
const tip = useTextTooltipStore();

const props = defineProps([
    'checkAccessibility',
]);

const activeTab = ref('dynamic');
const checksDiv = ref(null);
const searchText = ref('');

const textColor = computed(() => state.settings.textColor);

const activeChecks = computed(() => {
    let checks = [];
    let areasWithChecks = new Set();
    
    // This shouldn't be needed - check.checked isn't behaving reactive for some reason
    // eslint-disable-next-line no-unused-vars
    let dummy = state.checkedChecks?.has('asdf');

    props.checkAccessibility.map(x => {
        x.updateChecked();
        x.inFilter = false;
    });

    if (activeTab.value == 'dynamic') {
        checks = props.checkAccessibility.filter(check => (check.difficulty != 9
                                                           || state.settings.showOutOfLogic)
                                                          && (!check.isVanilla
                                                              || state.settings.showVanilla
                                                              || (check.isVanillaOwl() && state.settings.showHints))
                                                          && (!check.isVanillaOwl()
                                                              || state.settings.showHints)
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
                                                              || state.settings.showVanilla
                                                              || (check.isVanillaOwl() && state.settings.showHints))
                                                          && (!check.isVanillaOwl()
                                                              || state.settings.showHints)
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
        let search = searchText.value.toLowerCase();
        checks = checks.filter(x => x.metadata.name.toLowerCase().includes(search) || x.metadata.area.toLowerCase().includes(search));
        checks.map(x => x.inFilter = true);
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

onUpdated(() => {
    applyMasonry();
});

watch(searchText, () => {
    nextTick(drawActiveTab);
});

function applyMasonry() {
    $(checksDiv.value).masonry('reloadItems')
                      .masonry('layout');
}

// let startTime;
// import { onBeforeMount, onBeforeUpdate, onMounted } from 'vue';
// onBeforeMount(() => startTime = Date.now());
// onBeforeUpdate(() => startTime = Date.now());
// onMounted(() => console.log(`CheckList mounted in ${Date.now() - startTime}`));

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
<div id="headerRow" class="row">
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
    <div id="searchCol" class="col pe-0">
        <img v-if="searchText" src="/images/arrow-clockwise.svg" class="dimvert search-button" @mouseenter="tip.tooltip('Reset filter', $event)" @click="searchText = ''">
        <img src="/images/search.svg" class="dimvert search-button" @mouseenter="tip.tooltip('Filter checks', $event)">
        <input v-model="searchText" id="searchBox" type="text" class="form-control">
    </div>

    <CheckStats />
</div>

<div ref="checksDiv" id="checks" onclick="preventDoubleClick(event)"
     data-masonry='{ "transitionDuration": 0, "columnWidth": ".text-check-card-wrapper" }'>
    <TextCheckArea v-for="area in Object.keys(checksByArea)" :key="area" :area="area" :checks="checksByArea[area]" />
    <span v-if="Object.keys(checksByArea).length == 0" id="noChecks" class="ps-2">{{ searchText ? 'Search found no checks!' : 'No checks!' }}</span>
</div>
</template>

<style scoped>
#headerRow {
    align-items: center;
}

.search-button {
    height: 24px;
    filter: invert() brightness(0.3);
    padding-right: 8px;
}

#searchBox:not(:focus) {
    background-color: rgba(255, 255, 255, 0.05);
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
    max-width: 231px;
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

#noChecks {
    font-size: xx-large;
    width: 100%;
    text-align: center;
}

</style>