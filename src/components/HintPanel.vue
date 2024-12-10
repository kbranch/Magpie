<script setup>
import { saveQuickSettings, drawActiveTab, bootstrap } from '@/moduleWrappers.js';
import { useStateStore } from '@/stores/stateStore';
import { useTextTooltipStore } from '@/stores/textTooltipStore';
import { computed, nextTick, onBeforeMount, ref, watch } from 'vue';
import { itemNames } from '@/metadata/itemNames';
import { debounce } from '@/main';

const state = useStateStore();
const tip = useTextTooltipStore();

const newHint = ref({});

const bgColor = computed(() => state.settings.bgColor);
const textColor = computed(() => state.settings.textColor);

const items = [
    'SHIELD', 'SWORD', 'MAGIC_POWDER', 'SHOVEL', 'BOMB', 'BOW', 'FEATHER', 'POWER_BRACELET', 'PEGASUS_BOOTS', 
    'FLIPPERS', 'HOOKSHOT', 'MAGIC_ROD', 'ROOSTER', 'OCARINA', 'SONG1', 'SONG2', 'SONG3', 'BOWWOW', 'BOOMERANG', 
    'TAIL_KEY', 'ANGLER_KEY', 'FACE_KEY', 'BIRD_KEY', 'SLIME_KEY', 'GOLD_LEAF', 
    'GOOD'
];

const areas = computed(() => [... new Set(state.checkAccessibility.map(x => x.metadata.area))].sort());

watch(newHint,
    (newValue) => {
        if (newValue.item && newValue.location) {
            state.hints.push({ item: newValue.item, location: newValue.location });
            newHint.value = {};
            nextTick(updateWrapperHeight);
        }
    },
    { deep: true },
);

const hintItemDropdowns = ref(null);
const hintLocationDropdowns = ref(null);
const newHintItemDropdown = ref(null);
const newHintLocationDropdown = ref(null);
const wrapper = ref(null);
const hintsWrapper = ref(null);
const wrapperHeight = ref('unset');
const showHintPanel = computed(() => state.settings.showHintPanel);
const highlightedChecks = ref([]);

const rootResizeObserver = new ResizeObserver(() => nextTick(updateWrapperHeight), { threshold: 1.0 });

state.onHintUpdate(() => nextTick(processDropdowns));

onBeforeMount(() => {
    rootResizeObserver.observe(document.body);
});

watch(showHintPanel, () => {
    wrapper.value.classList.add('transitioning');
    nextTick(updateWrapperHeight);
});

watch(highlightedChecks, (newValue, oldValue) => {
    oldValue?.map(x => x.hintHighlighted = false);
    newValue?.map(x => x.hintHighlighted = true);

    debounce(drawActiveTab, 50);
});

function processDropdowns() {
    if (hintItemDropdowns.value) {
        for (const element of hintItemDropdowns.value) {
            configureDropdown(element);
        }
    }

    if (hintLocationDropdowns.value) {
        for (const element of hintLocationDropdowns.value) {
            configureDropdown(element);
        }
    }

    if (newHintLocationDropdown.value) {
        configureDropdown(newHintLocationDropdown.value);
    }

    if (newHintItemDropdown.value) {
        configureDropdown(newHintItemDropdown.value);
    }

    updateWrapperHeight();
}

function configureDropdown(element) {
    if (element.popperConfigured) {
        return;
    }
    
    new bootstrap.Dropdown(element, {
        popperConfig: { 
            strategy: 'fixed',
            placement: 'auto',
        },
    });

    element.popperConfigured = true;
}

function updateWrapperHeight() {
    wrapperHeight.value = state.settings.showHintPanel ? `${hintsWrapper.value?.getBoundingClientRect().height}px` : '0px';
}

function transitionEnded(event) {
    if (event.target == wrapper.value) {
        setTimeout(() => wrapper.value.classList.remove('transitioning'), 50);
    }
}

function highlightHint(hint) {
    if (hint.locationId) {
        highlightedChecks.value = state.checkAccessibility.filter(x => x.id.toLowerCase() == hint.locationId.toLowerCase());
        return;
    }

    let locationName = hint.location.toLowerCase();
    highlightedChecks.value = state.checkAccessibility.filter(x => x.metadata.name.toLowerCase() == locationName
                                                                   || x.metadata.area.toLowerCase() == locationName);
}

function removeHint(hint) {
    state.removeHint(hint);
    highlightedChecks.value = [];
}

</script>

<template>

<div ref="wrapper" id="wrapper" @transitionend="transitionEnded($event)">
<Transition>
<div ref="hintsWrapper" id="hintsWrapper" v-show="state.settings.showHintPanel">
<div id="hintPanel" class="card magpie-colors item-width">
    <div class="card-header">
        <span id="headerText">Hints</span>
        

        <button id="clearHintsButton" class="btn btn-secondary dimvert header-button" type="button" @click="state.hints.map(x => state.removeHint(x))" @mouseenter="tip.tooltip('Clear hints', $event)">
            <img class="header-icon" src="/images/arrow-clockwise.svg">
        </button>

        <!-- <img :src="`/images/${state.starHints ? 'star-fill' : 'star'}.svg`" class="invert header-icon" @click="state.starHints = !state.starHints" @mouseenter="tip.tooltip('Star hinted locations', $event)"> -->

        <div class="col-auto quicksetting">
            <input id="showHints" type="checkbox" v-model="state.settings.showHints" class="form-check-input quicksettings-input" @change="saveQuickSettings()">
            <label for="showHints" :class="[state.settings.showHints ? 'active' : '']" class="quicksettings-label" @mouseenter="tip.tooltip('Show available hints', $event)">
                <img class="header-icon" src="/images/lightbulb-fill.svg">
            </label>
        </div>
    </div>
    <div class="card-body">
        <div v-for="hint in state.hints" :key="hint" class="hint-row" @mouseenter="highlightHint(hint)" @mouseleave="highlightedChecks = []">
            <div class="dropdown">
                <button ref="hintItemDropdowns" class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img class="dropdown-icon" :src="`/images/${hint.item}_1.png`">
                </button>
                <ul class="dropdown-menu">
                    <li v-for="item in items" :key="item">
                        <a :class="{'dropdown-active': item == hint.item}" class="dropdown-item" href="#" @click="hint.item = item">
                            <img class="dropdown-icon" :src="`/images/${item}_1.png`">
                            {{ itemNames[item] }}
                        </a>
                    </li>
                </ul>
            </div>
            <span class="at">at</span>
            <div class="dropdown location-dropdown">
                <button ref="hintLocationDropdowns" class="btn btn-secondary dropdown-toggle location-dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="location-text">{{ hint.location }}</div>
                </button>
                <ul class="dropdown-menu">
                    <li v-for="area in areas" :key="area">
                        <a :class="{'dropdown-active': area == hint.location}" class="dropdown-item" href="#" @click="hint.location = area">
                            {{ area }}
                        </a>
                    </li>
                </ul>
            </div>
            <div class="dropdown">
                <button class="btn btn-secondary close-button" type="button" @click="removeHint(hint)" @mouseover="tip.tooltip('Remove hint', $event)">
                    <img class="invert" src="/images/x.svg">
                </button>
            </div>
        </div>


        <div class="hint-row">
            <div class="dropdown">
                <button ref="newHintItemDropdown" class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <template v-if="newHint.item">
                        <img class="dropdown-icon" :src="`/images/${newHint.item}_1.png`">
                    </template>
                    <template v-else>
                        <span class="item-text">?</span>
                    </template>
                </button>
                <ul class="dropdown-menu">
                    <li>
                        <a :class="{'dropdown-active': newHint.item == null}" class="dropdown-item" href="#" @click="newHint.item = null">
                            <span class="dropdown-icon">?</span>
                        </a>
                    </li>
                    <li v-for="item in items" :key="item">
                        <a :class="{'dropdown-active': item == newHint.item}" class="dropdown-item" href="#" @click="newHint.item = item">
                            <img class="dropdown-icon" :src="`/images/${item}_1.png`">
                            {{ itemNames[item] }}
                        </a>
                    </li>
                </ul>
            </div>
            <span class="at">at</span>
            <div class="dropdown location-dropdown">
                <button ref="newHintLocationDropdown" class="btn btn-secondary dropdown-toggle location-dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <template v-if="newHint.location">
                        <div class="location-text">{{ newHint.location }}</div>
                    </template>
                    <template v-else>
                        <span class="location-text">Location</span>
                    </template>
                </button>
                <ul class="dropdown-menu">
                    <li>
                        <a :class="{'dropdown-active': newHint.location == null}" class="dropdown-item" href="#" @click="newHint.location = null">
                            Location
                        </a>
                    </li>
                    <li v-for="area in areas" :key="area">
                        <a :class="{'dropdown-active': area == newHint.location}" class="dropdown-item" href="#" @click="newHint.location = area">
                            {{ area }}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>
</div>
</Transition>
</div>

</template>

<style scoped>
#clearHintsButton {
    margin-right: 8px;
    padding: 6px;
}

#hintsWrapper.v-enter-active,
#hintsWrapper.v-leave-active {
    transition: transform 0.3s ease;
    overflow: hidden;
}

#hintsWrapper.v-enter-from,
#hintsWrapper.v-leave-to {
    transform: translateY(-100%);
    overflow: hidden;
}

#wrapper {
    transition: max-height 0.3s ease;
    max-height: v-bind(wrapperHeight);
}

#wrapper.transitioning {
    overflow: hidden;
}

.close-button {
    padding-left: 0px;
    padding-right: 0px;
    padding-top: 10px;
    padding-bottom: 10px;
    margin-left: 4px;
}

.location-dropdown, .location-dropdown-toggle, .location-text {
    width: 100%;
}

.location-text {
    white-space: normal;
}

.at {
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 8px;
}

.hint-row {
    display: flex;
    align-items: center;
}

.item-text {
    width: 24px;
    margin-right: 4px;
}

.dropdown-menu {
    background-color: v-bind(bgColor);
    filter: brightness(120%);
}

.dropdown-item {
    color: v-bind(textColor);
    display: flex;
    border-radius: 5px;
}

.dropdown-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: v-bind(textColor);
}

.dropdown-item.dropdown-active {
    background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-icon {
    max-width: 24px;
    height: 24px;
    margin-right: 4px;
    display: flex;
    justify-content: center;
}

.dropdown-toggle {
    padding-left: 6px;
    padding-right: 6px;
}

.btn-secondary {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.05) !important;
    border-style: none;
}

.dropdown-toggle:hover, .btn-secondary:hover {
    background-color: rgba(255, 255, 255, 0.15) !important;
}

.dropdown-toggle:active, .btn-secondary:active {
    background-color: rgba(255, 255, 255, 0.25) !important;
}

.dropdown-toggle, .dropdown-item {
    text-transform: capitalize;
}

.dropdown {
    padding-top: 8px;
}

.card-header {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, .05);
    padding-right: 8px;
    padding-top: 4px;
    padding-bottom: 4px;
}

.card-body {
    background-color: rgba(255, 255, 255, .01);
    border-radius: 0px 0px 5px 5px;
    padding: 8px;
    padding-top: 0px;
    max-height: 200px;
    overflow: scroll;
}

.card {
    border-width: 0px;
    border-radius: 5px 5px 5px 5px;
}

.header-icon {
    height: 16px;
}

#starIcon {
    padding-right: 12px;
}

#headerText {
    width: 100%;
}

.quicksetting {
    display: flex;
    align-items: center;
    padding-left: 0px;
    padding-right: 0px;
    box-sizing: content-box;
}

.quicksettings-input {
    margin-right: 4px;
    margin-top: 0px;
    margin-bottom: 0px;
    display: none;
}

.quicksettings-label {
    display: flex;
    width: 16px;
    box-sizing: content-box;
    padding: 4px;
    border-radius: 5px;
    border-style: solid;
    border-width: 3px;
    border-color: rgba(0, 0, 0, 0.2);
}

.quicksettings-label:hover {
    background-color: rgba(255, 255, 255, 0.075);
}

.quicksettings-label.active {
    background-color: #0d6efd;
}

.quicksettings-label.active:hover {
    background-color: #4daeff;
}

.quicksettings-label:active, .quicksettings-label.active:active {
    background-color: #7ddeff;
}
</style>