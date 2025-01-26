import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { coordDict } from "@/moduleWrappers";
import { useStateStore } from "./stateStore";

export const useLogicViewerStore = defineStore('logicViewer', () => {
    const state = useStateStore();

    const graph = ref({});
    const logicByCheck = ref({});
    const logicByEntrance = ref({});
    const inspectedNodeId = ref(null);
    const inspectedConnection = ref(null);
    const stack = ref([]);
    
    const tipsUrlPrefix = computed(() => state.isLocal ? 'https://magpietracker.us' : import.meta.env.VITE_API_URL);

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
        inspectedConnection.value = null;
    }

    function clearStack() {
        stack.value = [];
        inspectedConnection.value = null;
    }

    function popStack() {
        inspectedNodeId.value = stack.value.pop();
        inspectedConnection.value = null;
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

    function startTipForm(connection) {
        pushStack(inspectedNodeId.value, 'submission-form');
        inspectedConnection.value = connection;
    }

    function viewTips(connection) {
        pushStack(inspectedNodeId.value, 'tips');
        inspectedConnection.value = connection;
    }

    function iconifyRequirement(requirement) {
        const itemRegex = /([^/A-Z_1-8]|^)('?[A-Z_1-8]{3,}'?)/g;
        const quoteRegex = /\/'([A-Z_1-8]{2,})'_1\.png/g;
        const tooltipRegex = /(\w+)\(([^)]+)\)/g;
        const wrapperRegex = /\((?:and|or)\[('[A-Z_1-8]{3,}')\]\)/g;

        requirement = requirement
            .replaceAll('\\', '')
            .replaceAll('"', '')
            .replaceAll("and['TRUE']", 'None')
            .replaceAll("or['FALSE']", 'Disabled')
            .replace(wrapperRegex, '($1)')
            .replace(itemRegex, `$1<img class="logic-item" src="/images/$2_1.png">`)
            .replace(quoteRegex, '/$1_1.png')
            .replaceAll("'", "")
            .replace(tooltipRegex, `<span data-bs-toggle='tooltip' data-bs-custom-class="secondary-tooltip" data-bs-html='true' data-bs-title='$2'>$1</span>`);

        return requirement
    }

    async function submitTip(connectionId, language, body, attribution, title, anonymous, permission) {
        const invalidFields = [];

        if (!body) {
            invalidFields.push('body');
        }

        if (!attribution && !anonymous) {
            invalidFields.push('attribution');
        }

        if (!title) {
            invalidFields.push('title');
        }

        if (!permission) {
            invalidFields.push('permission');
        }

        if (invalidFields.length) {
            return {
                success: false,
                message: 'One or more invalid fields',
                invalidFields: invalidFields,
            };
        }

        let response = null

        try {
            response = await fetch(`${tipsUrlPrefix.value}/api/newTip`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    connectionId: connectionId,
                    language: language,
                    body: body,
                    attribution: attribution,
                    title: title,
                })
            });
        }
        catch (err) {
            return {
                success: false,
                message: err,
            }
        }

        return {
            success: response.ok,
            message: await response.text(),
        };
    }

    return {
        tipsUrlPrefix,
        graph, 
        logicByCheck,
        logicByEntrance,
        inspectedNode,
        stackTop,
        stack,
        inspectedConnection,
        clearNode,
        popStack,
        pushStack,
        inspectCheck,
        inspectEntrance,
        getLogicNodeName,
        startTipForm,
        viewTips,
        iconifyRequirement,
        submitTip,
    };
});