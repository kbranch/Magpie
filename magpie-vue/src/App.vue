<script setup>
import DifficultyIcons from './components/DifficultyIcons.vue'
import NavBar from './components/NavBar.vue'

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
        <!-- {% include 'map.html' %} -->
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
          <a href="/itemsBroadcast" target="_blank" onclick="openItemsBroadcastView(); return false;" class="pe-2"
            data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-title="Open items broadcast view">
            <img class="dimvert" src="/static/images/pop-out.svg">
          </a>
        </div>
      </div>
      <div class="quicksettings-container quicksettings-slot full-height">
        <!-- {% include 'quicksettings.html' %} -->
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
          <img class="dimvert" src="/static/images/pop-out.svg">
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
    <!-- {% include 'settings.html' %} -->
  </div>

  <div class="row justify-content-end pt-4">
    <div class="col">
      <!-- {{hostname}} -->
    </div>
    <div class="col-auto">
      <div class="version">
        <!-- <span>Version: {{ version }}</span> -->
      </div>
    </div>
    <!-- {% if local and version != remoteVersion and remoteVersion %} -->
    <!-- <div class="col-auto">
      <div class="version">
        <span>Latest version: {{ remoteVersion }}</span>
        <a href="/fetchupdate" class="btn btn-secondary update-button ms-2" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-title="Download update" role="button">
          <img src="static/images/file-arrow-down.svg">
        </a>
      </div>
    </div> -->
    <!-- {% endif %} -->
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
