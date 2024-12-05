<script setup>
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';
import { toggleSingleNodeCheck, openCheckLogicViewer, getPopperConfig } from '@/moduleWrappers.js';
import { onMounted, onUpdated, ref, computed } from 'vue';
import ItemDropdown from '@/components/Tooltips/ItemDropdown.vue';

const props = defineProps(['uniqueCheck', 'show'])

const tip = useTextTooltipStore();

const button = ref(null);

const subChecks = computed(() => {
    if (props.uniqueCheck?.checks[0].checked) {
        return [props.uniqueCheck.checks[0]];
    }

    return props.uniqueCheck?.checks;
});

onMounted(() => {
    updateHelper();
})

onUpdated(() => {
    updateHelper();
})

function updateHelper() {
    if ('bsTitle' in button.value.dataset) {
        // eslint-disable-next-line no-undef
        let helperTip = new bootstrap.Tooltip(button.value, { popperConfig: getPopperConfig, animation: false, sanitize: false })

        // Janky fix for tooltips positioning themselves before the images load
        // Relies on animation being off
        helperTip.show();
        helperTip.hide();
    }
}
</script>

<template>
<button ref="button" type="button" @click="toggleSingleNodeCheck(`#tooltip-check-${uniqueCheck.id}`)" class="btn tooltip-item text-start p-0"
    :data-bs-toggle="'image' in uniqueCheck.checks[0].metadata ? 'tooltip' : null" data-bs-html="true" 
    :data-bs-title='"image" in uniqueCheck.checks[0].metadata ? `<img src="/static/images/checks/${uniqueCheck.checks[0].metadata.image}.png">` : null'>
    <li class="list-group-item tooltip-check">
        <div :id="`tooltip-check-${uniqueCheck.id}`" class='text-start d-flex p-1 mb-0 align-items-center' :data-check-id='uniqueCheck.id' :data-vanilla="uniqueCheck.checks[0].isVanilla ? true : null">
            <div v-for="subCheck in subChecks" :key="subCheck.id" class='tooltip-check-graphic align-middle' :class="[`difficulty-${subCheck.checked ? 'checked' : subCheck.difficulty}`, subCheck.isVanilla ? 'vanilla' : '']">
                <div class='tooltip-check-graphic icon-wrapper' :class="[{ 'behind-keys': subCheck.behindKeys },
                                                                            { 'requires-rupees': subCheck.requiredRupees },
                                                                            { 'behind-tracker': subCheck.behindTrackerLogic },
                                                                            { 'owl': subCheck.isOwl() }]">
                    <div v-if="subCheck.requiredRupees && !subCheck.checked" class='behind-rupees-overlay'></div>
                    <div v-if="subCheck.behindKeys && !subCheck.checked" class='behind-keys-overlay'></div>
                    <div v-if="subCheck.behindTrackerLogic && !subCheck.checked" class='behind-tracker-overlay'></div>
                    <div v-if="subCheck.isOwl() && !subCheck.checked" class='owl-overlay'></div>
                    <svg class='tooltip-check-graphic align-middle'>
                        <use :xlink:href="`#difficulty-${subCheck.checked ? 'checked' : subCheck.difficulty}${subCheck.isVanilla ? '-vanilla' : ''}`"></use>
                    </svg>
                    <svg v-if="subCheck.hollow && !subCheck.checked" class='tooltip-check-graphic hollow align-middle'>
                        <use :xlink:href="`#difficulty-${subCheck.checked ? 'checked' : subCheck.difficulty}-hollow`"></use>
                    </svg>
                </div>
                <img v-if="subCheck.item" class="node-item-overlay" :data-node-item="subCheck.item" :src="`/images/${subCheck.item}_1.png`" onmousedown="preventDoubleClick(event)">
            </div>
            <div class='tooltip-text ps-2'>
                <span class='tooltip-text-span'>
                    {{ uniqueCheck.checks[0].metadata.name }}
                    <img v-if="'image' in uniqueCheck.checks[0].metadata" class='helper' src='/images/light-question-circle.svg'>
                </span>
            </div>
        </div>
    </li>
</button>
<div class="col-auto">
    <button type="button" class="btn btn-secondary p-1 logic-button" @click="openCheckLogicViewer(uniqueCheck.id)" @mouseenter="tip.tooltip('View Logic', $event)">
        <img class="invert" src="/images/diagram-2-fill.svg">
    </button>
</div>
<ItemDropdown :active="show" :check-id="uniqueCheck.id" />
</template>