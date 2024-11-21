<script setup>
import { initGlobals, init, win } from '@/moduleWrappers.js';
import { computed, onMounted, ref, toRaw } from 'vue';
import DifficultyIcons from '@/components/DifficultyIcons.vue';
import NavBar from '@/components/NavBar.vue';
import QuickSettings from '@/components/Settings/QuickSettings.vue'
import MainMap from '@/components/Map/MainMap.vue'
import SettingsPane from '@/components/Settings/SettingsPane.vue';
import CheckList from '@/components/CheckList/CheckList.vue';
import OpenBroadcastView from '@/components/OpenBroadcastView.vue';
import VueTooltip from '@/components/Tooltips/VueTooltip.vue';
import VersionAlert from './components/VersionAlert.vue';
import SidebarAlert from './components/SidebarAlert.vue';
import { useStateStore } from '@/stores/stateStore.js';

const state = useStateStore();

const isLocal = ref(false);
const hostname = ref(null);
const version = ref(null);
const remoteVersion = ref(null);
const broadMode = ref('send');
const graphicsOptions = ref([]);
const updateMessage = ref(null);
const sidebarMessage = ref(null);

const logics = ref([]);
const checkAccessibility = ref([]);
const argDescriptions = ref({});

const bgColor = computed(() => state.settings.bgColor);
const textColor = computed(() => state.settings.textColor);
const highlightColor = computed(() => state.settings.highlightColor);

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
  state.checkedChecks = new Set(checked);
}

function updateCheckContents(contents) {
  state.checkContents = contents;
  win.checkContents = state.checkContents;
}

function updateSettings(settings) {
  state.settings = settings;
  win.localSettings = state.settings;
}

function updateArgs(args) {
  state.args = args;
  win.args = state.args;
}

function stripProxy(obj) {
  return toRaw(obj);
}

function updateServerVersion(newVersion, message=null) {
  if (!isLocal.value) {
    remoteVersion.value = newVersion;
    updateMessage.value = message;
  }
}

function updateSidebarMessage(message) {
  sidebarMessage.value = message;
}

defineExpose({
  updateCheckAccessibility,
  updateLogics,
  updateChecked,
  updateCheckContents,
  updateSettings,
  updateArgs,
  stripProxy,
  updateServerVersion,
  updateSidebarMessage,
});
</script>

<template>
<div id="appWrapper" class="magpie-colors">
<div id="appInner">

  <DifficultyIcons />

  <div id="unstackedContainer" class="row" data-player="">
    <div id="unstackedMap" class="col-xs-12 col-md map-slot map-chunk">
      <div id="mapContainer">
        <MainMap :broadcast-mode="broadMode" />
      </div>
    </div>
    <div id="unstackedItems" class="col-xs col-md-auto quicksettings-container px-0 item-chunk">
      <div class="navbar-slot">
        <NavBar :is-local="isLocal" :version="version" :remote-version="remoteVersion" />
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
      <VersionAlert :client-version="version" :remote-version="remoteVersion" :update-message="updateMessage" />
      <SidebarAlert :message="sidebarMessage" />
      <div class="quicksettings-container quicksettings-slot full-height">
        <QuickSettings />
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
      <div class="col p-0"></div>
      <div class="col-xs col-md-auto items-slot px-0">
      </div>
      <div class="col-auto mt-2">
        <OpenBroadcastView type="items" />
      </div>
      <div class="col p-0">
        <VersionAlert :client-version="version" :remote-version="remoteVersion" :update-message="updateMessage" />
        <SidebarAlert :message="sidebarMessage" />
      </div>
      <div class="col-auto px-0 quicksettings-container quicksettings-slot">
      </div>
    </div>
  </div>

  <div class="row">
    <div id="checkList" class="col">
      <CheckList :logics="logics" :check-accessibility="checkAccessibility" />
    </div>
  </div>

  <VueTooltip type="text" :text-color="state.settings.textColor" />
  <VueTooltip type="node" :text-color="state.settings.textColor" />
  <VueTooltip type="auxNode" :text-color="state.settings.textColor" />

  <div id="settingsContainer">
    <SettingsPane v-if="state.settings.checkSize" :local="isLocal" :broadcast-mode="broadMode"
      :graphics-options="graphicsOptions"
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
  width: 100%;
  padding-left: 12px;
  padding-right: 12px;
}
</style>
