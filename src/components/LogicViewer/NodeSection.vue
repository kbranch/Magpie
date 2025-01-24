<script setup>
import LogicViewerConnection from './LogicViewerConnection.vue';
import LogicViewerEntrance from './LogicViewerEntrance.vue';
import LogicViewerCheck from './LogicViewerCheck.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useAccessibilityStore } from '@/stores/accessibilityStore';
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { useStateStore } from '@/stores/stateStore';

const state = useStateStore();
const logic = useLogicViewerStore();
const accessibility = useAccessibilityStore();

const connections = ref([]);

const tipsUrlPrefix = computed(() => state.isLocal ? 'https://magpietracker.us' : import.meta.env.VITE_API_URL);
const node = computed(() => logic.inspectedNode);
const checks = computed(() => node.value.checks?.filter(checkId => checkId in accessibility.checksById)
                                                   .map(checkId => accessibility.checksById[checkId]));
const entrances = computed(() => node.value.entrances?.filter(entranceId => entranceId in accessibility.entrances)
                                                         .map(entranceId => accessibility.entrances[entranceId]));

onMounted(async () => {
        updateConnections();
});

watch(node, async () => {
    updateConnections();
});

async function updateConnections() {
    if(!node.value) {
        return;
    }

    connections.value = node.value.connections?.filter(conn => conn.to in logic.graph);

    await fetchTips();
}

async function fetchTips() {
    let connectionIds = JSON.stringify(connections.value.map(x => x.id));
    let response = await fetch(`${tipsUrlPrefix.value}/api/tips?${new URLSearchParams({ connectionIds: connectionIds })}`);

    if (!(response?.ok)) {
        let error = await response.text();
        console.log(`Error getting connection tips: ${error}`);
        
        return;
    }

    let tips = await response.json();

    for (const conn of connections.value) {
        conn.tips = tips.filter(x => x.connectionId == conn.id);
    }
}

</script>

<template>

<h5>
    <div class="text-start d-flex p-1 mb-0 align-items-center">
        <div class="tooltip-check-graphic align-middle" 
            :class="{ [`difficulty-${node.diff ?? '9'}`]: true }">

            <div class="tooltip-check-graphic icon-wrapper">
                <svg class="tooltip-check-graphic align-middle">
                    <use :xlink:href="`#difficulty-${node.diff ?? '9'}`"></use>
                </svg>
            </div>
        </div>
        <div class="ps-2">
            {{ node.id }}
        </div>
    </div>
</h5>

<h6>Checks:</h6>
<div>
    <template v-if="(node.checks?.length ?? 0) == 0">None</template>

    <LogicViewerCheck v-else v-for="(check, index) in checks" :key="check.id"
        v-model="checks[index]" />
</div>

<h6 class="pt-3">Entrances:</h6>
<div>
    <template v-if="(node.entrances?.length ?? 0) == 0">None</template>

    <LogicViewerEntrance v-else v-for="(entrance, index) in entrances" :key="entrance.id"
        v-model="entrances[index]" />
</div>

<h6 class="pt-3">Connections:</h6>
<div>
    <table class="table table-dark table-hover">
        <thead>
            <tr>
                <th scope="col"></th>
                <th scope="col">To</th>
                <th scope="col">Requirements</th>
                <th scope="col"></th>
                <th scope="col"></th>
            </tr>
        </thead>
        <tbody>
            <LogicViewerConnection v-for="(connection, index) in connections" :key="connection"
                v-model="connections[index]" :node-id="node.id" />
        </tbody>
    </table>
</div>

</template>

<style scoped>
</style>