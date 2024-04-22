<script setup>
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps(['isLocal', 'playerId', 'initialPlayerName', 'initialEventName', 'initialJoinCode']);

const playerIdTaken = ref(false);
const eventIsPublic = ref(true);
const eventError = ref(null);
const eventName = ref('');
const joinCode = ref('');
const playerName = ref('');

const sharingUrlPrefix = computed(() => props.isLocal ? 'https://magpietracker.us' : import.meta.env.VITE_API_URL);
const eventUrl = computed(() => `${sharingUrlPrefix.value}/event?eventName=${encodeURIComponent(eventName.value)}`);
const newEventUrl = `${import.meta.env.VITE_API_URL}/event`;

onMounted(() => {
    playerName.value = props.initialPlayerName;
    eventName.value = props.initialEventName;
    joinCode.value = props.initialJoinCode;
});

watch(props, (newValue, oldValue) => {
    if (oldValue.initialPlayerName != newValue.initialPlayerName || playerName.value === undefined) {
        playerName.value = newValue.initialPlayerName;
    }
    if (oldValue.initialEventName != newValue.initialEventName || eventName.value === undefined) {
        eventName.value = newValue.initialEventName;
    }
    if (oldValue.initialJoinCode != newValue.initialJoinCode || joinCode.value === undefined) {
        joinCode.value = newValue.initialJoinCode;
    }
});

watch(eventName, () => debounce(getEventInfo, 500));
watch(playerName, () => debounce(checkPlayerIdTaken, 500));

const debouncers = {};
function debounce(f, delay) {
    if (!(f.name in debouncers)) {
        debouncers[f.name] = setTimeout(f, delay);
        return;
    }

    if (debouncers[f.name]) {
        clearTimeout(debouncers[f.name]);
    }

    debouncers[f.name] = setTimeout(f, delay);
}

function checkPlayerIdTaken() {
    let data = new FormData();
    data.append('playerName', playerName.value);

    fetch(sharingUrlPrefix.value + '/playerId', {
        method: 'POST',
        body: data,
    })
        .then(response => response.text())
        .then(text => playerIdTaken.value = !(text == 'None' || text == props.playerId));
}

async function getEventInfo() {
    try {
        let response = await fetch(`${sharingUrlPrefix.value}/eventInfo?${new URLSearchParams({ eventName: eventName.value })}`, {
            method: 'GET',
        });
        if (!(response?.ok)) {
            eventError.value = await response.text();
            console.log(`Error getting event info: ${eventError.value}`);
        }
        else {
            let data = await response.json();

            eventIsPublic.value = !data || !data.privateJoin;
            eventError.value = null;
        }
    }
    catch (error) {
        eventError.value = String(error);
        console.log(`Error getting event info: ${eventError.value}`);
    }
}
</script>

<template>
    <div class="modal fade" id="shareModal" tabindex="-1" aria-labelledby="shareModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h6 class="modal-title" id="shareModalLabel">Share Tracker State</h6>
                    <button id="modalClose" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div>
                        <div>
                            <label for="playerName" class="form-label">Player name</label>
                            <input v-model="playerName" type="text" id="playerName" class="form-control" maxlength="80" placeholder="Required" aria-label="Player Name">
                            <!-- <div id="playerLink" class="pt-1">
                            <span class="pe-2">Player link:</span><a id="playerUrl" href="/player">asdf</a>
                        </div> -->
                            <div v-if="playerIdTaken" id="playerIdWarning" class="alert alert-warning py-2 my-2" role="alert">Warning: A player with this name already exists. Consider using another name.</div>
                        </div>
                        <div class="pt-3">
                            <label for="eventName" class="form-label">Event name</label>
                            <input v-model="eventName" type="text" id="eventName" class="form-control" maxlength="80" aria-label="Event name">

                            <template v-if="!eventError && !eventIsPublic">
                                <div id="joinRequiredAlert" class="alert alert-primary py-2 my-2" role="alert">Event requires a join code</div>

                                <label for="joinCode" class="form-label pt-2">Join code</label>
                                <input v-model="joinCode" type="text" id="joinCode" class="form-control" maxlength="80" aria-label="Join code">
                            </template>

                            <div v-if="false" id="joinCodeAlert" class="alert alert-danger py-2 my-2" role="alert">Incorrect join code</div>

                            <div v-if="eventName" id="eventLink" class="pt-1">
                                <span class="pe-2">Event link:</span><a id="eventUrl" :href="eventUrl">{{ eventUrl }}</a>
                            </div>

                            <div v-if="eventError" id="shareErrorAlert" class="alert alert-danger py-2 my-2" role="alert">{{ eventError }}</div>
                        </div>
                        <div class="pt-3">
                            <input id="liveUpdate" type="checkbox" class="form-check-input">
                            <label for="liveUpdate" class="form-label">Live update <img class="invert"
                                    src="/images/question-circle.svg" data-bs-toggle="tooltip"
                                    data-bs-custom-class="secondary-tooltip"
                                    data-bs-title="Inventory and check changes will be automatically shared for the rest of this session"></label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer justify-content-between">
                    <a v-if="isLocal" href="https://magpietracker.us/event" class="mr-auto">Create a private event</a>
                    <a v-else :href="newEventUrl" class="mr-auto">Create a private event</a>

                    <div>
                        <button type="button" class="btn btn-primary me-1" data-bs-dismiss="modal" onclick="shareState()">Share</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>