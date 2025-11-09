<script setup>
import LogicViewerConnection from './LogicViewerConnection.vue';
import { useTextTooltipStore } from '@/stores/textTooltipStore';
import { useLogicViewerStore } from '@/stores/logicViewerStore';

const tip = useTextTooltipStore();
const logic = useLogicViewerStore();

defineProps(['source', 'otherName', 'connections', 'tips'])

</script>

<template>

<div class="header mb-2 mt-4">

    <button v-if="tips?.length > 0" type="button" class="btn btn-secondary view-button me-2"
        :class="{ 'unapproved': tips?.some(x => !x.approved) }"
        @click="logic.viewTips(otherName, tips)" @mouseover="tip.tooltip('View tips', $event)">
        <img src="/images/info-circle.svg" class="invert">
    </button>
    <button v-else type="button" class="btn btn-secondary view-button me-2"
        @click="logic.startTipForm(otherName)" @mouseover="tip.tooltip('Suggest a tip', $event)">
        <img src="/images/plus-lg.svg" class="invert">
    </button>

    <button type="button" class="btn btn-secondary view-button" @click="logic.pushStack(source, otherName)"
        @mouseover="tip.tooltip(`Move to the '${otherName}' node`, $event)">
        <img src="/images/chevron-right.svg" class="invert">
    </button>

    <h6 class="pt-2 ps-4">{{ otherName }}:</h6>
    
</div>

<hr class="my-0">

<LogicViewerConnection v-for="(connection, index) in connections" :key="connection"
    :connection="connections[index]" :node-id="source.id" />

</template>

<style scoped>

.view-button {
    display: flex;
    align-items: center;
    padding-left: 6px;
    padding-right: 6px;
    height: 100%;
}

.header {
    display: flex;
    align-items: center;
}

h6 {
    font-weight: bold;
}

</style>