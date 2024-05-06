<script setup>
import { canBeStart, setStartLocation, startGraphicalConnection, getInsideOutEntrance, connectEntrances } from '@/moduleWrappers.js';
import { computed, onMounted, onUpdated, ref } from 'vue';

const props = defineProps(['node', 'args']);

const helper = ref(null);

const entrance = computed(() => props.node?.entrance);

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
<template v-if="node.pinned">
    <li v-if="canBeStart(node)" class="list-group-item text-start tooltip-item p-1 text-align-middle" :data-node-id="node.id()" @click="setStartLocation(entrance.id)" oncontextmenu="return false;">
        Set as start location
    </li>
    <div v-if="node.entranceOptions()" class="btn-group dropend">
        <button type="button" class="btn tooltip-item text-start p-1" @click="startGraphicalConnection(entrance.id, 'simple')">
            {{ args.entranceshuffle != 'none' ? 'Connect to simple entrance...' : 'Connect to...' }}
        </button>
        <button type="button" class="btn tooltip-item dropdown-toggle dropdown-toggle-split px-2 text-end" data-bs-toggle="dropdown" aria-expanded="false"></button>
        <ul class="dropdown-menu">
            <li v-for="option in node.entranceOptions()" :key="option.id">
                <button class="dropdown-item tooltip-item" type="button" :data-value="option.id"
                    @click="connectEntrances(entrance.id, entrance.isInside() ? option.id : getInsideOutEntrance(option.id))">
                    {{ option.name }}
                    <img ref="helper" v-if="option.interiorImage" class='helper' src='/images/light-question-circle.svg'
                        data-bs-toggle='tooltip' data-bs-html='true' :data-bs-title='`<img src="/images/entrances/${option.interiorImage}.png">`'>
                </button>
            </li>
        </ul>
    </div>
</template>
</template>

<style scoped>
.dropdown-menu {
    background-color: black;
}
</style>