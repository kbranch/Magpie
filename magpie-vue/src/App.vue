<script setup>
import { onMounted, ref } from 'vue';
import DifficultyIcons from './components/DifficultyIcons.vue';
import NavBar from './components/NavBar.vue';
import QuickSettings from './components/QuickSettings.vue'
import MainMap from './components/MainMap.vue'
import SettingsPane from './components/SettingsPane.vue';

const isLocal = ref(false);
const hostname = ref(null);
const version = ref(null);
const remoteVersion = ref(null);
const broadMode = ref('send');
const graphicsOptions = ref([]);

addCssLink("/lib/bootstrap/css/bootstrap.min.css");
addCssLink("/lib/summernote/summernote-lite.css");
addCssLink("/css/icons.css", "iconsSheet");
addCssLink("/css/theme.css", "themeSheet");
addCssLink("/css/site.css");

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

      initGlobals(data);
      init();
    });
});

function addCssLink(href, id='') {
  var link = document.createElement("link");
  link.href = href;
  link.id = id;
  link.type = "text/css";
  link.rel = "stylesheet";

  document.getElementsByTagName("head")[0].appendChild(link);
}

function initGlobals(data) {
  defaultArgs = data.args;
  defaultSettings = data.defaultSettings;
  settingsOverrides = data.jsonSettingsOverrides;
  argsOverrides = data.jsonArgsOverrides;
  diskSettings = data.diskSettings;

  iconStyles = $('link#iconsSheet')[0].sheet;
  themeStyles = $('link#themeSheet')[0].sheet;

  local = data.local == 'True';
  allowAutotracking = data.allowAutotracking == 'True';
  allowMap = data.allowMap == 'True';
  refreshMap = !(data.refreshMap == 'False');
  allowItems = data.allowItems == 'True';
  keepQueryArgs = data.keepQueryArgs == 'True';
  settingsPrefix = data.settingsPrefix;
  players = data.players;
  broadcastMode = data.broadcastMode;
  // graphicsOptions 
}

function hardReset() {
  if (confirm("Completely clear all tracker data, including settings and trackable objects?")) {
    localStorage.clear();
    location.reload();
  }
}
</script>

<template>
  <DifficultyIcons />

  <div id="unstackedContainer" class="row" data-player="">
    <div id="unstackedMap" class="col-xs-12 col-md map-slot map-chunk">
      <div id="mapContainer">
        <MainMap :broadcast-mode="broadMode" />
      </div>
    </div>
    <div id="unstackedItems" class="col-xs col-md-auto quicksettings-container px-0 item-chunk">
      <div class="navbar-slot">
        <NavBar />
      </div>
      <div class="items-slot">
        <div id="itemContainer" class="pb-2"></div>
      </div>
      <div class="row">
        <div class="col"></div>
        <div class="col-auto">
          <a href="/itemsBroadcast" target="_blank" onclick="openItemsBroadcastView(); return false;" class="pe-2" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-title="Open items broadcast view">
            <img class="dimvert" src="/images/pop-out.svg">
          </a>
        </div>
      </div>
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
      <div class="col"></div>
      <div class="col-xs col-md-auto items-slot">
      </div>
      <div class="col-auto mt-2">
        <a href="/itemsBroadcast" target="_blank" onclick="openItemsBroadcastView(); return false;"
          data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-title="Open items broadcast view">
          <img class="dimvert" src="/images/pop-out.svg">
        </a>
      </div>
      <div class="col"></div>
      <div class="col-auto px-2_5 quicksettings-container quicksettings-slot">
      </div>
    </div>
  </div>

  <div class="row">
    <div id="checkList" class="col">
      <!-- {% include 'checklist.html' %} -->
    </div>
  </div>

  <div id="settingsContainer">
    <SettingsPane :local="isLocal" :broadcast-mode="broadMode" :graphics-options="graphicsOptions" />
    <!-- {% include 'settings.html' %} -->
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
        <a href="/fetchupdate" class="btn btn-secondary update-button ms-2" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-title="Download update" role="button">
          <img src="/images/file-arrow-down.svg">
        </a>
      </div>
    </div>

    <div class="col-auto">
      <button type="button" class="btn btn-secondary" @click="hardReset()">Hard reset state and settings</button>
    </div>
  </div>

  <div class="form-check form-switch">
    <input class="form-check-input hidden" type="checkbox" checked id="lightSwitch" />
  </div>
</template>

<style scoped>
</style>
