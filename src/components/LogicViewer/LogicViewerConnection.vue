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
    <td>
        <div class="text-start d-flex p-1 mb-0 align-items-center">
            <div class="tooltip-check-graphic difficulty-${connection.diff} align-middle">
                <div class="tooltip-check-graphic icon-wrapper">
                    <svg class="tooltip-check-graphic align-middle"><use xlink:href="#difficulty-${connection.diff}"></use></svg>
                </div>
            </div>
        </div>
    </td>
    <td>
        {{ logic.getLogicNodeName(otherEnd) }}
        <img v-if="connection.badWay" class="logic-item invert" src="/images/do-not-enter.svg"
            data-bs-toggle="tooltip" data-bs-custom-class="secondary-tooltip" data-bs-title="One-way">
    </td>
    <td v-html="iconifyRequirement(connection.shortReq ? connection.shortReq : connection.req)"> </td>
    <td>
        <img v-if="connection.met" class='connection-met logic-accessibility' src='/images/check2-circle.svg'
            data-bs-toggle='tooltip' data-bs-custom-class='secondary-tooltip' data-bs-title='Requirement met'>
        <img v-else class='connection-unmet logic-accessibility' src='/images/x-circle.svg'
            data-bs-toggle='tooltip' data-bs-custom-class='secondary-tooltip' data-bs-title='Requirement not met'>
    </td>
    <td>
        <button type="button" class="btn btn-secondary py-0" @click="logic.pushStack(nodeId, otherEnd)">
            View
        </button>
    </td>
</tr>

</template>

<style scoped>
</style>