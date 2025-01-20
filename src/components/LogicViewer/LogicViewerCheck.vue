<script setup>

const check = defineModel();

</script>

<template>

<div class="text-start d-flex p-1 mb-0 align-items-center">
    <div class="tooltip-check-graphic align-middle"
        :class="{
            [`difficulty-${check.difficulty}`]: true,
            'behind-keys': check.behindKeys,
            'requires-rupees': check.requiredRupees,
            'behind-tracker': check.behindTrackerLogic,
            'vanilla': check.isVanilla,
            'owl': check.isVanillaOwl(),
        }">

        <div class="tooltip-check-graphic icon-wrapper">
            <div class="behind-rupees-overlay"></div>
            <div class="behind-keys-overlay"></div>
            <div class="behind-tracker-overlay"></div>
            <div class="owl-overlay"></div>
            <svg class="tooltip-check-graphic align-middle">
                <use :xlink:href="`#difficulty-${check.difficulty}${check.isVanilla ? '-vanilla' : ''}`"></use>
            </svg>
            <svg v-if="check.hollow" class="icon hollow text-icon">
                <use xlink:href="#difficulty-${check.difficulty}-hollow"></use>
            </svg>
        </div>
    </div>
    <div class="tooltip-text ps-2">
        <span class="tooltip-text-span">{{ check.metadata.name }} ({{ check.id }})</span>
    </div>
</div>

</template>

<style scoped>
</style>