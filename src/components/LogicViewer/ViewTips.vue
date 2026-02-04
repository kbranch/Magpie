<script setup>
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { computed } from 'vue';
import SingleTip from './SingleTip.vue';
import { useTextTooltipStore } from '@/stores/textTooltipStore';

const tip = useTextTooltipStore();
const logic = useLogicViewerStore();

const fromName = computed(() => logic.getLogicNodeName(logic.stackTop));
const toName = computed(() => logic.getLogicNodeName(logic.inspectedOtherNodeId));

async function updateTips() {
    logic.activeTips = (await logic.fetchTips(logic.stackTop))
        .filter(x => x.node1 == logic.inspectedOtherNodeId || x.node2 == logic.inspectedOtherNodeId);
}

</script>

<template>

    <h5 class="d-flex align-items-center">
        Connections between '{{ fromName }}' and '{{ toName }}'
    </h5>

    <div class="accordion mt-2">
        <SingleTip v-for="(tip, index) in logic.activeTips" :key="tip" v-model="logic.activeTips[index]"
            @updatedTips="updateTips()" :expanded="logic.activeTips.length == 1" />
    </div>

</template>

<style scoped>

.view-button {
    display: flex;
    align-items: center;
    padding-left: 6px;
    padding-right: 6px;
    height: 100%;
}

</style>