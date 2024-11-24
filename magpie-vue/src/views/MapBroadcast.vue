<script setup>
import DifficultyIcons from '@/components/DifficultyIcons.vue';
import MainMap from '@/components/Map/MainMap.vue';
import NavBar from '@/components/NavBar.vue';
import QuickSettings from '@/components/Settings/QuickSettings.vue';
import SettingsPane from '@/components/Settings/SettingsPane.vue';
import VueTooltip from '@/components/Tooltips/VueTooltip.vue';
import { initGlobals, init } from '@/moduleWrappers';
import { useStateStore } from '@/stores/stateStore.js';
import { onMounted } from 'vue';
import { onBeforeMount } from 'vue';
import { ref } from 'vue';

const state = useStateStore();

const broadMode = ref('receive');
const version = ref(null);

onBeforeMount(() => {
    window.settingsPrefix = 'mapBroadcast_';
});

onMounted(() => {
  fetch(import.meta.env.VITE_API_URL + '/api/basicInit')
    .then(response => response.json())
    .then(data => {
      state.isLocal = data.local;
      state.remoteVersion = data.remoteVersion;
      state.graphicsOptions = data.graphicsOptions;
      state.argDescriptions = data.flags;

      state.graphicsOptions.sort();

      version.value = state.remoteVersion;
      data.allowMap = true;
      data.refreshMap = false;

      initGlobals(data);
      init();
    });
});

document.title = 'Magpie Tracker - Map Broadcast View'

</script>

<template>

<DifficultyIcons />

<div id="unstackedContainer" class="row" data-player="">
  <div id="unstackedMap" class="col-xs-12 col-md map-slot map-chunk">
    <div id="mapContainer">
      <MainMap :broadcast-mode="broadMode" />
    </div>
  </div>

  <div class="quicksettings-container quicksettings-slot full-height">
    <QuickSettings :small-quicksettings="true" />
  </div>
</div>
<div id="stackedContainer" class="hidden" data-player="">
  <div id="stackedMap" class="row map-chunk">
    <div class="col map-slot">
    </div>
  </div>

  <div class="col-auto px-0 quicksettings-container quicksettings-slot">
  </div>
</div>

<div>
    <NavBar :is-local="state.isLocal" :version="version" :remote-version="state.remoteVersion" :show-share="false" />
</div>

<div v-if="!state.isLocal" class="pt-4">
    <h3>Streaming? Try the offline version for browser source support: <a href="https://magpietracker.us/static/builds/magpie-local.zip">Windows</a>, <a href="https://magpietracker.us/static/builds/magpie-local-linux.zip">Linux</a>, <a href="https://magpietracker.us/static/builds/magpie-source.zip">Source bundle</a></h3>
</div>

<VueTooltip type="text" :text-color="state.settings.textColor" />
<VueTooltip type="node" :text-color="state.settings.textColor" />
<VueTooltip type="auxNode" :text-color="state.settings.textColor" />

<div id="settingsContainer">
  <SettingsPane v-if="state.settings.checkSize" :local="state.isLocal" :broadcast-mode="broadMode"
    :graphics-options="state.graphicsOptions"
    :argDescriptions="state.argDescriptions" />
</div>

</template>