<script setup>
import { closeAllTooltips } from '@/moduleWrappers';
import { useAccessibilityStore } from '@/stores/accessibilityStore';
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { computed, nextTick, onMounted, onUpdated, ref, watch } from 'vue';
import LogicViewerConnection from './LogicViewerConnection.vue';
import LogicViewerEntrance from './LogicViewerEntrance.vue';
import LogicViewerCheck from './LogicViewerCheck.vue';

const logic = useLogicViewerStore();
const accessibility = useAccessibilityStore();

const modal = ref(null);
const body = ref(null);

const node = computed(() => logic.inspectedNode);
const nodeChecks = computed(() => node.value.checks?.filter(checkId => checkId in accessibility.checksById)
                                                   .map(checkId => accessibility.checksById[checkId]));
const nodeEntrances = computed(() => node.value.entrances?.filter(entranceId => entranceId in accessibility.entrances)
                                                         .map(entranceId => accessibility.entrances[entranceId]));
const nodeConnections = computed(() => node.value.connections?.filter(conn => conn.to in logic.graph));

watch(node, (value, oldValue) => {
    if (value != null && oldValue == null) {
        closeAllTooltips();

        nextTick(() => { 
            new window.bootstrap.Modal(modal.value).show();
        });
    }
});

onMounted(() => {
    modal.value.addEventListener('hide.bs.modal', () => {
        logic.clearNode();
        console.log("cleared node");
    });
});

onUpdated(() => {
    let tooltipTriggerList = body.value.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl, { sanitize: false }));
});

</script>

<template>

<div ref="modal" class="modal fade" id="logicModal" tabindex="-1" aria-labelledby="logicModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-l">
        <div class="modal-content">
            <div class="modal-header">
                <h6 class="modal-title" id="logicModalLabel">
                    <template v-if="node == 'bad-check'">Check not found</template>
                    <template v-else-if="node == 'bad-entrance'">Entrance not found</template>
                    <template v-else-if="node">Viewing node '{{ logic.getLogicNodeName(node.id) }}'</template>
                </h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div ref="body" class="modal-body" id="logicBody">
                <template v-if="node == 'bad-check'">Check not found in logic graph. You may need to connect additional entrances.</template>
                <template v-else-if="node == 'bad-entrance'">Entrance not found in logic graph. You may need to connect additional entrances.</template>

                <template v-else-if="node">
                <h5>
                    <div class="text-start d-flex p-1 mb-0 align-items-center">
                        <div class="tooltip-check-graphic difficulty-${node.diff ?? '9'} align-middle">
                            <div class="tooltip-check-graphic icon-wrapper">
                                <svg class="tooltip-check-graphic align-middle"><use xlink:href="#difficulty-${node.diff ?? '9'}"></use></svg>
                            </div>
                        </div>
                        <div class="ps-2">
                            {{ node.id }}
                        </div>
                    </div>
                </h5>
                <h6>Checks:</h6>
                <div>
                    <template v-if="node.checks?.length === 0">None</template>

                    <LogicViewerCheck v-else v-for="(check, index) in nodeChecks" :key="check.id"
                        v-model="nodeChecks[index]" />
                </div>
                <h6 class="pt-3">Entrances:</h6>
                <div>
                    <template v-if="node.entrances?.length === 0">None</template>

                    <LogicViewerEntrance v-else v-for="(entrance, index) in nodeEntrances" :key="entrance.id"
                        v-model="nodeEntrances[index]" />
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
                            <LogicViewerConnection v-for="(connection, index) in nodeConnections" :key="connection"
                                v-model="nodeConnections[index]" :node-id="node.id" />
                        </tbody>
                    </table>
                </div>
                </template>
            </div>
            <div class="modal-footer">
                <div class="row justify-content-end big-button">
                    <div class="col-auto">
                        <button v-if="logic.stack?.length > 0" type="button" class="btn btn-secondary"
                            @click="logic.popStack()">
                            <span>Back to {{ logic.stackTop }}</span>
                        </button>
                    </div>
                    <div class="col"></div>
                    <div class="col-auto">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</template>

<style scoped>
</style>