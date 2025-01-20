<script setup>
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { computed } from 'vue';

const connection = defineModel();
defineProps(['nodeId']);

const logic = useLogicViewerStore();

const otherEnd = computed(() => connection.value?.badWay ? connection.value.from: connection.value.to);

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

</script>

<template>

<tr>
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
                data-bs-toggle="tooltip" data-bs-custom-class="secondary-tooltip" data-bs-title="One-way">
        </div>
    </td>
    <td>
        <div class="cell-wrapper" v-html="iconifyRequirement(connection.shortReq ? connection.shortReq : connection.req)">
        </div>
    </td>
    <td>
        <div class="cell-wrapper center-cell">
            <img v-if="connection.met" class='connection-met logic-accessibility' src='/images/check2-circle.svg'
                data-bs-toggle='tooltip' data-bs-custom-class='secondary-tooltip' data-bs-title='Requirement met'>
            <img v-else class='connection-unmet logic-accessibility' src='/images/x-circle.svg'
                data-bs-toggle='tooltip' data-bs-custom-class='secondary-tooltip' data-bs-title='Requirement not met'>
        </div>
    </td>
    <td>
        <div class="cell-wrapper end-cell">
            <button type="button" class="btn btn-secondary view-button py-0" @click="logic.pushStack(nodeId, otherEnd)">
                View
            </button>
        </div>
    </td>
</tr>

</template>

<style scoped>

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