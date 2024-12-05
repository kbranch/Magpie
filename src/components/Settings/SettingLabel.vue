<script setup>
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';

const tip = useTextTooltipStore();
defineProps(['item']);
</script>

<template>
    <span v-if="item.customIcon" v-html="item.customIcon" style="display: inline-block;"></span>
    <img v-if="item.icon" class="settings-image" :class="item.iconClass" :src="`/images/${item.icon}`">
    {{ item.title }}
    <img v-if="item.helperText" class="invert" src="/images/question-circle.svg" @mouseenter="tip.tooltip(item.helperText, $event)">
</template>