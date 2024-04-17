<script setup>
import { toggleCheck } from '/src/moduleWrappers.js';

defineProps({
    area: {
        required: true,
    },
    checks: {
        required: true,
    },
    misc: {
        required: true,
    },
});
</script>

<template>
<div class="text-check-card-wrapper col-xxl-2 col-lg-3 col-md-4 col-sm-6 col-12 px-1 py-1" :data-area="area">
    <div class="card text-bg-dark text-check-card" onclick="preventDoubleClick(event)">
        <div class="card-header">
            {{ area }}
        </div>
        <div class="card-body">
            <ul class="list-group list-group-flush px-2">
                <div v-for="check in checks" :key="check.signature()" class="row">
                    <div class="text-check-col col pe-0">
                        <li class="text-check" @click="toggleCheck($event, check.id)">
                            <div class="check-name">

                                <div v-if="check.difficulty < 9 && !check.isChecked()" class="text-check-graphic-wrapper">
                                    <div :class="`text-check-graphic${check.behindTrackerLogic ? ' behind-tracker' : ''}${check.behindKeys ? ' behind-keys' : ''}${check.requiredRupees ? ' requires-rupees' : ''}${check.isOwl() ? ' owl' : ''}`">
                                        <div class="node-overlay-wrapper" :data-difficulty="check.difficulty">
                                            <div :class="`icon-wrapper icon-difficulty-${check.difficulty}`">
                                                <svg class="icon text-icon">
                                                    <use :xlink:href="`#difficulty-${check.difficulty}${check.isVanilla ? '-vanilla' : ''}`"></use>
                                                </svg>
                                                <svg v-if="check.hollow" class="icon hollow text-icon">
                                                    <use :xlink:href="`#difficulty-${check.difficulty}-hollow`"></use>
                                                </svg>
                                            </div>
                                            <div class="behind-keys-overlay"></div>
                                            <div class="behind-tracker-overlay"></div>
                                            <div class="behind-rupees-overlay"></div>
                                            <div class="owl-overlay"></div>
                                        </div>
                                    </div>
                                </div>
                                <img v-if="check.item" :src="`static/images/${check.item}_1.png`" class="text-icon-item">
                                {{ check.metadata.name }}
                            </div>
                        </li>
                    </div>
                    <div class="col-auto ps-2 pe-0">
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

.text-check {
    cursor: default;
}
</style>