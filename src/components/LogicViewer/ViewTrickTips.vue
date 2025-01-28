<script setup>
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { computed, onMounted, onUpdated, ref } from 'vue';
import SingleTip from './SingleTip.vue';
import { useTextTooltipStore } from '@/stores/textTooltipStore';
import LogicRequirements from './LogicRequirements.vue';

const tip = useTextTooltipStore();
const logic = useLogicViewerStore();

const requirementsDiv = ref(null);
const tips = ref([]);

onMounted(() => {
    initTooltips();
    updateTips();
});

onUpdated(initTooltips);

const trick = computed(() => logic.inspectedTrick);

function initTooltips() {
    let tooltipTriggerList = requirementsDiv.value.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl, { sanitize: false }));
}

async function updateTips() {
    let connectionIds = JSON.stringify([trick.value.name]);
    let response = await fetch(`${logic.tipsUrlPrefix}/api/tips?${new URLSearchParams({ connectionIds: connectionIds })}`);

    if (!(response?.ok)) {
        let error = await response.text();
        console.log(`Error getting connection tips: ${error}`);
        
        return;
    }

    let serverTips = await response.json();

    tips.value = serverTips;
}

</script>

<template>

    <div class="d-flex align-items-center">
        <div ref="requirementsDiv" id="requirementsDiv">
            <label for="requirementsIcons" class="form-label mt-2">Requirements</label>
            <div id="requirementsIcons" class="cell-wrapper">
                <LogicRequirements :subject="trick" />
            </div>
        </div>
        <button type="button" class="btn btn-secondary view-button"
            @click="logic.startTipForm(trick)" @mouseover="tip.tooltip('Suggest a tip', $event)">
            <img src="/images/plus-lg.svg" class="invert">
        </button>
    </div>

    <div class="accordion mt-2">
        <SingleTip v-for="(tip, index) in tips" :key="tip" v-model="tips[index]"
            @updatedTips="updateTips()" :expanded="tips.length == 1" />
        <h3 id="noTips" v-if="tips.length == 0">
            No tips found
        </h3>
    </div>

</template>

<style scoped>

#noTips {
    width: 100%;
    display: flex;
    justify-content: center;
}

#requirementsDiv {
    flex-grow: 1;
}

.view-button {
    display: flex;
    align-items: center;
    padding-left: 6px;
    padding-right: 6px;
    height: 100%;
}

</style>