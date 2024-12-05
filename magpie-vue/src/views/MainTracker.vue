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
import { initGlobals, init } from '@/moduleWrappers.js';
import { computed, onMounted, ref } from 'vue';
import { useStateStore } from '@/stores/stateStore.js';
import { useTextTooltipStore } from '@/stores/textTooltipStore';

const state = useStateStore();
const tip = useTextTooltipStore();

const hostname = ref(null);
const version = ref(null);
const broadMode = ref('send');
const graphicsOptions = ref([]);
const argDescriptions = ref({});

const itemsPaddingLeft = computed(() => state.settings.swapItemsAndMap ? '12px' : '0');
const itemsPaddingRight = computed(() => state.settings.swapItemsAndMap ? '0' : '12px');

onMounted(() => {
  fetch(import.meta.env.VITE_API_URL + '/api/init')
    .then(response => response.json())
    .then(data => {
      state.isLocal = data.local;
      hostname.value = data.hostname;
      version.value = data.version;
      state.remoteVersion = data.remoteVersion;
      graphicsOptions.value = data.graphicsOptions;
      argDescriptions.value = data.flags;

      graphicsOptions.value.sort();

      initGlobals(data);
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
      <div class="col"></div>
      <div class="col-auto">
        <OpenBroadcastView type="items" />
      </div>
    </div>
    <VersionAlert :client-version="version" :remote-version="state.remoteVersion" :update-message="state.updateMessage" />
    <SidebarAlert :message="state.sidebarMessage" />
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
      <VersionAlert :client-version="version" :remote-version="state.remoteVersion" :update-message="state.updateMessage" />
      <SidebarAlert :message="state.sidebarMessage" />
    </div>
    <div class="col-auto quicksettings-container quicksettings-slot">
    </div>
  </div>
</div>

<div class="row pb-4">
  <div id="checkList" class="col">
    <CheckList :logics="state.logics" :check-accessibility="state.checkAccessibility" />
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

<div class="pt-4"></div>
<div class="bottom-right row">
  <div class="col footer">
    <a href="https://github.com/kbranch/Magpie" target="_blank" @mouseover="tip.tooltip('Code, documentation and bug reports on GitHub', $event)"><img src="/images/github.svg" class="dimvert footer-image"></a>
    <a href="https://ladxr.daid.eu/" target="_blank" @mouseover="tip.tooltip('LADX Randomizer', $event)"><img src="/images/ladxr.png" class="footer-image dim"></a>
    <img id="discordIcon" src="/images/discord.svg" class="dimvert footer-image">
    <a href="https://discord.gg/QhAKagk84e" target="_blank" @mouseover="tip.tooltip('Zelda 4 Randomizer Discord invite', $event)"><img src="/images/z4r-discord.png" class="footer-image dim"></a>
    <a href="https://discord.gg/YYSXW2HvT4" target="_blank" @mouseover="tip.tooltip('Magpie Tracker Discord invite', $event)"><img src="/images/magpie-big.png" class="footer-image dim"></a>
    <span class="hidden">{{hostname}}</span>
  </div>

  <div class="col-auto pe-2">
    <div class="version">
      <span>Version: {{ version }}</span>
    </div>
  </div>

  <div class="col-auto ps-2 pe-0">
    <button type="button" class="btn btn-secondary" onclick="hardReset()">Hard reset state and settings</button>
  </div>
</div>

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

</template>

<style scoped>
#discordIcon {
  padding-left: 6px;
}

.bottom-right {
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  width: 100%;
  margin: 0px;
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 12px;

}

.footer-image {
  height: 24px;
  padding-right: 8px;
}

.footer {
  display: flex;
  align-items: end;
  padding-left: 0px;
}

#unstackedItems {
  padding-right: v-bind(itemsPaddingRight);
  padding-left: v-bind(itemsPaddingLeft);
}

</style>