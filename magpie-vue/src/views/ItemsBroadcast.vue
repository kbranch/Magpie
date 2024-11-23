<script setup>
import NavBar from '@/components/NavBar.vue';
import SettingsPane from '@/components/Settings/SettingsPane.vue';
import VueTooltip from '@/components/Tooltips/VueTooltip.vue';
import { initGlobals, init } from '@/moduleWrappers';
import { useStateStore } from '@/stores/stateStore';
import { onMounted } from 'vue';
import { onBeforeMount } from 'vue';
import { ref } from 'vue';

const state = useStateStore();

const broadMode = ref('receive');
const version = ref(null);

onBeforeMount(() => {
    window.settingsPrefix = 'itemsBroadcast_';
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
      data.allowMap = false;
      data.refreshMap = false;
      data.allowItems = true;

      initGlobals(data);
      init();
    });
});
</script>

<template>

<div id="unstackedContainer" class="row ps-0 pt-0">
    <div id="unstackedItems" data-player="" class="col-auto">
        <div class="items-slot">
            <div id="itemContainer" class="pb-2"></div>
        </div>
    </div>
    <div class="col"></div>
</div>
<div id="stackedContainer" class="row ps-0 pt-0 hidden">
    <div id="stackedItems" data-player="" class="col-auto">
        <div class="row">
            <div class="col-xs col-md-auto items-slot px-0">
            </div>
        </div>
    </div>
</div>

<div>
    <NavBar :is-local="state.isLocal" :version="version" :remote-version="state.remoteVersion" />
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