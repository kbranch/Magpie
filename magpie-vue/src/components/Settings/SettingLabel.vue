<script setup>
defineProps(['item']);
</script>

<template>
    <span v-if="item.customIcon" v-html="item.customIcon" style="display: inline-block;"></span>
    <img v-if="item.icon" class="settings-image" :class="item.iconClass" :src="`/images/${item.icon}`">
    {{ item.title }}
    <img v-if="item.helperText" class="invert" src="/images/question-circle.svg" data-bs-toggle="tooltip" data-bs-custom-class="secondary-tooltip" :data-bs-title="item.helperText">
</template>