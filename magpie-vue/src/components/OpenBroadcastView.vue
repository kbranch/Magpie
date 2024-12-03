<script setup>
import { ref } from 'vue';
import { openItemsBroadcastView, openMapBroadcastView } from '@/moduleWrappers.js';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';

const tip = useTextTooltipStore();
const props = defineProps(['type']);

const url = ref(props.type == 'items' ? '/itemsBroadcast' : '/mapBroadcast');
const click = ref(props.type == 'items' ? openItemsBroadcastView : openMapBroadcastView);
</script>

<template>
<a :href="url" target="_blank" @click.prevent="click()" class="pe-2" @mouseenter="tip.tooltip(`Open ${type} broadcast view`, $event)">
    <img class="dimvert" src="/images/pop-out.svg">
</a>
</template>

<style scoped>
</style>