<script setup>
import { toggleCheck, itemsByLocation } from '@/moduleWrappers.js';
import { itemNames } from '@/metadata/itemNames';
import { ref } from 'vue';

defineProps({
    area: {
        required: true,
    },
    checks: {
        required: true,
    },
});

const activatedGroups = ref(new Set());
</script>

<template>
<div class="text-check-card-wrapper col-xxl-2 col-lg-3 col-md-4 col-sm-6 col-12 px-1 py-1" :data-area="area">
    <div class="card magpie-colors text-check-card">
        <div class="card-header">
            {{ area }}
        </div>
        <div class="card-body">
            <ul class="list-group list-group-flush px-2">
                <div v-for="group in checks" :key="group.check.signature()" class="row">
                    <hr v-if="group != checks[0]">
                    <div class="text-check-col col pe-0">
                        <li class="text-check" @click="toggleCheck($event, group.check.id)">
                            <div class="check-name">
                                <div v-for="check in group.allChecks" :key="check.signature()" class="text-check-graphic-wrapper">
                                    <div :class="`text-check-graphic${check.behindTrackerLogic ? ' behind-tracker' : ''}${check.behindKeys ? ' behind-keys' : ''}${check.requiredRupees ? ' requires-rupees' : ''}${check.isOwl() ? ' owl' : ''}`">
                                        <div class="node-overlay-wrapper" :data-difficulty="check.nodeDifficulty()">
                                            <div :class="`icon-wrapper icon-difficulty-${check.nodeDifficulty()}`">
                                                <svg class="icon text-icon">
                                                    <use :xlink:href="`#difficulty-${check.nodeDifficulty()}${check.isVanilla ? '-vanilla' : ''}`"></use>
                                                </svg>
                                                <svg v-if="check.hollow" class="icon hollow text-icon">
                                                    <use :xlink:href="`#difficulty-${check.nodeDifficulty()}-hollow`"></use>
                                                </svg>
                                            </div>
                                            <div v-if="check.behindKeys" class="behind-keys-overlay"></div>
                                            <div v-if="check.behindTrackerLogic" class="behind-tracker-overlay"></div>
                                            <div v-if="check.requiredRupees" class="behind-rupees-overlay"></div>
                                            <div v-if="check.isVanillaOwl()" class="owl-overlay"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="check-text" onmousedown="preventDoubleClick(event)">
                                    <img v-if="group.check.item" class="text-icon-item" :src="`/images/${group.check.item}_1.png`">
                                    {{ group.check.metadata.name }}
                                </div>
                            </div>
                        </li>
                    </div>
                    <div class="col-auto ps-0 pe-0">
                        <div class="btn-group dropend">
                            <button type="button" class="btn hidden"></button>
                            <button type="button" class="btn tooltip-item dropdown-toggle dropdown-toggle-split ps-4 pe-2 text-end" :data-check-id="group.id" @click="activatedGroups.add(group.id)" data-bs-toggle="dropdown" aria-expanded="false"></button>
                            <ul :id="`text-${group.id}`" class="dropdown-menu text-dropdown">
                                <li>
                                    <button class="dropdown-item tooltip-item plando-item" type="button" data-item="" :onclick="`setCheckContents('${group.id}', '');`">
                                        <div class="check-item-image-wrapper me-2">
                                        </div>
                                        Unknown
                                    </button>
                                </li>
                                <li v-if="group.id in itemsByLocation">
                                    <button class="dropdown-item tooltip-item plando-item" type="button" data-item="" :onclick="`spoilLocation('${group.id}')`">
                                        <div class="check-item-image-wrapper me-2">
                                        </div>
                                        Load from spoiler log
                                    </button>
                                </li>
                                <template v-if="activatedGroups.has(group.id)">
                                    <li v-for="item in Object.keys(itemNames)" :key="item">
                                        <button class="dropdown-item tooltip-item plando-item" type="button" :data-item="item" :onclick="`setCheckContents('${group.id}', '${item}');`">
                                            <div class="check-item-image-wrapper me-2">
                                                <img class="check-item-image" :src="`/images/${item}_1.png`">
                                            </div>
                                            {{ itemNames[item] }}
                                        </button>
                                    </li>
                                </template>
                            </ul>
                        </div>
                    </div>
                </div>
            </ul>
        </div>
    </div>
</div>
</template>

<style scoped>
.text-icon-item {
    margin-left: -4px;
    margin-right: 4px;
}

hr {
    margin: 0;
    padding: 0;
    margin-top: 2px;
    margin-bottom: 2px;
    border-color: rgba(255, 255, 255, 0.25);
}

.text-check-col:hover {
    background-color: rgba(255, 255, 255, .1);
    border-radius: 3px;
}

.text-check-col {
    padding-left: 8px;
}

.text-check {
    cursor: pointer;
    height: 100%
}

.check-name {
    display: flex;
    align-items: center;
    height: 100%
}

.text-check-graphic-wrapper {
    min-width: 16px;
    min-height: 16px;
    display: inline-block;
    margin: 0px;
    padding-right: 0px;
}

.check-text {
    padding-left: 8px;
    display: flex;
    align-items: center;
}

.text-check-graphic {
    position: absolute;
    width: 16px;
    height: 16px;
}

li {
    list-style-type: none;
}

.dropend {
    height: 100%;
}

.card-header {
    background-color: rgba(255, 255, 255, .05);
}

.card-body {
    background-color: rgba(255, 255, 255, .01);
    border-radius: 0px 0px 5px 5px;
}

.card {
    border-width: 0px;
    border-radius: 5px 5px 5px 5px;
}
</style>