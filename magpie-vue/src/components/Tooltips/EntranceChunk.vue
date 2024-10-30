<script setup>
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { openEntranceLogicViewer, graphicalMapType, graphicalMapSource, coupledEntrances, inOutEntrances } from '@/moduleWrappers';
import { computed, onMounted, onUpdated, ref } from 'vue';

const props = defineProps(['node', 'args']);

const helper = ref(null);
const mapType = ref(graphicalMapType);
const mapSource = ref(graphicalMapSource);
const tip = useTextTooltipStore();

const entrance = computed(() => props.node?.entrance);
const connection = computed(() => entrance?.value?.connectedToMetadata());
const connectionType = computed(() => mapSource.value != null ? mapType.value : 'none');
const interiorImage = computed(() => {
    if (connectionType.value == 'simple' && entrance.value.metadata.interiorImage) {
        return `/images/entrances/${entrance.value.metadata.interiorImage}.png`;
    }
    else if(connectionType.value == 'none'
            && entrance.value.isMapped()
            && !['right_taltal_connector1', 'right_taltal_connector2', 'landfill'].includes(entrance.value.connectedTo())) {
        if (connection.value.interiorImage && (entrance.value.isConnectedToInside() || entrance.value.isConnectedToStairs())) {
            return `/images/entrances/${connection.value.interiorImage}.png`;
        }
    }

    return null;
});

onMounted(() => {
    updateHelpers();
})

onUpdated(() => {
    updateHelpers();
})

function updateHelpers() {
    if (!helper.value) {
        return;
    }

    for (const item of helper.value) {
        if (item.dataset && 'bsTitle' in item.dataset) {
            // eslint-disable-next-line no-undef
            let helperTip = new bootstrap.Tooltip(item, { popperConfig: getPopperConfig, animation: false, sanitize: false })

            // Janky fix for tooltips positioning themselves before the images load
            // Relies on animation being off
            helperTip.show();
            helperTip.hide();
        }
    }
}

</script>

<template>

<div class='text-start tooltip-item d-flex p-1 mb-0 align-items-center' :data-entrance-id='entrance.id' oncontextmenu='return false;'>
    <div class='tooltip-check-graphic entrance-only'></div>
    <div class='tooltip-text align-middle ps-2'>
        {{ entrance.metadata.name }}
    </div>
    <button type="button" class="btn btn-secondary p-1 logic-button" @click="openEntranceLogicViewer(entrance.id)" @mouseenter="tip.tooltip('View Logic', $event)">
        <img class="invert" src="/images/diagram-2-fill.svg">
    </button>
</div>

<template v-if="entrance.isRemapped() && connectionType == 'none'">
    <li class="list-group-item text-start tooltip-item">
        <div class='tooltip-text text-start align-middle'>
            To {{entrance.isConnectedToInside() ? 'inside' : 'outside'}} {{connection.name}}
        </div>
    </li>
</template>

<li v-if="entrance.isFound()
          && !entrance.isMappedToSelf()
          && (!entrance.isConnectedToConnector() || !coupledEntrances())
          && connectionType == 'none'
          && (inOutEntrances() || !coupledEntrances())
          && entrance.foundAt()"
    class="list-group-item text-start tooltip-item">

    <div class='tooltip-text text-start align-middle'>
        Found at {{ entrance.foundAt().name }}
    </div>
</li>

<div v-if="interiorImage">
    <img :src="interiorImage">
</div>

</template>