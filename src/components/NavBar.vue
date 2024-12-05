<script setup>
import {$, getStateZip, resetSession} from '@/moduleWrappers.js';
import { computed, onMounted } from 'vue';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import ShareDialog from './ShareDialog.vue';
import { useStateStore } from '@/stores/stateStore';
import { isNumeric } from '@/main';

const state = useStateStore();

const props = defineProps({
  showTitle: {
    type: Boolean,
    required: false,
    default: false,
  },
  showShare: {
    type: Boolean,
    required: false,
    default: true,
  },
  isLocal: {
    required: true,
  },
  version: {
    required: false,
  },
  remoteVersion: {
    required: false,
  },
});

const tip = useTextTooltipStore();

const aboutContents = `<p>The source is up on <a href='https://github.com/kbranch/Magpie'>GitHub</a> - <a href='https://github.com/kbranch/Magpie/issues/new/choose'>report a bug</a></p>
    <p>Check out the <a href='https://github.com/kbranch/Magpie/blob/master/README.md'>readme</a> for some documentation</p>
    <p>Special thanks to:</p>
    <ul>
        <li><a href='https://twitter.com/muffinjets_'>MuffinJets</a> for his <a href='https://github.com/muffinjets/ladx_maptracker_muffinjets_wolfman2000'>EmoTracker pack</a>, which this is essentially a port of, and for help with the design</li>
        <li><a href='https://github.com/daid'>Daid</a> for creating <a href='https://daid.github.io/LADXR/'>LADXR</a> and keeping it open</li>
        <li><a href='http://artemis251.fobby.net/zelda/index.php'>Artemis251</a> for the great map resources and screenshots</li>
        <li><a href='https://www.twitch.tv/dragonc0'>Dragonc0</a> for a ton of great logic additions, and for creating an <a href='https://www.twitch.tv/collections/GE492sZzKxdd3w'>amazing guide for higher logic tricks</a> (Twitch's UI for collections isn't great, but there are separate videos for each dungeon and the overworld)</li>
    </ul>
    <p>Visit us on either on the <a href='https://discord.gg/QhAKagk84e'>Z4R Discord</a> or the <a href='https://discord.gg/QhAKagk84e'>Magpie Discord</a>!</p>`;

const updateAvailable = computed(() => {
    return isNumeric(props.version) && isNumeric(props.remoteVersion) && props.remoteVersion > props.version;
});

onMounted(() => {
    $('#bodyTextArea').summernote({
        height: 320,
    });
});

async function sendSuggestion() {
    $.ajax({
        type: "POST",
        url: "https://dev.magpietracker.us/suggestion",
        data: {
            email: $('#suggestionEmail')[0].value,
            body: $('#bodyTextArea').summernote('code'),
            state: await getStateZip(),
        },
    });
}
</script>

<template>
    <nav id="navbar" class="navbar px-2_5">
        <div class="container px-0">
            <a v-if="showTitle" class="nav-link pe-2" href="/">Magpie</a>
            <button type="button" class="btn btn-secondary" data-bs-toggle="popover" :data-bs-content=aboutContents data-bs-html="true" @mouseenter="tip.tooltip('About Magpie', $event)">
                <img class="button-icon" src="/images/question-circle.svg">
            </button>
            <button class="btn btn-secondary ms-1"  @mouseenter="tip.tooltip('Make a suggestion or report a bug', $event)" data-bs-toggle="modal" data-bs-target="#suggestionModal" type="button">
                <img class="button-icon" src="/images/bug.svg">
            </button>

            <template v-if="showShare">
                <button class="btn btn-secondary ms-1" data-bs-toggle="modal" data-bs-target="#shareModal" type="button" @mouseenter="tip.tooltip('Share', $event)">
                    <img class="button-icon" src="/images/share.svg">
                </button>
                <img id="liveUpdateIcon" src="/images/broadcast-pin.svg" data-status="off" class="p-1" @mouseenter="tip.tooltip('Live sharing', $event)">

                <div v-if="updateAvailable" class="col-auto">
                    <div class="version">
                        <a class="btn btn-success ms-1" role="button" 
                          @mouseenter="tip.tooltip(`${isLocal ? 'Download' : 'Refresh to'} update<br>Current version: ${version}<br>New Version: ${remoteVersion}`, $event)"
                          @click="() => isLocal ? window.location.href = '/fetchupdate' : window.location.reload()">
                            <img src="/images/file-arrow-down.svg">
                        </a>
                    </div>
                </div>
            </template>

            <div id="endButtons">
                <button type="button" class="btn btn-secondary" @click="resetSession()" @mouseenter="tip.tooltip('Reset Checks and Inventory', $event)">
                    <img class="button-icon" src="/images/arrow-clockwise.svg">
                </button>
                <span class="ms-1" data-bs-toggle="offcanvas" data-bs-target="#argsOffcanvas" aria-controls="argsOffcanvas">
                    <button id="argsCloseButton" class="btn btn-secondary" type="button" @mouseenter="tip.tooltip('Settings', $event)">
                        <img class="button-icon" src="/images/gear.svg">
                    </button>
                </span>
            </div>
        </div>
    </nav>

    <div class="modal fade" id="suggestionModal" tabindex="-1" aria-labelledby="suggestionModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h6 class="modal-title" id="suggestionModalLabel">Make a suggestion or report a bug</h6>
                    <button id="modalClose" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="suggestionEmail" class="form-label">Email address (optional)</label>
                        <input type="email" class="form-control" id="suggestionEmail" placeholder="Optional">
                    </div>
                    <div>
                        <div id="bodyTextArea" name="editordata"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="sendSuggestionButton" type="button" class="btn btn-primary big-button" data-bs-dismiss="modal" @click="sendSuggestion()">Submit</button>
                </div>
            </div>
        </div>
    </div>

    <ShareDialog v-if="showShare" :is-local="isLocal" :player-id="state.settings.playerId"
        :initial-player-name="state.settings.playerName"
        :initial-event-name="state.settings.eventName"
        :initial-join-code="state.settings.joinCode" />
</template>

<style scoped>
.btn {
    display: flex;
    padding-top: 10px;
    padding-bottom: 10px;
}

.container {
    justify-content: normal !important;
    position: relative;
}

#endButtons {
    display: flex;
    position: absolute;
    right: 0;
}
</style>