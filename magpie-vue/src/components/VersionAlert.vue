<script setup>
import { watch, ref } from 'vue';

const props = defineProps(['clientVersion', 'serverVersion']);

const alertShown = ref(false);

watch(() => props.serverVersion, (newValue, oldValue) => {
    if (newValue != oldValue) {
        alertShown.value = false
    }
});
</script>

<template>
    <div class="wrapper" v-if="!alertShown && clientVersion != serverVersion">
        <div class="row">
            <div class="col">
                <p class="message">The server is using a different version of Magpie than is currently loaded. Consider refreshing if anything behaves strangely.</p>
            </div>
        </div>
        <div class="row">
            <div class="col-auto">
                <button class="btn btn-primary" @click="window.location.reload()">Refresh</button>
            </div>
            <div class="col"></div>
            <div class="col-auto">
                <button class="btn btn-secondary" @click="alertShown = true">Dismiss</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.wrapper {
    padding-top: 0.5em;
    padding-bottom: 0.5em;
    max-width: 294px;
}

.message {
    animation: nag 10s infinite;
}

@keyframes nag {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
    }

    3%, 97% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    }

    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
    }
}
</style>