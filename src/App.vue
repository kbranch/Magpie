<script setup>
import { win } from '@/moduleWrappers.js';
import { computed, isProxy, toRaw } from 'vue';
import { useStateStore } from '@/stores/stateStore.js';
import { useEventStore } from '@/stores/eventStore';
import LogicViewer from './components/LogicViewer/LogicViewer.vue';
import { useLogicViewerStore } from './stores/logicViewerStore';
import { useAccessibilityStore } from './stores/accessibilityStore';
import ReportModal from './components/ReportModal.vue';

const state = useStateStore();
const eventStore = useEventStore();
const logicStore = useLogicViewerStore();
const accessibility = useAccessibilityStore();

const bgColor = computed(() => state.settings.bgColor);
const textColor = computed(() => state.settings.textColor);
const highlightColor = computed(() => state.settings.highlightColor);
const containerWidth = computed(() => state.settings.maxContainerWidth ? `${state.settings.maxContainerWidth}px` : '1500px');

function updateChecked(checked) {
  state.checkedChecks = new Set(checked);
}

function updateHints(hints) {
  state.hints = hints;
  win.hints = state.hints;
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

function stripProxy(obj, level=0) {
  // Arbitrary limit to prevent loops
  if (level < 5) {
    for(const key in obj) {
      if (isProxy(obj[key])) {
        obj[key] = toRaw(obj[key]);
      }

      // Recursively strip members too
      stripProxy(obj[key], level + 1);
    }
  }

  return toRaw(obj);
}

function updateLogics(newLogics) {
  state.logics = newLogics;
}

function updateAccessibility(newAccessibility) {
  accessibility.loadChecks(newAccessibility.checks);
  accessibility.loadEntrances(newAccessibility.entrances);
}

function updateServerVersion(newVersion, newBuild, message=null) {
  if (!state.isLocal) {
    state.remoteVersion = { version: newVersion ?? newBuild, build: newBuild };
    state.updateMessage = message;
  }
}

function updateSidebarMessage(message) {
  state.sidebarMessage = message;
}

function updateEventInfo(eventName, viewCode) {
  eventStore.eventName = eventName;
  eventStore.viewCode = viewCode;
}

function updateSpoilerLog(spoilerLog) {
  state.spoilerLog = spoilerLog;
}

function updateLinkFace(showing) {
  state.linkFaceShowing = showing;
}

function updateLogicGraph(graph) {
  logicStore.graph = graph;
}

function updateEntranceConnection(type, source) {
  state.connectionSource = source;
  state.connectionType = type;
}

defineExpose({
  updateChecked,
  updateCheckContents,
  updateSettings,
  updateArgs,
  stripProxy,
  updateAccessibility,
  updateLogics,
  updateServerVersion,
  updateSidebarMessage,
  updateEventInfo,
  updateSpoilerLog,
  updateHints,
  updateLinkFace,
  updateLogicGraph,
  updateEntranceConnection,
});
</script>

<template>
<div id="appWrapper" class="magpie-colors">
<div id="appInner">
  <RouterView />

  <LogicViewer />

  <ReportModal />

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

.magpie-colors, .bg-dark, .text-bg-dark, tab-button.active, .tab-link, .modal-content, .modal-header, .modal-footer,
.table {
  background-color: v-bind(bgColor) !important;
  background: v-bind(bgColor) !important;
  color: v-bind(textColor) !important;
  --bs-table-bg: v-bind(bgColor) !important;
  --bs-table-hover-bg: v-bind(bgColor) !important;
  --bs-table-hover-color: v-bind(textColor) !important;
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
  min-height: 100vh;
}

#appInner {
  max-width: v-bind(containerWidth);
  width: 100%;
  padding-left: 12px;
  padding-right: 12px;
  min-height: 100vh;
  position: relative;
}

.dimvert {
    filter: invert(1)
            brightness(0.5);
}
</style>
