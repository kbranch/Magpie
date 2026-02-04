<script setup>
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { useTextTooltipStore } from '@/stores/textTooltipStore';
import { computed, onMounted, onUpdated, ref } from 'vue';
import { useStateStore } from '@/stores/stateStore';
import LogicRequirements from './LogicRequirements.vue';

const props = defineProps(['connection', 'nodeId']);

const tip = useTextTooltipStore();
const logic = useLogicViewerStore();
const state = useStateStore();

const tr = ref(null);

const thisEnd = computed(() => props.connection?.badWay ? props.connection.to: props.connection.from);
const otherEnd = computed(() => props.connection?.badWay ? props.connection.from: props.connection.to);

const thisName = computed(() => logic.getLogicNodeName(thisEnd.value));
const otherName = computed(() => logic.getLogicNodeName(otherEnd.value));

onMounted(initTooltips);
onUpdated(initTooltips);

function initTooltips() {
    let tooltipTriggerList = tr.value.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl, { sanitize: false }));
}

</script>

<template>

<div ref="tr" class="row py-2">
    <div class="col-auto">
        <div class="text-start d-flex pe-2 mb-0 align-items-center"
            @mouseover="tip.tooltip(`${state.difficultyByNumber[state.getAbsoluteDifficulty(connection.diff)]} logic`, $event)">
            <div class="tooltip-check-graphic align-middle" :class="{[`difficulty-${connection.diff}`]: true}">
                <div class="tooltip-check-graphic icon-wrapper">
                    <svg class="tooltip-check-graphic align-middle">
                        <use :xlink:href="`#difficulty-${connection.diff}`"></use>
                    </svg>
                </div>
            </div>
        </div>

        <img v-if="connection.badWay" class="logic-item invert pe-2" src="/images/do-not-enter.svg"
            @mouseover="tip.tooltip(`From '${otherName}' to '${thisName}'`, $event)">
        <img v-else-if="connection.oneWay" class="logic-item invert pe-2" src="/images/arrow-right.svg"
            @mouseover="tip.tooltip(`From '${thisName}' to '${otherName}'`, $event)">
        <img v-else class="logic-item invert pe-2" src="/images/arrow-left-right.svg"
            @mouseover="tip.tooltip('Both ways', $event)">

        <img v-if="connection.met" class='connection-met logic-accessibility me-2' src='/images/check2-circle.svg'
            @mouseover="tip.tooltip('Requirement met', $event)">
        <img v-else class='connection-unmet logic-accessibility me-2' src='/images/x-circle.svg'
            @mouseover="tip.tooltip('Requirement not met', $event)">
    </div>

    <div class="col-auto px-0">
        <button type="button" class="btn btn-secondary view-button"
            @click="logic.startTipForm(connection)" @mouseover="tip.tooltip('Suggest a tip for this connection', $event)">
            <img src="/images/plus-lg.svg" class="invert">
        </button>
    </div>

    <div class="col">
        <LogicRequirements :subject="connection" />
    </div>
</div>

<hr class="my-0">

</template>

<style scoped>

.col-auto {
    display: flex;
    align-items: center;
    justify-content: center;
}

.multi-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.unapproved {
    background-color: goldenrod;
}

td {
    height: 100%;
}

.cell-wrapper {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.check-column {
    flex-wrap: nowrap;
}

.check-name {
    white-space: normal;
}

.center-cell {
    justify-content: center;
}

.end-cell {
    justify-content: end;
    flex-wrap: nowrap;
}

.connection-unmet {
    background-color: #900;
}

.connection-met {
    background-color: #090;
}

.logic-accessibility {
    border-radius: 5px;
    padding: 2px;
}

.view-button {
    display: flex;
    align-items: center;
    padding-left: 6px;
    padding-right: 6px;
    height: 100%;
}

</style>