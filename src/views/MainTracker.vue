<script setup>
import DifficultyIcons from '@/components/DifficultyIcons.vue';
import NavBar from '@/components/NavBar.vue';
import QuickSettings from '@/components/Settings/QuickSettings.vue'
import MainMap from '@/components/Map/MainMap.vue'
import SettingsPane from '@/components/Settings/SettingsPane.vue';
import CheckList from '@/components/CheckList/CheckList.vue';
import OpenBroadcastView from '@/components/OpenBroadcastView.vue';
import VueTooltip from '@/components/Tooltips/VueTooltip.vue';
import VersionAlert from '@/components/VersionAlert.vue';
import SidebarAlert from '@/components/SidebarAlert.vue';
import HintPanel from '@/components/HintPanel.vue';
import FooterRow from '@/components/FooterRow.vue';
import AlertModal from '@/components/AlertModal.vue';
import { initGlobals, init } from '@/moduleWrappers.js';
import { computed, onMounted, ref } from 'vue';
import { useStateStore } from '@/stores/stateStore.js';
import { useTextTooltipStore } from '@/stores/textTooltipStore';
import { archipelagoInit } from '@/archipelago/client';
import { useRoute } from 'vue-router';
import { useAccessibilityStore } from '@/stores/accessibilityStore';

const state = useStateStore();
const accessibility = useAccessibilityStore();
const tip = useTextTooltipStore();
const route = useRoute();

const hostname = ref(null);
const version = ref(null);
const broadMode = ref('send');
const graphicsOptions = ref([]);
const argDescriptions = ref({});

const itemsPaddingLeft = computed(() => state.settings.swapItemsAndMap ? '12px' : '0');
const itemsPaddingRight = computed(() => state.settings.swapItemsAndMap ? '0' : '12px');

onMounted(() => {
  let url = `${import.meta.env.VITE_API_URL}/api/init`;

  if (Object.keys(route.query).length) {
    url = `${url}?${new URLSearchParams(route.query)}`;
  }

  fetch(url)
    .then(response => response.json())
    .then(data => {
      state.isLocal = data.local;
      state.ndiEnabled = Boolean(data.ndiEnabled);
      hostname.value = data.hostname;
      version.value = { version: data.versionDisplay ?? data.version, build: data.version };
      state.remoteVersion = data.remoteVersion;
      graphicsOptions.value = data.graphicsOptions;
      argDescriptions.value = data.flags;

      graphicsOptions.value.sort();

      initGlobals(data);
      archipelagoInit();
      init();
    });
});

</script>

<template>
<DifficultyIcons />

<div id="unstackedContainer" class="row" data-player="">
  <div id="unstackedMap" class="col-xs-12 col-md map-slot map-chunk">
    <div id="mapContainer">
      <MainMap :broadcast-mode="broadMode" />
    </div>
  </div>
  <div id="unstackedItems" class="col-xs col-md-auto quicksettings-container item-chunk">
    <div class="navbar-slot">
      <NavBar :is-local="state.isLocal" :version="version" :remote-version="state.remoteVersion" />
    </div>
    <div class="items-slot">
      <div id="itemContainer" class="pb-2"></div>
    </div>
    <div class="row mx-0">
      <div class="col-auto ps-0">
        <div id="hideHintsButton">
            <img :src="`/images/chevron-${state.settings.showHintPanel ? 'up' : 'down'}.svg`" class="invert close-button"
                @mouseenter="tip.tooltip(state.settings.showHintPanel ? 'Hide hints' : 'Show hints', $event)"
                @click="() => { state.settings.showHintPanel = !state.settings.showHintPanel; tip.clearTooltip(); }">
        </div>
      </div>
      <div class="col"></div>
      <div class="col-auto pe-0">
        <OpenBroadcastView type="items" />
      </div>
    </div>
    <VersionAlert :client-version="version" :remote-version="state.remoteVersion" :update-message="state.updateMessage" />
    <SidebarAlert :message="state.sidebarMessage" />
    <div id="unstackedHintWrapper">
      <HintPanel />
    </div>
    <div class="quicksettings-container quicksettings-slot">
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
      <div id="stackedHideHintsButton">
          <img :src="`/images/chevron-${state.settings.showHintPanel ? 'up' : 'down'}.svg`" class="invert close-button"
              @mouseenter="tip.tooltip(state.settings.showHintPanel ? 'Hide hints' : 'Show hints', $event)"
              @click="() => { state.settings.showHintPanel = !state.settings.showHintPanel; tip.clearTooltip(); }">
      </div>
    </div>
    <div id="stackedHintWrapper" class="col p-0 pt-2" :class="{'window-pad-right': state.settings.showHintPanel}">
      <HintPanel />
    </div>
    <div class="col-auto p-0">
      <VersionAlert :client-version="version" :remote-version="state.remoteVersion" :update-message="state.updateMessage" />
      <SidebarAlert :message="state.sidebarMessage" />
    </div>
    <div class="col-auto quicksettings-container quicksettings-slot">
    </div>
  </div>
</div>

<div class="row pb-4">
  <div id="checkList" class="col">
    <CheckList :check-accessibility="accessibility.checks" />
  </div>
</div>

<VueTooltip type="text" :text-color="state.settings.textColor" />
<VueTooltip type="node" :text-color="state.settings.textColor" />
<VueTooltip type="auxNode" :text-color="state.settings.textColor" />

<div id="settingsContainer">
  <SettingsPane v-if="state.settings.checkSize" :local="state.isLocal" :broadcast-mode="broadMode"
    :graphics-options="graphicsOptions"
    :argDescriptions="argDescriptions" />
</div>

<FooterRow :version="version" :hostname="hostname" />

<AlertModal />

<div class="form-check form-switch">
  <input class="form-check-input hidden" type="checkbox" checked id="lightSwitch" />
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

</template>

<style scoped>
#hideButton {
    align-content: center;
    cursor: pointer;
}

#hideHintsButton, #stackedHideHintsButton {
  cursor: pointer;
}

#stackedHideHintsButton {
  padding-top: 8px;
  margin-left: -4px;
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

.window-pad-right {
  padding-right: 12px !important;
}

#unstackedHintWrapper {
  padding-top: 8px;
}

#unstackedItems {
  padding-right: v-bind(itemsPaddingRight);
  padding-left: v-bind(itemsPaddingLeft);
}

</style>