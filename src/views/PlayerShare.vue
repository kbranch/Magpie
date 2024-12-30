<script setup>
import DifficultyIcons from '@/components/DifficultyIcons.vue';
import NavBar from '@/components/NavBar.vue';
import QuickSettings from '@/components/Settings/QuickSettings.vue'
import MainMap from '@/components/Map/MainMap.vue'
import SettingsPane from '@/components/Settings/SettingsPane.vue';
import CheckList from '@/components/CheckList/CheckList.vue';
import VueTooltip from '@/components/Tooltips/VueTooltip.vue';
import VersionAlert from '@/components/VersionAlert.vue';
import SidebarAlert from '@/components/SidebarAlert.vue';
import HintPanel from '@/components/HintPanel.vue';
import FooterRow from '@/components/FooterRow.vue';
import AlertModal from '@/components/AlertModal.vue';
import { initGlobals, init, prefixOverrides, importState } from '@/moduleWrappers.js';
import { computed, onMounted, ref, watch } from 'vue';
import { useStateStore } from '@/stores/stateStore.js';
import { useTextTooltipStore } from '@/stores/textTooltipStore';
import { useRoute } from 'vue-router';

document.title = 'Magpie Tracker - Player Share';

const route = useRoute();
const state = useStateStore();
const tip = useTextTooltipStore();

let refreshInterval = null;

const hostname = ref(null);
const version = ref(null);
const broadMode = ref('none');
const graphicsOptions = ref([]);
const argDescriptions = ref({});
const lastTimestamp = ref(null);
const lastLocationTimestamp = ref(0);
const delaySeconds = ref(0);
const liveUpdate = ref(false);

const itemsPaddingLeft = computed(() => state.settings.swapItemsAndMap ? '12px' : '0');
const itemsPaddingRight = computed(() => state.settings.swapItemsAndMap ? '0' : '12px');

onMounted(() => {
  fetch(import.meta.env.VITE_API_URL + '/api/init')
    .then(response => response.json())
    .then(data => {
      state.isLocal = data.local;
      state.ndiEnabled = Boolean(data.ndiEnabled);
      hostname.value = data.hostname;
      version.value = data.version;
      state.remoteVersion = data.remoteVersion;
      graphicsOptions.value = data.graphicsOptions;
      argDescriptions.value = data.flags;

      graphicsOptions.value.sort();

      data.broadcastMode = 'none';
      data.settingsPrefix = 'playerShare_'
      data.allowAutotracking = false;

      prefixOverrides['settings'] = '';

      initGlobals(data);
      init();

      state.locationHistory.length = 0;

      getPlayerState();
    });
});

watch(liveUpdate, (value) => {
  if (value) {
    refreshInterval = setInterval(getPlayerState, 1000);
  }
  else {
    clearInterval(refreshInterval);
  }
})

function getPlayerState() {
  let players = {};
  players[route.params.playerName] = {
    'timestamp': lastTimestamp.value,
    'delaySeconds': delaySeconds.value,
    'locationTimestamp': lastLocationTimestamp.value,
  }

  fetch(`${import.meta.env.VITE_API_URL}/api/playerState?${new URLSearchParams({ players: JSON.stringify(players) })}`)
    .then(response => response.json())
    .then(data => {
      let player = data[route.params.playerName];
      if (player) {
        if (player.state) {
          lastTimestamp.value = player.timestamp;
          importState(player.state, false, false);
        }

        if (player.locationHistory) {
          lastLocationTimestamp.value = player.locationHistory.timestamp;

          for (const point of player.locationHistory.points) {
            state.locationHistory.push(point);
          }
        }
      }
    });
}

</script>

<template>

<template v-if="false">
</template>

<template v-else>
<DifficultyIcons />

<div id="banner" class="row">
    <div class="col"></div>
    <div class="col-auto">
        <span id="bannerText">Viewing player {{ route.params.playerName }}</span>
    </div>
    <div id="controls" class="col">
        <div class="control pe-2">
            <label for="delayInput" class="pe-2">Delay (seconds)</label>
            <input v-model="delaySeconds" id="delayInput" type="number" min="0" max="7200" value="0" class="">
        </div>
        <div class="control">
            <input id="liveUpdateInput" v-model="liveUpdate" type="checkbox" class="form-check-input">
            <label for="liveUpdateInput" class="">Live update</label>
        </div>
    </div>
</div>

<div id="unstackedContainer" class="row" data-player="">
  <div id="unstackedMap" class="col-xs-12 col-md map-slot map-chunk">
    <div id="mapContainer">
      <MainMap :broadcast-mode="broadMode" />
    </div>
  </div>
  <div id="unstackedItems" class="col-xs col-md-auto quicksettings-container item-chunk">
    <div class="navbar-slot">
      <NavBar :is-local="state.isLocal" :version="version" :remote-version="state.remoteVersion" :show-share="false" />
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
    </div>
    <VersionAlert :client-version="version" :remote-version="state.remoteVersion" :update-message="state.updateMessage" />
    <SidebarAlert :message="state.sidebarMessage" />
    <div id="unstackedHintWrapper">
      <HintPanel />
    </div>
    <div class="quicksettings-container quicksettings-slot">
      <QuickSettings :small-quicksettings="true" />
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
    <CheckList :check-accessibility="state.checkAccessibility" />
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

</template>
</template>

<style scoped>
#liveUpdateInput {
    margin-top: 0;
}

#controls {
    display: flex;
    align-items: center;
    height: 100%;
    justify-content: end;
}

.control {
    display: flex;
    align-items: center;
}

#banner {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.05);
    margin-top: 6px;
    margin-left: 0;
    margin-right: 0;
}

#bannerText {
    font-size: 30px;
}

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