<script setup>
import VueTooltip from '@/components/Tooltips/VueTooltip.vue';
import SettingsPane from '@/components/Settings/SettingsPane.vue';
import NavBar from '@/components/NavBar.vue';
import { onBeforeMount, onMounted, ref } from 'vue';
import { initGlobals, init, eventNameInput } from '@/moduleWrappers';
import { useStateStore } from '@/stores/stateStore.js';
import { useEventStore } from '@/stores/eventStore.js';
import { nextTick } from 'vue';
import { watch } from 'vue';
import { useRouter } from 'vue-router';

const state = useStateStore();
const eventStore = useEventStore();

const router = useRouter();

const broadMode = "none";
const version = ref(null);
const players = ref([]);
const codeFailed = ref(null);
const joinCode = ref(null);

const props = defineProps(['eventName', 'viewCode']);

document.title = 'Magpie Tracker - Event Restream';

onMounted(() => {
  let params = new URLSearchParams();

  if (props.eventName) {
    params.append('eventName', props.eventName);
  }

  if (props.viewCode) {
    params.append('viewCode', props.viewCode);
  }

  let url = `${import.meta.env.VITE_API_URL}/api/event?${params}`;

  fetch(url)
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
      data.keepQueryArgs = true;
      data.settingsPrefix = 'mapBroadcast_';

      players.value = data.players;
      eventStore.eventName = data.eventName;
      codeFailed.value = data.codeFailed;
      eventStore.viewCode = data.viewCode;
      joinCode.value = data.joinCode;

      initGlobals(data);
      init();

      nextTick(() => {
        if (document.getElementById('eventName')) {
          eventNameInput();
        }
      });
    });
});

watch(props, (newValue) => {
  eventStore.eventName = newValue.eventName;
  eventStore.viewCode = newValue.viewCode;
});

watch(eventStore, updateUrl);

function updateUrl() {
  if (eventStore.eventName || eventStore.viewCode) {
    router.push({ query: { eventName: eventStore.eventName, viewCode: eventStore.viewCode } });
  }
  else {
    router.push({ query: { } });
  }
}

</script>

<template>

<div class="row">
  <div class="col">
    <a href="/event" class="btn btn-primary mt-4" role="button">New Event</a>
  </div>
  <div v-if="eventStore.eventName && !codeFailed" class="col-4">
    <h2>Viewing event '{{eventStore.eventName}}'</h2>

    <h6 v-if="players.length == 0">No player data found, refresh to check again</h6>
  </div>
  <div v-show="!(eventStore.eventName && !codeFailed)" class="col-4">
    <label for="eventName" class="form-label">Event name</label>
    <input type="text" class="form-control" id="eventName" maxlength="80" oninput="eventNameInput()" :value="eventStore.eventName">

    <div id="eventAlert" class="alert alert-primary my-2 py-2 hidden" role="alert">Event does not exist yet</div>

    <label for="viewCode" class="form-label pt-2 hidden">View code</label>
    <input type="text" class="form-control hidden" id="viewCode" maxlength="80" oninput="viewCodeInput()" :value="eventStore.viewCode">

    <label for="joinCode" class="form-label pt-2 hidden">Join code</label>
    <input type="text" class="form-control hidden" id="joinCode" maxlength="80" :value="joinCode">

    <div v-if="codeFailed" id="codeFailedAlert" class="alert alert-danger my-2 py-2" role="alert">Incorrect view code</div>

    <div class="row pt-4">
      <div class="col">
        <button id="eventActionButton" type="button" class="btn btn-secondary big-button" disabled onclick="eventAction()">Create Event</button>
      </div>
    </div>
  </div>
  <div class="col"></div>
</div>

<div id="unstackedContainer" class="row border-me">
  <div v-for="player in players" :key="player" id="unstackedItems" :data-player="player" class="col-xs col-md-auto mt-2 mx-4 item-width">
    <div class="row">
      <div class="col-auto pe-2">
        <label :for="`unstackedDelayPlayer${player}`" class="form-label">Update delay (seconds)</label>
        <input :id="`unstackedDelayPlayer${player}`" :data-player="player" type="number" min="0" max="7200" value="0" class="form-control delay-input">
      </div>

      <div class="col-auto">
        <input :id="`unstackedRefreshPlayer${player}`" :data-player="player" type="checkbox" class="form-check-input mt-2 update-input" checked>
        <label :for="`unstackedRefreshPlayer${player}`" class="form-label mt-1">Live update</label>
      </div>
    </div>

    <span>Player: {{player}}</span>
    <span class="state-timestamp"></span>

    <div class="items-slot item-border">
        <div id="itemContainer" class="pb-2"></div>
    </div>
  </div>
</div>
<div id="stackedContainer" class="row hidden">
  <div v-for="player in players" :key="player" id="stackedItems" :data-player="player" class="col-auto mt-2 mx-4">
    <div class="row">
      <div class="col-auto pe-2">
        <label :for="`stackedDelayPlayer${player}`" class="form-label">Update delay (seconds)</label>
        <input :id="`stackedDelayPlayer${player}`" :data-player="player" type="number" min="0" max="7200" value="0" class="form-control delay-input">
      </div>

      <div class="col-auto">
        <input :id="`stackedRefreshPlayer${player}`" :data-player="player" type="checkbox" class="form-check-input mt-2 update-input" checked>
        <label :for="`stackedRefreshPlayer${player}`" class="form-label mt-1">Live update</label>
      </div>
    </div>

    <span>Player: {{player}}</span>
    <span class="state-timestamp"></span>

    <div class="row item-border">
      <div class="col-xs col-md-auto items-slot px-0">
      </div>
    </div>
  </div>
</div>

<div class="row">
  <div class="col"></div>
  <div class="col-auto pt-4">
    <h5>Running a solo stream? Try the <a href="https://github.com/kbranch/Magpie/blob/master/README.md#streaming">broadcast views</a>!</h5>
  </div>
  <div class="col"></div>
</div>

<div>
  <NavBar :is-local="state.isLocal" :version="version" :remote-version="state.remoteVersion" :show-share="false" />
</div>

<VueTooltip type="text" :text-color="state.settings.textColor" />

<div id="settingsContainer">
  <SettingsPane v-if="state.settings.checkSize" :local="state.isLocal" :broadcast-mode="broadMode"
    :graphics-options="state.graphicsOptions"
    :argDescriptions="state.argDescriptions" />
</div>

</template>