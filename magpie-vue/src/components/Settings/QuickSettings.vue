<script setup>
import { saveQuickSettings, download, sortByKey } from '@/moduleWrappers.js';
import { ref, watch } from 'vue';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { useStateStore } from '@/stores/stateStore';

const state = useStateStore();
const tip = useTextTooltipStore();

defineProps({
    smallQuicksettings: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const activeTabId = ref('quicksettingsTab');
const autotrackerLog = ref('');
const romRequested = ref(false);
const romInput = ref(null);

watch(romRequested, (newValue) => {
    if (newValue) {
        activeTabId.value = 'autotrackerTab';

        if (romInput.value) {
            romInput.value.value = null;
        }
    }
});

function addAutotrackerMessage(status) {
    // I cannot believe the state of vanilla javascript date formatting
    let now = new Date();
    let hours = now.getHours().toString(10).padStart(2, '0');
    let minutes = now.getMinutes().toString(10).padStart(2, '0');
    let seconds = now.getSeconds().toString(10).padStart(2, '0');

    autotrackerLog.value = `${hours}:${minutes}:${seconds}: ${status}\n${autotrackerLog.value}`;
}

function setRomRequested(value) {
    romRequested.value = value;
}

function switchTabs(e) {
    activeTabId.value = e.currentTarget.id;
}

function downloadSpoilerLog() {
    state.spoilerLog.accessibleItems = sortByKey(state.spoilerLog.accessibleItems, x => [x.sphere, x.area])
    download(`spoilerLog-${state.spoilerLog.seed}.json`, JSON.stringify(state.spoilerLog, null, 2));
}

window.addAutotrackerMessage = addAutotrackerMessage;
window.setRomRequested = setRomRequested;
</script>

<template>
<ul v-if="!smallQuicksettings" id="quickTabs" class="nav pt-2">
    <li :class="['quicktab-button', 'me-1', activeTabId == 'quicksettingsTab' ? 'active' : null]" @mouseenter="tip.tooltip('Quick Settings', $event)">
        <button class="btn quicktab-link" id="quicksettingsTab" type="button" @click="switchTabs($event)">
            <img class="quicksetting-icon" src="/images/ui-checks.svg">
        </button>
    </li>
    <li :class="['quicktab-button', 'me-1', activeTabId == 'autotrackerTab' ? 'active' : null]" @mouseenter="tip.tooltip('Autotracking', $event)">
        <button class="btn quicktab-link" id="autotrackerTab" type="button" @click="switchTabs($event)">
            <img class="quicksetting-icon" src="/images/cpu.svg">
        </button>
    </li>
    <li :class="['quicktab-button', 'me-1', activeTabId == 'spoilersTab' ? 'active' : null]" @mouseenter="tip.tooltip('Spoilers', $event)">
        <button class="btn quicktab-link" id="spoilersTab" type="button" @click="switchTabs($event)">
            <img class="quicksetting-icon" src="/images/eye.svg">
        </button>
    </li>
    <li :class="['quicktab-button', 'me-1', activeTabId == 'plandoTab' ? 'active' : null]" @mouseenter="tip.tooltip('Plandomizer', $event)">
        <button class="btn quicktab-link" id="plandoTab" type="button" @click="switchTabs($event)">
            <img class="quicksetting-icon" src="/images/gift.svg">
        </button>
    </li>
    <li :class="['quicktab-button', activeTabId == 'downloadsTab' ? 'active' : null]" @mouseenter="tip.tooltip('Downloads', $event)">
        <button class="btn quicktab-link" id="downloadsTab" type="button" @click="switchTabs($event)">
            <img class="quicksetting-icon" src="/images/file-arrow-down.svg">
        </button>
    </li>
</ul>

<div class="fill-box px-2_5 pt-1 item-width" id="quicksettings">
    <div class="tabs">
        <div v-if="activeTabId == 'quicksettingsTab'" class="tab h-100">
            <div class="row h-100 align-items-end">
                <div class="col quicksettings-col quick-bg">
                    <div class="row pt-2 quicksettings-row">
                        <div class="col-auto mb-4 quicksetting">
                            <input id="showOutOfLogicQuick" type="checkbox" v-model="state.settings.showOutOfLogic" class="form-check-input quicksettings-input" @change="saveQuickSettings()">
                            <label for="showOutOfLogicQuick" class="quicksettings-label" @mouseenter="tip.tooltip('Show out of logic', $event)">
                                <svg class="quicksettings-icon align-middle">
                                    <use xlink:href="#difficulty-9"></use>
                                </svg>
                            </label>
                        </div>
                        <div id="higherLogicQuicksetting" class="col-auto mb-4 quicksetting">
                            <input id="showHigherLogicQuick" type="checkbox" v-model="state.settings.showHigherLogic" class="form-check-input quicksettings-input" @change="saveQuickSettings()">
                            <label for="showHigherLogicQuick" class="quicksettings-label" @mouseenter="tip.tooltip('Show higher logic levels', $event)">
                                <img src="/images/higher-logic.svg" class="quicksettings-icon align-middle">
                            </label>
                        </div>
                        <div id="checkedQuicksetting" class="col-auto mb-4 quicksetting">
                            <input id="showCheckedQuick" type="checkbox" v-model="state.settings.showChecked" class="form-check-input quicksettings-input" @change="saveQuickSettings()">
                            <label for="showCheckedQuick" class="quicksettings-label" @mouseenter="tip.tooltip('Show checked locations', $event)">
                                <svg class="quicksettings-icon align-middle">
                                    <use xlink:href="#difficulty-checked"></use>
                                </svg>
                            </label>
                        </div>
                    </div>
                    <div class="row quicksettings-row">
                        <div class="col-auto mb-0 quicksetting">
                            <input id="showVanillaQuick" type="checkbox" v-model="state.settings.showVanilla" class="form-check-input quicksettings-input" @change="saveQuickSettings()">
                            <label for="showVanillaQuick" class="quicksettings-label" @mouseenter="tip.tooltip('Show vanilla checks', $event)">
                                <svg class="quicksettings-icon align-middle">
                                    <use xlink:href="#difficulty-0-vanilla"></use>
                                </svg>
                            </label>
                        </div>
                        <div class="col-auto mb-0 quicksetting">
                            <input id="showOwnedQuick" type="checkbox" v-model="state.settings.showOwnedPickups" class="form-check-input quicksettings-input" @change="saveQuickSettings()">
                            <label for="showOwnedQuick" class="quicksettings-label" @mouseenter="tip.tooltip('Show owned vanilla pickups', $event)">
                                <div class="row ms-0 px-0">
                                    <div class="col-auto px-0">
                                        <div class="quicksettings-wrapper">
                                            <div class="node-overlay-wrapper">
                                                <div class="icon-wrapper behind-tracker">
                                                    <div class="behind-tracker-overlay"></div>
                                                    <svg class="icon" style="width: 100%; height: 100%;">
                                                        <use xlink:href="#difficulty-0-vanilla"></use>
                                                    </svg>
                                                    <svg class="icon hollow" style="width: 100%; height: 100%;">
                                                        <use xlink:href="#difficulty-0-hollow"></use>
                                                    </svg>
                                                    <img src="/images/MAGIC_POWDER_1.png" class="node-item-overlay" data-node-item="MAGIC_POWDER" onmousedown="preventDoubleClick(event)">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                        <div class="col-auto mb-0 quicksetting">
                            <input id="showVanillaEntrancesQuick" type="checkbox" v-model="state.settings.showVanillaEntrances" class="form-check-input quicksettings-input" @change="saveQuickSettings()">
                            <label for="showVanillaEntrancesQuick" class="quicksettings-label" @mouseenter="tip.tooltip('Show vanilla entrances and dungeon stairs', $event)">
                                <img class="quicksettings-icon align-middle" src="/images/vanilla-entrance.svg">
                            </label>
                        </div>
                        <div class="col-auto mb-0 quicksetting">
                            <input id="showLogicHintsQuick" type="checkbox" v-model="state.settings.showLogicHints" class="form-check-input quicksettings-input" @change="saveQuickSettings()">
                            <label for="showLogicHintsQuick" class="quicksettings-label" @mouseenter="tip.tooltip('Show logic hints', $event)">
                                <img class="quicksettings-icon align-middle" src="/images/logicHints.svg">
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template v-if="!smallQuicksettings">
            <div v-if="activeTabId == 'autotrackerTab'" class="tab h-100">
                <div class="row h-100 justify-content-center align-items-end">
                    <div class="col quick-bg">
                        <div v-if="romRequested" class="row py-2 animate__animated animate__flash" id="romRow">
                            <div class="col even-col">
                                <label for="romInput" class="form-label">
                                    Select ROM File
                                    <img class="invert" src="/images/question-circle.svg" 
                                        @mouseenter="tip.tooltip('The autotracker requires a copy of the ROM file before entrances can be tracked', $event)">
                                </label>
                                <input type="file" accept=".gbc" class="hidden" id="romInput" ref="romInput" onchange="loadRom(this)" />
                                <input type="button" id="romButton" class="btn btn-secondary" value="Browse..." onclick="document.getElementById('romInput').click();" />
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <textarea id="autotrackerMessages" readonly v-model="autotrackerLog"></textarea>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-auto">
                                <input id="enableAutotracking" type="checkbox" v-model="state.settings.enableAutotracking" class="form-check-input" @change="saveQuickSettings()">
                                <label for="enableAutotracking" class="form-label">Enable Autotracker</label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-3 px-1">
                                <button class="btn btn-secondary autotracker-button" @mouseenter="tip.tooltip('Reload items from autotracker', $event)" onclick="loadFromAutotracker()" type="button">
                                    <img src="/images/arrow-clockwise.svg" class="autotracker-button-icon">
                                </button>
                            </div>
                            <div class="col-3 px-1">
                                <button class="btn btn-secondary autotracker-button" @mouseenter="tip.tooltip('Refresh from Archipelago', $event)" onclick="showArchipelagoModal()" type="button">
                                    <img src="/images/archipelago-icon.svg" class="autotracker-button-icon">
                                </button>
                            </div>
                            <div class="col-3 px-1">
                                <a href="https://magpietracker.us/static/builds/magpie-autotracker.exe"
                                    class="btn btn-secondary autotracker-button" @mouseenter="tip.tooltip('Download Windows autotracker', $event)" role="button">
                                    <img src="/images/windows.svg" class="autotracker-button-icon">
                                </a>
                            </div>
                            <div class="col-3 px-1">
                                <a href="https://magpietracker.us/static/builds/magpie-autotracker-linux"
                                    class="btn btn-secondary autotracker-button" @mouseenter="tip.tooltip('Download Linux autotracker', $event)" role="button">
                                    <img src="/images/tux.svg" class="autotracker-button-icon">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="activeTabId == 'spoilersTab'" class="tab h-100">
                <div class="row h-100 align-items-end">
                    <div class="col rom-col quick-bg">
                        <div class="row">
                            <div class="col">
                                <p id="spoilerSeed"></p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col pb-2 pe-0">
                                <input type="button" id="spoilAllButton" class="btn btn-secondary hidden" value="Spoil Everything" onclick="spoilAll();" />
                            </div>
                            <div v-if="state.spoilerLog?.seed" class="col-auto pb-2 px-2">
                                <button type="button" class="btn btn-secondary" @click="downloadSpoilerLog" @mouseenter="tip.tooltip('Download spoiler log', $event)">
                                    <img class="invert" src="/images/download.svg">
                                </button>
                            </div>
                            <div class="col-auto pb-2 px-0">
                                <input type="button" id="clearSpoilersButton" class="btn btn-secondary" value="Clear" onclick="resetCheckContents();drawActiveTab();" />
                            </div>
                        </div>
                        <div class="row">
                            <div id="spoilerFileLabel" class="col">
                                <label for="spoilerInput" class="form-label pe-2">
                                    Select Spoiler File
                                    <img class="invert" src="/images/question-circle.svg" @mouseenter="tip.tooltip('Select either a JSON spoiler log file or a ROM file', $event)">
                                </label>
                            </div>
                            <div class="col-auto px-0">
                                <input type="file" accept=".json,.gbc" class="hidden" id="spoilerInput" onchange="loadLogFile(this)" />
                                <input type="button" class="btn btn-secondary spoiler-browse" value="Browse..." onclick="document.getElementById('spoilerInput').click();" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="activeTabId == 'plandoTab'" class="tab h-100" id="plandoTabContent">
                <div class="row h-100 align-items-end">
                    <div class="col rom-col quick-bg">
                        <input type="button" id="plandoButton" class="btn btn-secondary mt-2" value="Export as Plan"
                            onclick="exportPlando()" />
                    </div>
                </div>
            </div>

            <div v-if="activeTabId == 'downloadsTab'" class="tab h-100">
                <div class="row h-100 align-items-end">
                    <div class="col rom-col quick-bg">
                        <h6 class="mb-0">Offline version</h6>
                        <ul class="mb-1">
                            <li><a href="https://magpietracker.us/static/builds/magpie-local.zip">Windows</a>, <a
                                    href="https://magpietracker.us/static/builds/magpie-local-linux.zip">Linux</a>
                            </li>
                            <li><a href="https://magpietracker.us/static/builds/magpie-source.zip">Source bundle</a>
                            </li>
                        </ul>

                        <h6 class="mb-0">Autotracker</h6>
                        <ul class="mb-1">
                            <li><a href="https://magpietracker.us/static/builds/magpie-autotracker.exe">Windows</a>,
                                <a href="https://magpietracker.us/static/builds/magpie-autotracker-linux">Linux</a>
                            </li>
                        </ul>

                        <h6 class="mb-0">Compatible emulators</h6>
                        <ul class="mb-0">
                            <li><a href="https://bgb.bircd.org/#downloads">BGB</a> (Windows, others via Wine)</li>
                            <li>
                                <a href="https://tasvideos.org/BizHawk">Bizhawk</a> (cross platform)
                                <ul>
                                    <li>Use <a href="https://magpietracker.us/static/bizhawk-ladxr.zip">this LUA
                                            script</a>, from <a
                                            href="https://github.com/ArchipelagoMW/Archipelago">Archipelago</a></li>
                                </ul>
                            </li>
                            <li>
                                <a href="https://www.retroarch.com/?page=platforms">Retroarch</a> (cross platform)
                                <ul>
                                    <li>Must <a
                                            href="https://docs.libretro.com/development/retroarch/network-control-interface/">enable
                                            networking</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </template>
    </div>
</div>
</template>

<style scoped>
#quickTabs {
    justify-content: center;
}

.quicksettings-row {
    justify-content: space-between;
    padding-left: 12px;
    padding-right: 12px;
}

.quicksetting {
    display: flex;
    align-items: center;
    padding-left: 0px;
    padding-right: 0px;
}

.quicksettings-input {
    margin-right: 4px;
    margin-top: 0px;
    margin-bottom: 0px;
}

.quicksettings-label {
    width: 32px;
}

.quicktab-button.active .quicktab-link {
    color: #fff;
    border-bottom: 3px;
    border-bottom-color: rgba(255, 255, 255, 0.3);
    border-bottom-style: solid;
}

.quicktab-button:not(.active) .quicktab-link:hover {
    background-color: rgba(255, 255, 255, 0.075) !important;
}

.quicktab-button {
    border-radius: 5px 5px 0px 0px;
    background-color: rgba(255, 255, 255, 0.05) !important;
}

.quick-bg {
    /* background-color: rgba(255, 255, 255, 0.03) !important; */
    padding-bottom: 16px;
    padding-top: 8px;
    border-radius: 5px;
}

.quicktab-link {
    border-radius: 5px 5px 0px 0px;
}

.quicktab-link {
    border-color: transparent;
    padding: 9px 16px 8px 16px;
    border-width: 0px 1px 1px 1px;
    color: #ccc;
}

.quicktab-button .quicksetting-icon {
    filter: invert(1);
    width: 16px;
    height: 16px;
}

.autotracker-button {
    width: 100%;
}

.autotracker-button-icon {
    height: 16px;
}

.quicksettings-col {
    width: 290px;
}

.quicksettings-image {
    max-width: 32px;
    max-height: 32px;
    margin-right: 0.25em;
}

.quicksettings-icon {
    position: relative;
    width: 32px;
    height: 32px;
    text-align: center;
    float: left;
}

.quicksettings-wrapper {
    position: relative;
    width: 32px;
    height: 32px;
}

#spoilerFileLabel {
    display: flex;
    align-items: end;
    justify-content: end;
}
</style>