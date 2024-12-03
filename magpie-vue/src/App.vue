<script setup>
import { win } from '@/moduleWrappers.js';
import { computed, toRaw } from 'vue';
import { useStateStore } from '@/stores/stateStore.js';
import { useEventStore } from '@/stores/eventStore';

const state = useStateStore();
const eventStore = useEventStore();

const bgColor = computed(() => state.settings.bgColor);
const textColor = computed(() => state.settings.textColor);
const highlightColor = computed(() => state.settings.highlightColor);

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

function updateLogics(newLogics) {
  state.logics = newLogics;
}

function updateCheckAccessibility(accessibility) {
  state.checkAccessibility = accessibility;
}

function updateServerVersion(newVersion, message=null) {
  if (!state.isLocal) {
    state.remoteVersion = newVersion;
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

defineExpose({
  updateChecked,
  updateCheckContents,
  updateSettings,
  updateArgs,
  stripProxy,
  updateCheckAccessibility,
  updateLogics,
  updateServerVersion,
  updateSidebarMessage,
  updateEventInfo,
  updateSpoilerLog,
});
</script>

<template>
<div id="appWrapper" class="magpie-colors">
<div id="appInner">
  <RouterView />

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
  min-height: 100vh;
}

#appInner {
  max-width: 1500px;
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
