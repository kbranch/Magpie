<script setup>
import { ref } from 'vue';
import { openItemsBroadcastView, openMapBroadcastView } from '/src/moduleWrappers.js';

const props = defineProps(['type']);

const url = ref(props.type == 'items' ? '/itemsBroadcast' : '/mapBroadcast');
const click = ref(props.type == 'items' ? openItemsBroadcastView : openMapBroadcastView);
</script>

<template>
<a :href="url" target="_blank" @click.prevent="click()" class="pe-2" data-bs-toggle="tooltip" data-bs-trigger="hover" :data-bs-title="`Open ${type} broadcast view`">
    <img class="dimvert" src="/images/pop-out.svg">
</a>
</template>

<style scoped>
.dimvert {
    filter: invert(1)
            brightness(0.5);
}
</style>