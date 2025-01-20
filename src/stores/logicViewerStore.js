import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { coordDict } from "@/moduleWrappers";

export const useLogicViewerStore = defineStore('logicViewer', () => {
    const graph = ref({});
    const logicByCheck = ref({});
    const logicByEntrance = ref({});
    const inspectedNodeId = ref(null);
    const stack = ref([]);

    const inspectedNode = computed(() => {
        if (inspectedNodeId.value in graph.value) {
            return graph.value[inspectedNodeId.value];
        }

        return inspectedNodeId.value;
    });

    const stackTop = computed(() => stack.value.slice(-1)[0]);

    watch(graph, () => {
        logicByCheck.value = {};
        logicByEntrance.value = {};

        for (const loc in graph.value) {
            for (const check of graph.value[loc].checks) {
                logicByCheck.value[check] = graph.value[loc];
            }

            if ('entrances' in graph.value[loc]) {
                for (const entrance of graph.value[loc].entrances) {
                    logicByEntrance.value[entrance] = graph.value[loc];
                }
            }
        }
    });

    function clearNode() {
        inspectedNodeId.value = null;
    }

    function clearStack() {
        stack.value = [];
    }

    function popStack() {
        inspectedNodeId.value = stack.value.pop();
    }

    function pushStack(currentId, newId) {
        stack.value.push(currentId);
        inspectedNodeId.value = newId;
    }

    function inspectCheck(checkId) {
        if (!(checkId in logicByCheck.value)) {
            inspectedNodeId.value = 'bad-check';
            return;
        }

        clearStack();

        inspectedNodeId.value = logicByCheck.value[checkId].id;
    }

    function inspectEntrance(entranceId) {
        if (!(entranceId in logicByEntrance.value)) {
            inspectedNodeId.value = 'bad-entrance';
            return;
        }

        clearStack();

        inspectedNodeId.value = logicByEntrance.value[entranceId].id;
    }

    function getLogicNodeName(nodeId) {
        if (nodeId in coordDict) {
            return `${coordDict[nodeId].name} (${nodeId})`;
        }

        return nodeId;
    }

    return {
        graph, 
        logicByCheck,
        logicByEntrance,
        inspectedNode,
        stackTop,
        stack,
        clearNode,
        popStack,
        pushStack,
        inspectCheck,
        inspectEntrance,
        getLogicNodeName,
    };
});