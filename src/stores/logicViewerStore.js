import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { closeAllTooltips, coordDict } from "@/moduleWrappers";
import { useStateStore } from "./stateStore";

export const useLogicViewerStore = defineStore('logicViewer', () => {
    const state = useStateStore();

    const graph = ref({});
    const logicByCheck = ref({});
    const logicByEntrance = ref({});
    const logicByForcedItem = ref({});
    const inspectedNodeId = ref(null);
    const inspectedTrick = ref(null);
    const inspectedConnection = ref(null);
    const stack = ref([]);
    const parentTip = ref(null);
    
    const tipsUrlPrefix = computed(() => state.isLocal ? 'https://magpietracker.us' : import.meta.env.VITE_TIPS_URL);

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
        logicByForcedItem.value = {};

        for (const loc in graph.value) {
            const node = graph.value[loc];

            for (const check of node.checks) {
                logicByCheck.value[check] = node;
            }

            if ('entrances' in node) {
                for (const entrance of node.entrances) {
                    logicByEntrance.value[entrance] = node;
                }
            }

            if (node.forcedItems) {
                for (const item of node.forcedItems) {
                    logicByForcedItem.value[item] = node;
                }
            }
        }
    });

    function getConnectionById(connectionId) {
        try {
            let nodes = Object.values(graph.value)
                .filter(n => n.connections.filter(c => c.id == connectionId).length);

            return nodes[0].connections.filter(c => c.id == connectionId)[0];
        }
        catch(err) {
            console.log(`Error finding connection with id '${connectionId}'`, err);
        }

        return null;
    }

    function clearNode() {
        inspectedNodeId.value = null;
        inspectedConnection.value = null;
    }

    function clearStack() {
        stack.value = [];
        inspectedConnection.value = null;
        inspectedTrick.value = null;
        parentTip.value = null;
    }

    function popStack() {
        inspectedNodeId.value = stack.value.pop();
        inspectedConnection.value = null;
        parentTip.value = null;

        if (inspectedNodeId.value != 'trick') {
            inspectedTrick.value = null;
        }

        closeAllTooltips();
    }

    function pushStack(currentId, newId) {
        stack.value.push(currentId);
        inspectedNodeId.value = newId;

        closeAllTooltips();
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

    function startTipForm(subject) {
        if (inspectedNodeId.value == 'tips') {
            popStack();
        }

        pushStack(inspectedNodeId.value, 'submission-form');

        if (!inspectedTrick.value) {
            inspectedConnection.value = subject;
        }
    }

    function viewTips(connection) {
        pushStack(inspectedNodeId.value, 'tips');
        inspectedConnection.value = connection;
    }

    function editTip(tip) {
        let connection = getConnectionById(tip.connectionId);

        let isTrick = !connection;

        if (isTrick) {
            if (!inspectedTrick.value) {
                inspectedTrick.value = {
                    name: tip.connectionId,
                    requirements: 'unknown'
                };
            }

            parentTip.value = tip;
            pushStack('trick', 'submission-form');
        }
        else {
            clearStack();

            parentTip.value = tip;

            pushStack(connection.from, 'submission-form');
            inspectedConnection.value = connection;
        }
    }

    function viewTrick(name, requirements) {
        if (inspectedConnection.value) {
            popStack();
        }

        pushStack(inspectedNodeId.value, `trick`);
        inspectedTrick.value = {
            name: name,
            requirements: requirements,
        };
    }

    async function submitTip(connectionId, language, body, attribution, title, anonymous, permission, parentId) {
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
                    parentId: parentId,
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

    async function fetchTips(nodeId) {
        let params = {
            node: nodeId,
        };

        if (import.meta.env.VITE_TIP_ADMIN === '1') {
            params.includeUnapproved = true;
        }

        let response = await fetch(`${tipsUrlPrefix.value}/api/tips?${new URLSearchParams(params)}`);

        if (!(response?.ok)) {
            let error = await response.text();
            console.log(`Error getting connection tips: ${error}`);
            
            return;
        }

        return await response.json();
    }

    async function fetchApprovalQueue() {
        let response = await fetch(`${tipsUrlPrefix.value}/api/tipApprovalQueue`);

        return await response.json();
    }

    function editFirstInQueue() {
        fetchApprovalQueue()
            .then((tips) => {
                if(tips) { 
                    editTip(tips[0]);
                }
            });
    }

    async function approveTip(tip, newApproval) {
        let form = new FormData();
        form.append('tipId', tip.tipId);
        form.append('newApproval', newApproval);
        form.append('adminKey', import.meta.env.VITE_TIP_ADMIN_KEY);

        await fetch(`${tipsUrlPrefix.value}/api/approveTip`, {
            method: 'POST',
            body: form,
        });
    }

    async function deleteTip(tip) {
        let form = new FormData();
        form.append('tipId', tip.tipId);
        form.append('adminKey', import.meta.env.VITE_TIP_ADMIN_KEY);

        await fetch(`${tipsUrlPrefix.value}/api/deleteTip`, {
            method: 'POST',
            body: form,
        });
    }

    async function revertTipEdit(tip) {
        let form = new FormData();
        form.append('tipId', tip.tipId);
        form.append('adminKey', import.meta.env.VITE_TIP_ADMIN_KEY);

        await fetch(`${tipsUrlPrefix.value}/api/revertTipEdit`, {
            method: 'POST',
            body: form,
        });
    }

    window.editFirstInQueue = editFirstInQueue;

    return {
        tipsUrlPrefix,
        graph, 
        logicByCheck,
        logicByEntrance,
        logicByForcedItem,
        inspectedNode,
        inspectedTrick,
        stackTop,
        stack,
        inspectedConnection,
        parentTip,
        clearNode,
        popStack,
        pushStack,
        inspectCheck,
        inspectEntrance,
        getLogicNodeName,
        startTipForm,
        viewTips,
        submitTip,
        editTip,
        approveTip,
        deleteTip,
        revertTipEdit,
        viewTrick,
        fetchTips,
    };
});