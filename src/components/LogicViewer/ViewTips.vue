<script setup>
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { computed, onMounted, onUpdated, ref } from 'vue';
import SingleTip from './SingleTip.vue';
import { useTextTooltipStore } from '@/stores/textTooltipStore';
import LogicRequirements from './LogicRequirements.vue';

const tip = useTextTooltipStore();
const logic = useLogicViewerStore();

const requirementsDiv = ref(null);

// const connection = computed(() => logic.inspectedConnection);
const fromName = computed(() => logic.getLogicNodeName(logic.stackTop));
const toName = computed(() => logic.getLogicNodeName(logic.inspectedOtherNodeId));

onMounted(initTooltips);
onUpdated(initTooltips);

function initTooltips() {
    let tooltipTriggerList = requirementsDiv.value.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl, { sanitize: false }));
}

async function updateTips() {
    console.log("need to implement updating tips");
    // connection.value.tips = await logic.fetchTips([connection.value.id]);
}

</script>

<template>

    <h5 class="d-flex align-items-center">
        <!-- <div class="text-start d-flex p-1 mb-0 align-items-center">
            <div class="tooltip-check-graphic align-middle" :class="{[`difficulty-${connection?.diff}`]: true}">
                <div class="tooltip-check-graphic icon-wrapper">
                    <svg class="tooltip-check-graphic align-middle">
                        <use :xlink:href="`#difficulty-${connection?.diff}`"></use>
                    </svg>
                </div>
            </div>
        </div> -->
        Connections between '{{ fromName }}' and '{{ toName }}'
    </h5>
    <div class="d-flex align-items-center">
        <div ref="requirementsDiv" id="requirementsDiv">
            <!-- <label for="requirementsIcons" class="form-label mt-2">Requirements</label>
            <div id="requirementsIcons" class="cell-wrapper">
                <LogicRequirements :subject="connection" />
            </div> -->
        </div>

        <span class="pe-2">Suggest a new tip</span>
        <button type="button" class="btn btn-secondary view-button"
            @click="logic.startTipForm(connection)" @mouseover="tip.tooltip('Suggest a tip', $event)">
            <img src="/images/plus-lg.svg" class="invert">
        </button>
    </div>

    <div class="accordion mt-2">
        <SingleTip v-for="(tip, index) in logic.activeTips" :key="tip" v-model="logic.activeTips[index]"
            @updatedTips="updateTips()" :expanded="logic.activeTips.length == 1" />
    </div>

</template>

<style scoped>

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