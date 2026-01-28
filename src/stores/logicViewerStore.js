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
    const inspectedOtherNodeId = ref(null);
    const activeTips = ref([]);
    const tipNode1 = ref(null);
    const tipNode2 = ref(null);
    const tipDefaultDifficulty = ref(1);
    const tipDefaultRequirement = ref('');
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
        let connectionNodes = {};

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

            for (const connection of node.connections) {
                if (!(connection.id in connectionNodes)) {
                    connectionNodes[connection.id] = [connection.from, connection.to, connection.diff];
                }
            }
        }

        console.log(JSON.stringify(connectionNodes));
    });

    function clearNode() {
        inspectedNodeId.value = null;
        inspectedOtherNodeId.value = null;
    }

    function clearStack() {
        stack.value = [];
        inspectedOtherNodeId.value = null;
        inspectedTrick.value = null;
        parentTip.value = null;
    }

    function popStack() {
        inspectedNodeId.value = stack.value.pop();
        inspectedOtherNodeId.value = null;
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
        let otherNode = inspectedOtherNodeId.value;
        if (inspectedNodeId.value == 'tips') {
            popStack();
        }

        parentTip.value = null;

        if (subject) {
            // This could either be a connection or a trick - if it's a connection, copy some of it
            parentTip.value = {
                difficulty: state.getAbsoluteDifficulty(subject?.diff ?? 0),
                requirement: subject?.shortReq ?? subject?.req,
            }

            tipNode1.value = subject.to ?? subject;
            tipNode2.value = subject.from ?? null;
        }
        else {
            tipNode1.value = stack.value[stack.value.length - 1];
            tipNode2.value = otherNode;
        }

        pushStack(inspectedNodeId.value, 'submission-form');
    }

    function viewTips(otherId, tips) {
        tipNode1.value = inspectedNodeId.value;
        tipNode2.value = otherId;
        pushStack(inspectedNodeId.value, 'tips');
        inspectedOtherNodeId.value = otherId;
        activeTips.value = tips;
    }

    function editTip(tip) {
        let isTrick = !tip.node2;

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
            parentTip.value = tip;

            pushStack(stack.value[stack.value.length - 1], 'submission-form');
        }
    }

    function viewTrick(name, requirements) {
        if (inspectedOtherNodeId.value) {
            popStack();
        }

        pushStack(inspectedNodeId.value, `trick`);
        inspectedTrick.value = {
            name: name,
            requirements: requirements,
        };
    }

    async function submitTip(language, body, attribution, title, anonymous, permission, parentId, difficulty, node1, node2, requirement) {
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
                    language: language,
                    body: body,
                    attribution: attribution,
                    title: title,
                    parentId: parentId,
                    difficulty: difficulty,
                    node1: node1,
                    node2: node2,
                    requirement: requirement,
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
        inspectedOtherNodeId,
        inspectedTrick,
        stackTop,
        stack,
        parentTip,
        activeTips,
        tipNode1,
        tipNode2,
        tipDefaultDifficulty,
        tipDefaultRequirement,
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