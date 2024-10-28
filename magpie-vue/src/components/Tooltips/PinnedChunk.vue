<script setup>
import { canBeStart, setStartLocation, startGraphicalConnection, getInsideOutEntrance, connectEntrances,
    startIsSet, openDeadEndDialog, mapToLandfill, spoilEntrance, clearEntranceMapping, spoilerLogExists,
    } from '@/moduleWrappers.js';
import { computed, onMounted, onUpdated, ref } from 'vue';

const props = defineProps(['node', 'args']);

const helper = ref(null);

const entrance = computed(() => props.node?.entrance);
const mapTarget = computed(() => entrance.value.isInside() ? 'overworld' : 'underworld');

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
    <hr class="m-1">
    <li v-if="canBeStart(node)" class="list-group-item text-start tooltip-item p-1 text-align-middle" :data-node-id="node.id()"
        @click="setStartLocation(entrance.id)" oncontextmenu="return false;">

        Set as start location
    </li>
    <template v-if="startIsSet()">
        <li v-if="node.usesConnectorDialog() && (!entrance.isMapped() || entrance.isIncompleteConnection())"
            class="list-group-item text-start tooltip-item p-1 text-align-middle"
            @click="startGraphicalConnection(entrance.id, 'connector')" oncontextmenu="return false;">

            Connect to via connector...
            <img class="helper" data-bs-toggle="tooltip" data-bs-custom-class="secondary-tooltip"
                data-bs-title="Used when you can access at least two entrances of a connector" src="/images/light-question-circle.svg">
        </li>

        <template v-if="!entrance.isMapped()">
            <li v-if="node.usesConnectorDialog()"
                class="list-group-item text-start tooltip-item p-1 text-align-middle"
                @click="openDeadEndDialog(entrance.id)" oncontextmenu="return false;">

                Connect one connector end...
                <img class="helper" data-bs-toggle="tooltip" data-bs-custom-class="secondary-tooltip"
                    data-bs-title="Used when you can only access one entrance of a connector" src="/images/light-question-circle.svg">
            </li>
            <template v-if="node.usesAdvancedErInOut()">
                <li class="list-group-item text-start tooltip-item p-1 text-align-middle" @click="startGraphicalConnection(entrance.id, mapTarget)" oncontextmenu="return false;">
                    Connect to {{ mapTarget }}...
                </li>
            </template>
            <template v-else-if="node.usesAdvancedEr()">
                <li class="list-group-item text-start tooltip-item p-1 text-align-middle" @click="startGraphicalConnection(entrance.id, 'overworld')" oncontextmenu="return false;">
                    Connect to overworld...
                </li>
                <li class="list-group-item text-start tooltip-item p-1 text-align-middle" @click="startGraphicalConnection(entrance.id, 'underworld')" oncontextmenu="return false;">
                    Connect to underworld...
                </li>
            </template>
        </template>

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

        <template v-if="entrance.canBeLandfill()">
            <li class="list-group-item text-start tooltip-item p-1 text-align-middle" @click="mapToLandfill(entrance.id)" oncontextmenu="return false;">
                Mark as useless
            </li>
        </template>

        <template v-if="spoilerLogExists()">
            <li class="list-group-item text-start tooltip-item p-1 text-align-middle" @click="spoilEntrance(entrance.id)" oncontextmenu="return false;">
                Spoil entrance
            </li>
        </template>

        <template v-if="entrance.canBeCleared()">
            <li class="list-group-item text-start tooltip-item p-1 text-align-middle" @click="clearEntranceMapping(entrance.id)" oncontextmenu="return false;">
                Clear mapping
            </li>
        </template>

    </template>
</template>

<style scoped>
.dropdown-menu {
    background-color: black;
}
</style>