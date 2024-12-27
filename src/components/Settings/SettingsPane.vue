<script setup>
import { getFile, importState, importLogicDiff, openExportStateDialog, resetUndoRedo, fixArgs, saveSettingsToStorage, applySettings, broadcastArgs, refreshItems, drawActiveTab } from '@/moduleWrappers.js';
import { getLayout } from '@/settingsLayout.js';
import { debounce } from '@/main';
import SettingsBlock from './SettingsBlock.vue';
import { computed, onMounted, ref, toRaw, watch } from 'vue';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { useStateStore } from '@/stores/stateStore';

const state = useStateStore();
const tip = useTextTooltipStore();
const props = defineProps({
    local: {
        type: Boolean,
        required: true,
    },
    broadcastMode: {
        type: String,
        required: true,
    },
    graphicsOptions: {
        required: true,
    },
    argDescriptions: {
        required: true,
    },
});

const stateInput = ref(null);
const logicDiffInput = ref(null);
const offcanvas = ref(null);
const graphicsDict = computed(() => {
    return props.graphicsOptions.reduce((acc, val) => {
            acc[`/${val}`] = val;
            return acc;
        }, { '': 'Default' });
})

const layout = computed(() => getLayout(settings.value.args, props.argDescriptions, settings.value.settings, graphicsDict, state));
const settingsItems = computed(() => layout.value.reduce((acc, item) => acc.concat(extractBindables(item)), []));
const settings = computed(() => {
    return { args: state.args, settings: state.settings };
});

onMounted(() => {
    offcanvas.value.addEventListener("hide.bs.offcanvas", function() {
        /*if(skipSettingsSave) {
            skipSettingsSave = false;
            console.log("skipping");
            return;
        }

        console.log("saving");*/
        // saveSettings();
        resetUndoRedo()
    });
});

watch(props, refresh);
watch(settings, refresh);

refreshSettingsItems(settings.value);

let skipPropWatch = false;
function refresh() {
    if (skipPropWatch) {
        skipPropWatch = false;
        return;
    }

    refreshSettingsItems(settings.value);
    saveSettings(settings.value);
}

function cloneSettings(obj) {
    return structuredClone({
        args: toRaw(obj.args),
        settings: toRaw(obj.settings),
    });
}

function extractBindables(item) {
    let items = [];

    for (const child of item.children) {
        if (child.settingName) {
            items.push(child);
        }
        else {
            items = items.concat(extractBindables(child));
        }
    }

    return items;
}

function refreshSettingsItems(obj) {
    for (const item of settingsItems.value) {
        item.refreshBind(obj);
    }
}

function updateCustomDungeonItems(args) {
    if (!args || args.dungeon_items == 'custom') {
        return;
    }

    let settings = {
        shuffle_small: false,
        shuffle_nightmare: false,
        shuffle_maps: false,
        shuffle_compasses: false,
        shuffle_beaks: false,
    }

    if (['smallkeys', 'keysanity', 'localnightmarekey'].includes(args.dungeon_items)) {
        settings.shuffle_small = true;
    }
    if (['nightmarekeys', 'keysanity'].includes(args.dungeon_items)) {
        settings.shuffle_nightmare = true;
    }
    if (['localkeys', 'keysanity', 'localnightmarekey'].includes(args.dungeon_items)) {
        settings.shuffle_maps = true;
        settings.shuffle_compasses = true;
        settings.shuffle_beaks = true;
    }

    for (const prop in settings) {
        if (args[prop] != settings[prop]) {
            skipPropWatch = true;
            args[prop] = settings[prop];
        }
    }
}

let lastSettings = null;
function saveSettings(settings) {
    let argsChanged = true;

    if (JSON.stringify(settings) === JSON.stringify(lastSettings)) {
        return;
    }

    if (lastSettings === null) {
        lastSettings = cloneSettings(settings);
        debounce(() => refreshItems(argsChanged), 500);
    }

    updateCustomDungeonItems(settings.args);
    fixArgs(settings.args);
    saveSettingsToStorage(settings.args, settings.settings);

    applySettings(lastSettings.args);

    window.skipNextAnimation = true;
    argsChanged = JSON.stringify(settings.args) != JSON.stringify(lastSettings.args);

    debounce(() => refreshItems(argsChanged), 500);

    if (!argsChanged) {
        debounce(drawActiveTab, 200);
    }

    if (props.broadcastMode == 'send') {
        if (broadcastArgs) {
            broadcastArgs();
        }
    }

    lastSettings = cloneSettings(settings);
}
</script>

<template>
    <div ref="offcanvas" class="offcanvas offcanvas-end magpie-colors" tabindex="-1" id="argsOffcanvas" aria-labelledby="argsLabel">
        <div class="offcanvas-header">
            <div class="row align-items-center">
                <div class="col">
                    <h2 class="offcanvas-title" id="argsLabel">Settings</h2>
                </div>
                <div class="col"></div>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"
                aria-label="Close">
            </button>
        </div>
        <div class="offcanvas-body">
            <template v-for="item in layout" :key="item">
                <SettingsBlock v-model="item.settingBind" :item="item" />
            </template>
            
            <div class="row justify-content-end pt-4">
                <div class="col-auto">
                    <input ref="logicDiffInput" type="file" accept=".json" class="hidden" id="logicDiffInput" @change="getFile($event.currentTarget, importLogicDiff);">
                    <button type="button" class="btn btn-secondary" @click="logicDiffInput.click();" @mouseenter="tip.tooltip('Import Logic Diff', $event)">
                        <img class="invert" src="/images/download.svg">
                    </button>
                </div>
                <div class="col">
                </div>
                <div class="col-auto">
                    <button type="button" class="btn btn-secondary me-2" @click="openExportStateDialog()" @mouseenter="tip.tooltip('Export Tracker State', $event)">
                        <img class="invert" src="/images/upload.svg">
                    </button>
                    <input ref="stateInput" type="file" accept=".json" class="hidden" id="stateInput" @change="getFile($event.currentTarget, importState);">
                    <button type="button" class="btn btn-secondary" @click="stateInput.click();" @mouseenter="tip.tooltip('Import Tracker State', $event)">
                        <img class="invert" src="/images/download.svg">
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>