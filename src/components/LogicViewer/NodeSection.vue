<script setup>
import LogicViewerEntrance from './LogicViewerEntrance.vue';
import LogicViewerCheck from './LogicViewerCheck.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useAccessibilityStore } from '@/stores/accessibilityStore';
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { sortByKey } from '@/moduleWrappers';
import { useTextTooltipStore } from '@/stores/textTooltipStore';
import ConnectedNode from './ConnectedNode.vue';

const tip = useTextTooltipStore();
const logic = useLogicViewerStore();
const accessibility = useAccessibilityStore();

const connections = ref([]);
const connectedNodes = computed(() => {
    let nodeConnections = {};

    for (const conn of node.value.connections ?? []) {
        let otherNode = conn.to == node.value.id ? conn.from : conn.to;
        if (!(otherNode in nodeConnections)) {
            nodeConnections[otherNode] = [];
        }

        nodeConnections[otherNode].push(conn);
    }

    return nodeConnections;
});

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

    let conns = node.value.connections?.filter(conn => conn.to in logic.graph);

    let connectionsByName = {};
    conns.forEach(x => connectionsByName[x.from + x.to] = []);
    conns.forEach(x => connectionsByName[x.from + x.to].push(x));

    for (const name in connectionsByName) {
        let lastReq = null;
        for (const conn of sortByKey(connectionsByName[name], x => x.diff)) {
            let originalReq = conn.shortReq ? conn.shortReq : conn.req;

            if (lastReq) {
                if (conn.shortReq) {
                    conn.shortReq = conn.shortReq.replaceAll('\\', '');
                    conn.shortReq = conn.shortReq.replace(`, "${lastReq}"`, '');
                    conn.shortReq = conn.shortReq.replace(`, '${lastReq}'`, '');
                }
                else {
                    conn.req = conn.req.replace(`, ${lastReq}`, '');
                }
            }

            if (conn.req.includes('and[') || conn.req.includes('or[')) {
                lastReq = originalReq.replaceAll('\\', '');
            }
        }
    }

    connections.value = conns;

    await fetchTips();
}

async function fetchTips() {
    let tips = await logic.fetchTips(node.value.id);

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
    <template v-if="(checks?.length ?? 0) == 0">None</template>

    <LogicViewerCheck v-else v-for="(check, index) in checks" :key="check.id"
        v-model="checks[index]" />
</div>

<template v-if="node.forcedItems">
    <h6 class="pt-2">Forced or special items:</h6>
    <img v-for="item in node.forcedItems" :key="item" class="logic-item" :src="`/images/${item}_1.png`"
        @mouseover="tip.tooltip(item, $event)" />
</template>

<h5 class="pt-3">Entrances:</h5>
<div>
    <template v-if="(node.entrances?.length ?? 0) == 0">None</template>

    <LogicViewerEntrance v-else v-for="(entrance, index) in entrances" :key="entrance.id"
        v-model="entrances[index]" />
</div>

<h5 class="pt-3">Connected nodes:</h5>
<div>
    <ConnectedNode v-for="otherNode in Object.keys(connectedNodes)" :key="otherNode"
        :otherName="otherNode" :source="node.id" :connections="connectedNodes[otherNode]" />
</div>

</template>

<style scoped>

h5 {
    font-weight: bold;
}

</style>