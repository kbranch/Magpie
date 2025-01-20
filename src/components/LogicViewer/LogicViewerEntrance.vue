<script setup>
import { entranceDict } from '@/moduleWrappers';

const entrance = defineModel();

</script>

<template>

<div class="text-start d-flex p-1 mb-0 align-items-center">
    <div class="tooltip-check-graphic align-middle"
        :class="{
            [`difficulty-${entrance.difficulty}`]: true,
            'behind-tracker': entrance.behindTrackerLogic,
            'vanilla': entrance.isVanilla,
        }">

        <div class="tooltip-check-graphic icon-wrapper">
            <div class="behind-rupees-overlay"></div>
            <div class="behind-keys-overlay"></div>
            <div class="behind-tracker-overlay"></div>
            <div class="owl-overlay"></div>
            <svg class="tooltip-check-graphic align-middle">
                <use :xlink:href="`#difficulty-${entrance.difficulty}${entrance.isVanilla ? '-vanilla' : ''}`"></use>
            </svg>
            <svg v-if="entrance.behindTrackerLogic" class="icon hollow text-icon">
                <use :xlink:href="`#difficulty-${entrance.difficulty}-hollow`"></use>
            </svg>
        </div>
    </div>
    <div class="tooltip-text ps-2">
        <span class="tooltip-text-span">{{ entranceDict[entrance.id].name }} ({{ entrance.id }})</span>
    </div>
</div>

</template>

<style scoped>
</style>