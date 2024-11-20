<script setup>
import { toggleCheck } from '@/moduleWrappers.js';
import { onUpdated } from 'vue';

defineProps({
    area: {
        required: true,
    },
    checks: {
        required: true,
    },
});

onUpdated(() => {
    console.log("updated TextAreaCheck");
});
</script>

<template>
<div class="text-check-card-wrapper col-xxl-2 col-lg-3 col-md-4 col-sm-6 col-12 px-1 py-1" :data-area="area">
    <div class="card magpie-colors text-check-card">
        <div class="card-header">
            {{ area }}
        </div>
        <div class="card-body">
            <ul class="list-group list-group-flush px-2">
                <div v-for="check in checks" :key="check.signature()" class="row">
                    <div class="text-check-col col pe-0">
                        <li class="text-check" @click="toggleCheck($event, check.id)">
                            <div class="check-name">
                                <div class="text-check-graphic-wrapper">
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
                                    <img v-if="check.item" class="text-icon-item ms-1" :src="`static/images/${check.item}_1.png`">
                                    {{ check.metadata.name }}
                                </div>
                            </div>
                        </li>
                    </div>
                    <div class="col-auto ps-0 pe-0">
                        <div class="btn-group dropend">
                            <button type="button" class="btn hidden"></button>
                            <button type="button" class="btn tooltip-item dropdown-toggle dropdown-toggle-split ps-4 pe-2 text-end" :data-check-id="check.id" onmousedown="populateCheckOptions(this)" data-bs-toggle="dropdown" aria-expanded="false"></button>
                            <ul :id="`text-${check.id}`" class="dropdown-menu text-dropdown"></ul>
                        </div>
                    </div>
                </div>
            </ul>
        </div>
    </div>
</div>
</template>

<style scoped>
.text-check-col:hover {
    background-color: rgba(255, 255, 255, .1);
    border-radius: 3px;
}

.text-check-col {
    padding-left: 8px;
}

.text-check {
    cursor: default;
}

.check-name {
    display: flex;
}

.text-check-graphic-wrapper {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin: 0px;
    padding-right: 20px;
    transform: translate(0%, 25%);
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