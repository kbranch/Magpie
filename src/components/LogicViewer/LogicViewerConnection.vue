<script setup>
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { useTextTooltipStore } from '@/stores/textTooltipStore';
import { computed, onMounted, onUpdated, ref } from 'vue';

const connection = defineModel();
defineProps(['nodeId']);

const tip = useTextTooltipStore();
const logic = useLogicViewerStore();

const tr = ref(null);

const otherEnd = computed(() => connection.value?.badWay ? connection.value.from: connection.value.to);

onMounted(initTooltips);
onUpdated(initTooltips);

function initTooltips() {
    let tooltipTriggerList = tr.value.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl, { sanitize: false }));
}

</script>

<template>

<tr ref="tr">
    <td class="pe-0">
        <div class="cell-wrapper">
            <div class="text-start d-flex p-1 mb-0 align-items-center">
                <div class="tooltip-check-graphic align-middle" :class="{[`difficulty-${connection.diff}`]: true}">
                    <div class="tooltip-check-graphic icon-wrapper">
                        <svg class="tooltip-check-graphic align-middle">
                            <use :xlink:href="`#difficulty-${connection.diff}`"></use>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </td>
    <td>
        <div class="cell-wrapper">
            {{ logic.getLogicNodeName(otherEnd) }}
            <img v-if="connection.badWay" class="logic-item invert ps-2" src="/images/do-not-enter.svg"
                @mouseover="tip.tooltip('One-way', $event)">
        </div>
    </td>
    <td>
        <div class="cell-wrapper" v-html="logic.iconifyRequirement(connection.shortReq ? connection.shortReq : connection.req)">
        </div>
    </td>
    <td>
        <div class="cell-wrapper center-cell">
            <img v-if="connection.met" class='connection-met logic-accessibility' src='/images/check2-circle.svg'
                @mouseover="tip.tooltip('Requirement met', $event)">
            <img v-else class='connection-unmet logic-accessibility' src='/images/x-circle.svg'
                @mouseover="tip.tooltip('Requirement not met', $event)">
        </div>
    </td>
    <td>
        <div class="cell-wrapper end-cell">
            <button v-if="connection.tips?.length > 0" type="button" class="btn btn-secondary view-button me-2"
                @click="logic.viewTips(connection)" @mouseover="tip.tooltip('View tips', $event)">
                <img src="/images/info-circle.svg" class="invert">
            </button>
            <button v-else type="button" class="btn btn-secondary view-button me-2"
                @click="logic.startTipForm(connection)" @mouseover="tip.tooltip('Suggest a tip', $event)">
                <img src="/images/plus-lg.svg" class="invert">
            </button>

            <button type="button" class="btn btn-secondary view-button py-0" @click="logic.pushStack(nodeId, otherEnd)"
                @mouseover="tip.tooltip('View node', $event)">
                <img src="/images/chevron-right.svg" class="invert">
            </button>
        </div>
    </td>
</tr>

</template>

<style scoped>

.view-button {
    display: flex;
    align-items: center;
    padding-left: 6px;
    padding-right: 6px;
    height: 100%;
}

td {
    height: 100%;
}

.cell-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    flex-wrap: wrap;
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

</style>