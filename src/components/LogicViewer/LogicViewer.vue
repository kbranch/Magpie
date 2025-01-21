<script setup>
import { closeAllTooltips } from '@/moduleWrappers';
import { useAccessibilityStore } from '@/stores/accessibilityStore';
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { computed, nextTick, onMounted, onUpdated, ref, watch } from 'vue';
import LogicViewerConnection from './LogicViewerConnection.vue';
import LogicViewerEntrance from './LogicViewerEntrance.vue';
import LogicViewerCheck from './LogicViewerCheck.vue';
import { useStateStore } from '@/stores/stateStore';

const state = useStateStore();
const logic = useLogicViewerStore();
const accessibility = useAccessibilityStore();

const modal = ref(null);
const body = ref(null);
const connections = ref([]);

const tipsUrlPrefix = computed(() => state.isLocal ? 'https://magpietracker.us' : import.meta.env.VITE_API_URL);

const node = computed(() => logic.inspectedNode);
const checks = computed(() => node.value.checks?.filter(checkId => checkId in accessibility.checksById)
                                                   .map(checkId => accessibility.checksById[checkId]));
const entrances = computed(() => node.value.entrances?.filter(entranceId => entranceId in accessibility.entrances)
                                                         .map(entranceId => accessibility.entrances[entranceId]));

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

watch(node, async (value, oldValue) => {
    if (value != null && oldValue == null) {
        closeAllTooltips();

        connections.value = node.value.connections?.filter(conn => conn.to in logic.graph);

        nextTick(() => { 
            new window.bootstrap.Modal(modal.value).show();
        });

        fetchTips();
    }
});

onMounted(() => {
    modal.value.addEventListener('hide.bs.modal', () => {
        logic.clearNode();
    });
});

onUpdated(() => {
    let tooltipTriggerList = body.value.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl, { sanitize: false }));
});

</script>

<template>

<div ref="modal" class="modal fade" tabindex="-1" aria-labelledby="logicModalLabel" aria-hidden="true" data-bs-keyboard="true">
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <div class="modal-content">
            <div class="modal-header py-2">
                <h6 class="modal-title" id="logicModalLabel">
                    <div v-if="logic.stack?.length > 0" id="backSection">
                        <button type="button" class="btn btn-secondary me-2"
                            @click="logic.popStack()">

                            <img src="/images/chevron-left.svg" class="invert pe-1">
                            Back
                        </button>
                        <span>to {{ logic.stackTop }}</span>
                    </div>
                    <template v-if="node == 'bad-check'">Check not found</template>
                    <template v-else-if="node == 'bad-entrance'">Entrance not found</template>
                    <template v-else-if="node">Viewing node '{{ logic.getLogicNodeName(node.id) }}'</template>
                </h6>
                <button type="button" class="btn-close invert" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div ref="body" class="modal-body">
                <template v-if="node == 'bad-check'">Check not found in logic graph. You may need to connect additional entrances.</template>
                <template v-else-if="node == 'bad-entrance'">Entrance not found in logic graph. You may need to connect additional entrances.</template>

                <template v-else-if="node">
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
            </div>
            <div class="modal-footer">
                <div class="display-flex justify-content-end">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</div>

</template>

<style scoped>

table {
    height: 1px; /* Ugly hack to allow for 100% sizing inside cells */
}

#logicModalLabel {
    display: flex;
    align-items: center;
    justify-content: end;
    padding-right: 12px;
    width: 100%;
}

#backSection {
    display: flex;
    align-items: center;
    position: absolute;
    left: 8px;
}

.modal-header {
    min-height: 56px;
}

</style>