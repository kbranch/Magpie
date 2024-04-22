<script setup>
import { saveQuickSettings } from '@/moduleWrappers.js';
import { ref } from 'vue';

defineProps({
    smallQuicksettings: {
        type: Boolean,
        required: false,
        default: false,
    },
    settings: {
        required: true,
    },
});

const activeTabId = ref('quicksettingsTab');

function switchTabs(e) {
    activeTabId.value = e.currentTarget.id;
}
</script>

<template>
<div class="fill-box px-2_5 pt-1 item-width" id="quicksettings">
    <div class="tabs h-100">
        <div v-if="activeTabId == 'quicksettingsTab'" class="tab h-100">
            <div class="row h-100 align-items-end">
                <div class="col quicksettings-col">
                    <div class="row">
                        <div class="col-4 mb-4">
                            <input id="showOutOfLogicQuick" type="checkbox" :checked="settings?.showOutOfLogic" class="form-check-input" @change="saveQuickSettings()">
                            <label for="showOutOfLogicQuick" class="form-label" data-bs-toggle="tooltip" data-bs-title="Show out of logic"><svg class="quicksettings-icon align-middle"><use xlink:href="#difficulty-9"></use></svg></label>
                        </div>
                        <div class="col-4 mb-4">
                            <input id="showHigherLogicQuick" type="checkbox" :checked="settings?.showHigherLogic" class="form-check-input" @change="saveQuickSettings()">
                            <label for="showHigherLogicQuick" class="form-label" data-bs-toggle="tooltip" data-bs-title="Show higher logic levels"><img src="/images/higher-logic.svg" class="quicksettings-icon align-middle"></label>
                        </div>
                        <div class="col-4 mb-4">
                            <input id="showCheckedQuick" type="checkbox" :checked="settings?.showChecked" class="form-check-input" @change="saveQuickSettings()">
                            <label for="showCheckedQuick" class="form-label" data-bs-toggle="tooltip" data-bs-title="Show checked locations"><svg class="quicksettings-icon align-middle"><use xlink:href="#difficulty-checked"></use></svg></label>
                        </div>
                        <div class="col-3 pe-1 mb-4">
                            <input id="showVanillaQuick" type="checkbox" :checked="settings?.showVanilla" class="form-check-input" @change="saveQuickSettings()">
                            <label for="showVanillaQuick" class="form-label" data-bs-toggle="tooltip" data-bs-title="Show vanilla checks"><svg class="quicksettings-icon align-middle"><use xlink:href="#difficulty-0-vanilla"></use></svg></label>
                        </div>
                        <div class="col-3 px-1 mb-4">
                            <input id="showOwnedQuick" type="checkbox" :checked="settings?.showOwnedPickups" class="form-check-input" @change="saveQuickSettings()">
                            <label for="showOwnedQuick" class="form-label" data-bs-toggle="tooltip" data-bs-title="Show owned vanilla pickups">
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
                        <div class="col-3 px-1 mb-4">
                            <input id="showVanillaEntrancesQuick" type="checkbox" :checked="settings?.showVanillaEntrances" class="form-check-input" @change="saveQuickSettings()">
                            <label for="showVanillaEntrancesQuick" class="form-label" data-bs-toggle="tooltip" data-bs-title="Show vanilla entrances and dungeon stairs"><img class="quicksettings-icon align-middle" src="/images/vanilla-entrance.svg"></label>
                        </div>
                        <div class="col-3 ps-1 mb-4">
                            <input id="showLogicHintsQuick" type="checkbox" :checked="settings?.showLogicHints" class="form-check-input" @change="saveQuickSettings()">
                            <label for="showLogicHintsQuick" class="form-label" data-bs-toggle="tooltip" data-bs-title="Show logic hints"><img class="quicksettings-icon align-middle" src="/images/logicHints.svg"></label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template v-if="!smallQuicksettings">
            <div v-if="activeTabId == 'autotrackerTab'" class="tab h-100">
                <div class="row h-100 justify-content-center align-items-end">
                    <div class="col">
                        <div class="row py-2 hidden" id="romRow">
                            <div class="col even-col">
                                <label for="romInput" class="form-label">Select ROM File <img class="invert" src="/images/question-circle.svg" data-bs-toggle="tooltip" data-bs-custom-class="secondary-tooltip" data-bs-title="The autotracker requires a copy of the ROM file before entrances can be tracked"></label>
                                <input type="file" accept=".gbc" class="hidden" id="romInput" onchange="loadRom(this)" />
                                <input type="button" id="romButton" class="btn btn-secondary" value="Browse..." onclick="document.getElementById('romInput').click();" />
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <textarea id="autotrackerMessages" readonly></textarea>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-auto">
                                <input id="enableAutotracking" type="checkbox" :checked="settings?.enableAutotracking" class="form-check-input" @change="saveQuickSettings()">
                                <label for="enableAutotracking" class="form-label">Enable Autotracker</label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-3 px-1">
                                <button class="btn btn-secondary autotracker-button" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-title="Reload items from autotracker" onclick="loadFromAutotracker()" type="button">
                                    <img src="/images/arrow-clockwise.svg" class="autotracker-button-icon">
                                </button>
                            </div>
                            <div class="col-3 px-1">
                                <button class="btn btn-secondary autotracker-button" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-title="Refresh from Archipelago" onclick="showArchipelagoModal()" type="button">
                                    <img src="/images/archipelago-icon.svg" class="autotracker-button-icon">
                                </button>
                            </div>
                            <div class="col-3 px-1">
                                <a href="https://magpietracker.us/static/builds/magpie-autotracker.exe" class="btn btn-secondary autotracker-button" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-title="Download Windows autotracker" role="button">
                                    <img src="/images/windows.svg" class="autotracker-button-icon">
                                </a>
                            </div>
                            <div class="col-3 px-1">
                                <a href="https://magpietracker.us/static/builds/magpie-autotracker-linux" class="btn btn-secondary autotracker-button" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-title="Download Linux autotracker" role="button">
                                    <img src="/images/tux.svg" class="autotracker-button-icon">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="activeTabId == 'spoilersTab'" class="tab h-100">
                <div class="row h-100 align-items-end">
                    <div class="col rom-col">
                        <div class="row">
                            <div class="col">
                                <p id="spoilerSeed"></p>
                            </div>
                        </div>
                        <div class="row pb-2">
                            <div class="col">
                                <input type="button" id="spoilAllButton" class="btn btn-secondary hidden" value="Spoil Everything" onclick="spoilAll();" />
                            </div>
                            <div class="col-auto">
                                <input type="button" id="clearSpoilersButton" class="btn btn-secondary" value="Clear" onclick="resetCheckContents();drawActiveTab();" />
                            </div>
                        </div>
                        <div class="row">
                            <div class="col even-col">
                                <label for="spoilerInput" class="form-label pe-2">Select Spoiler File <img class="invert" src="/images/question-circle.svg" data-bs-toggle="tooltip" data-bs-custom-class="secondary-tooltip" data-bs-title="Select either a JSON spoiler log file or a ROM file"></label>
                                <input type="file" accept=".json,.gbc" class="hidden" id="spoilerInput" onchange="loadLogFile(this)" />
                                <input type="button" class="btn btn-secondary spoiler-browse" value="Browse..." onclick="document.getElementById('spoilerInput').click();" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="activeTabId == 'plandoTab'" class="tab h-100" id="plandoTabContent">
                <div class="row h-100 align-items-end">
                    <div class="col rom-col">
                        <input type="button" id="plandoButton" class="btn btn-secondary" value="Export as Plan" onclick="exportPlando()" />
                    </div>
                </div>
            </div>

            <div v-if="activeTabId == 'downloadsTab'" class="tab h-100">
                <div class="row h-100 align-items-end">
                    <div class="col rom-col">
                        <h6 class="mb-0">Offline version</h6>
                        <ul class="mb-1">
                            <li><a href="https://magpietracker.us/static/builds/magpie-local.zip">Windows</a>, <a href="https://magpietracker.us/static/builds/magpie-local-linux.zip">Linux</a></li>
                            <li><a href="https://magpietracker.us/static/builds/magpie-source.zip">Source bundle</a></li>
                        </ul>

                        <h6 class="mb-0">Autotracker</h6>
                        <ul class="mb-1">
                            <li><a href="https://magpietracker.us/static/builds/magpie-autotracker.exe">Windows</a>, <a href="https://magpietracker.us/static/builds/magpie-autotracker-linux">Linux</a></li>
                        </ul>

                        <h6 class="mb-0">Compatible emulators</h6>
                        <ul class="mb-0">
                            <li><a href="https://bgb.bircd.org/#downloads">BGB</a> (Windows, others via Wine)</li>
                            <li>
                                <a href="https://tasvideos.org/BizHawk">Bizhawk</a> (cross platform)
                                <ul>
                                    <li>Use <a href="https://magpietracker.us/static/bizhawk-ladxr.zip">this LUA script</a>, from <a href="https://github.com/ArchipelagoMW/Archipelago">Archipelago</a></li>
                                </ul>
                            </li>
                            <li>
                                <a href="https://www.retroarch.com/?page=platforms">Retroarch</a> (cross platform)
                                <ul>
                                    <li>Must <a href="https://docs.libretro.com/development/retroarch/network-control-interface/">enable networking</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </template>
    </div>
</div>

<ul v-if="!smallQuicksettings" class="nav px-2_5">
    <li :class="['quicktab-button', activeTabId == 'quicksettingsTab' ? 'active' : null]" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Quick Settings" data-bs-trigger="hover">
        <button class="btn quicktab-link" id="quicksettingsTab" type="button" @click="switchTabs($event)"><img class="quicksetting-icon" src="/images/ui-checks.svg"></button>
    </li>
    <li :class="['quicktab-button', activeTabId == 'autotrackerTab' ? 'active' : null]" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Autotracking" data-bs-trigger="hover">
        <button class="btn quicktab-link" id="autotrackerTab" type="button" @click="switchTabs($event)"><img class="quicksetting-icon" src="/images/cpu.svg"></button>
    </li>
    <li :class="['quicktab-button', activeTabId == 'spoilersTab' ? 'active' : null]" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Spoilers" data-bs-trigger="hover">
        <button class="btn quicktab-link" id="spoilersTab" type="button" @click="switchTabs($event)"><img class="quicksetting-icon" src="/images/eye.svg"></button>
    </li>
    <li :class="['quicktab-button', activeTabId == 'plandoTab' ? 'active' : null]" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Plandomizer" data-bs-trigger="hover">
        <button class="btn quicktab-link" id="plandoTab" type="button" @click="switchTabs($event)"><img class="quicksetting-icon" src="/images/gift.svg"></button>
    </li>
    <li :class="['quicktab-button', activeTabId == 'downloadsTab' ? 'active' : null]" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Downloads" data-bs-trigger="hover">
        <button class="btn quicktab-link" id="downloadsTab" type="button" @click="switchTabs($event)"><img class="quicksetting-icon" src="/images/file-arrow-down.svg"></button>
    </li>
</ul>
</template>

<style scoped>
.quicktab-button.active .quicktab-link {
    border-color: #fff;
    color: #fff;
    /* background-color: #6c757d; */
}

.quicktab-button:not(.active) .quicktab-link:hover {
    border-color: #ccc;
}

.quicktab-link {
    border-radius: 0px 0px 5px 5px;
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
</style>