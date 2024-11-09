<script setup>
import { initGlobals, init, win } from '@/moduleWrappers.js';
import { computed, onMounted, ref, toRaw } from 'vue';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import DifficultyIcons from '@/components/DifficultyIcons.vue';
import NavBar from '@/components/NavBar.vue';
import QuickSettings from '@/components/Settings/QuickSettings.vue'
import MainMap from '@/components/Map/MainMap.vue'
import SettingsPane from '@/components/Settings/SettingsPane.vue';
import CheckList from '@/components/CheckList/CheckList.vue';
import OpenBroadcastView from '@/components/OpenBroadcastView.vue';
import VueTooltip from '@/components/Tooltips/VueTooltip.vue';

const isLocal = ref(false);
const hostname = ref(null);
const version = ref(null);
const remoteVersion = ref(null);
const broadMode = ref('send');
const graphicsOptions = ref([]);

const logics = ref([]);
const checkAccessibility = ref([]);
const misc = ref({localSettings: {}, args: {}});
const argDescriptions = ref({});

const bgColor = computed(() => misc.value?.localSettings?.bgColor);
const textColor = computed(() => misc.value?.localSettings?.textColor);
const highlightColor = computed(() => misc.value?.localSettings?.highlightColor);

const tip = useTextTooltipStore();

onMounted(() => {
  fetch(import.meta.env.VITE_API_URL + '/vueInit')
    .then(response => response.json())
    .then(data => {
      isLocal.value = data.local;
      hostname.value = data.hostname;
      version.value = data.version;
      remoteVersion.value = data.remoteVersion;
      broadMode.value = data.broadcastMode;
      graphicsOptions.value = data.graphicsOptions;
      argDescriptions.value = data.flags;

      graphicsOptions.value.sort();

      initGlobals(data);
      init();
    });
});

function updateLogics(newLogics) {
  logics.value = newLogics;
}

function updateCheckAccessibility(accessibility) {
  checkAccessibility.value = accessibility;
}

function updateChecked(checked) {
  misc.value.checkedChecks = new Set(checked);
}

function updateCheckContents(contents) {
  misc.value.checkContents = contents;
  win.checkContents = misc.value.checkContents;
}

function updateSettings(settings) {
  misc.value.localSettings = settings;
  win.localSettings = misc.value.localSettings;
}

function updateArgs(args) {
  misc.value.args = args;
  win.args = misc.value.args;
}

function stripProxy(obj) {
  return toRaw(obj);
}

defineExpose({
  updateCheckAccessibility,
  updateLogics,
  updateChecked,
  updateCheckContents,
  updateSettings,
  updateArgs,
  stripProxy,
});
</script>

<template>
<div id="appWrapper" class="magpie-colors">
<div id="appInner">

  <DifficultyIcons />

  <div id="unstackedContainer" class="row" data-player="">
    <div id="unstackedMap" class="col-xs-12 col-md map-slot map-chunk">
      <div id="mapContainer">
        <MainMap :broadcast-mode="broadMode" :args="misc.args" :settings="misc.localSettings" />
      </div>
    </div>
    <div id="unstackedItems" class="col-xs col-md-auto quicksettings-container px-0 item-chunk">
      <div class="navbar-slot">
        <NavBar :is-local="isLocal" :settings="misc.localSettings" />
      </div>
      <div class="items-slot">
        <div id="itemContainer" class="pb-2"></div>
      </div>
      <div class="row">
        <div class="col"></div>
        <div class="col-auto">
          <OpenBroadcastView type="items" />
        </div>
      </div>
      <div class="quicksettings-container quicksettings-slot full-height">
        <QuickSettings v-model="misc.localSettings" />
      </div>
    </div>
  </div>
  <div id="stackedContainer" class="hidden" data-player="">
    <div class="row">
      <div class="col navbar-slot">
      </div>
    </div>
    <div id="stackedMap" class="row map-chunk">
      <div class="col map-slot">
      </div>
    </div>
    <div id="stackedItems" class="row item-chunk">
      <div class="col"></div>
      <div class="col-xs col-md-auto items-slot">
      </div>
      <div class="col-auto mt-2">
        <OpenBroadcastView type="items" />
      </div>
      <div class="col"></div>
      <div class="col-auto px-2_5 quicksettings-container quicksettings-slot">
      </div>
    </div>
  </div>

  <div class="row">
    <div id="checkList" class="col">
      <CheckList :logics="logics" :check-accessibility="checkAccessibility" :misc="misc" />
    </div>
  </div>

  <VueTooltip type="text" :text-color="misc.localSettings.textColor" />
  <VueTooltip type="node" :args="misc.args" :text-color="misc.localSettings.textColor" />
  <VueTooltip type="auxNode" :args="misc.args" :text-color="misc.localSettings.textColor" />

  <div id="settingsContainer">
    <SettingsPane v-if="misc.localSettings.checkSize" :local="isLocal" :broadcast-mode="broadMode"
      :graphics-options="graphicsOptions" :misc="misc"
      :argDescriptions="argDescriptions" />
  </div>

  <div class="row justify-content-end pt-4">
    <div class="col">
      <span class="hidden">{{hostname}}</span>
    </div>

    <div class="col-auto">
      <div class="version">
        <span>Version: {{ version }}</span>
      </div>
    </div>

    <div v-if="isLocal && version != remoteVersion && remoteVersion" class="col-auto">
      <div class="version">
        <span>Latest version: {{ remoteVersion }}</span>
        <a href="/fetchupdate" class="btn btn-secondary update-button ms-2" @mouseenter="tip.tooltip('Download update', $event)" role="button">
          <img src="/images/file-arrow-down.svg">
        </a>
      </div>
    </div>

    <div class="col-auto">
      <button type="button" class="btn btn-secondary" onclick="hardReset()">Hard reset state and settings</button>
    </div>
  </div>

  <div class="form-check form-switch">
    <input class="form-check-input hidden" type="checkbox" checked id="lightSwitch" />
  </div>

  <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h6 class="modal-title" id="errorModalLabel">Error</h6>
          <button id="modalClose" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <h5 id="errorModalMessage"></h5>
          <h6>Please report this error so it can be fixed!</h6>
          <div class="mb-3">
            <label for="errorEmail" class="form-label">Email address (optional)</label>
            <input type="email" class="form-control" id="errorEmail" placeholder="Optional">
          </div>

          <div>
            <div id="errorTextArea" name="editordata"></div>
          </div>

          <p>Error details:</p>
          <pre id="errorModalPayload"></pre>
        </div>
        <div class="modal-footer">
          <button id="sendErrorButton" type="button" class="btn btn-primary big-button" data-bs-dismiss="modal"
            onclick="sendError()">Send Bug Report</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="archipelagoModal" tabindex="-1" aria-labelledby="archipelagoModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-m">
      <div class="modal-content">
        <div class="modal-header">
          <h6 class="modal-title" id="archipelagoModalLabel">Refresh from Archipelago</h6>
          <button id="modalClose" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="apHostname" class="form-label">Server</label>
            <input type="text" class="form-control" id="apHostname">
          </div>
          <div class="mb-3">
            <label for="apSlotName" class="form-label">Slot name</label>
            <input type="text" class="form-control" id="apSlotName">
          </div>
          <div class="mb-3">
            <label for="apPassword" class="form-label">Password</label>
            <input type="password" class="form-control" id="apPassword">
          </div>
        </div>
        <div class="modal-footer">
          <button id="connectToApButton" type="button" class="btn btn-primary big-button" data-bs-dismiss="modal"
            onclick="refreshFromArchipelago(document.getElementById('apHostname').value, document.getElementById('apSlotName').value, document.getElementById('apPassword').value)">Connect</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="alertModal" tabindex="-1" aria-labelledby="alertModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-l">
      <div class="modal-content">
        <div class="modal-header">
          <h6 class="modal-title" id="alertModalLabel"></h6>
          <button id="alertModalClose" type="button" class="btn-close" data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <span id="alertBody"></span>
        </div>
        <div class="modal-footer">
          <button id="alertCloseButton" type="button" class="btn btn-primary big-button"
            data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="logicModal" tabindex="-1" aria-labelledby="logicModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-l">
      <div class="modal-content">
        <div class="modal-header">
          <h6 class="modal-title" id="logicModalLabel"></h6>
          <button id="logicModalClose" type="button" class="btn-close" data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <div class="modal-body" id="logicBody">
        </div>
        <div class="modal-footer">
          <div class="row justify-content-end big-button">
            <div class="col-auto">
              <button id="logicModalBackButton" type="button" class="btn btn-secondary"
                onclick="openLogicViewer(logicStack.pop(), false)"><span id="backNodeName"></span></button>
            </div>
            <div class="col"></div>
            <div class="col-auto">
              <button id="logicModalCloseButton" type="button" class="btn btn-primary"
                data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="exportModal" tabindex="-1" aria-labelledby="exportModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-m">
      <div class="modal-content">
        <div class="modal-header">
          <h6 class="modal-title" id="exportModalLabel">Export State</h6>
          <button id="exportModalClose" type="button" class="btn-close" data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="exportFilename" class="form-label">Base filename</label>
            <input type="text" class="form-control" id="exportFilename"
              onkeyup="if (event.keyCode == 13) { document.getElementById('exportCloseButton').click() }">
          </div>
          <div class="mb-3">
            <input type="checkbox" id="exportAddTime" class="form-check-input">
            <label class="form-check-label" for="exportAddTime">Append timestamp</label>
          </div>
          <div class="mb-3">
            <input type="checkbox" id="exportAddAp" class="form-check-input">
            <label class="form-check-label" for="exportAddAp">Include Archipelago settings</label>
          </div>
        </div>
        <div class="modal-footer">
          <button id="exportCloseButton" type="button" class="btn btn-primary big-button" data-bs-dismiss="modal"
            onclick="exportState(document.getElementById('exportFilename').value, document.getElementById('exportAddTime').checked, document.getElementById('exportAddAp').checked);">Export</button>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
</template>

<style>
.quicksettings-container {
    display: flex;
    flex-flow: column;
}

.full-height {
    height: 100%;
}

.magpie-colors, .bg-dark, .text-bg-dark, .accordion-button, .accordion-body, .accordion-button:not(.collapsed), tab-button.active, .tab-link {
  background-color: v-bind(bgColor) !important;
  color: v-bind(textColor) !important;
}

.owned-item-square:not(.secondary), .owned-item-square.highlight-owned-secondary {
  background-color: v-bind(highlightColor);
}

.owned-item-bar:not(.secondary) > img, .owned-item-bar.highlight-owned-secondary > img {
  border-bottom-color: v-bind(highlightColor) !important;
}

#appWrapper {
  height: 100%;
  display: flex;
  justify-content: center;
}

#appInner {
  max-width: 1500px;
  padding-left: 12px;
  padding-right: 12px;
}
</style>
