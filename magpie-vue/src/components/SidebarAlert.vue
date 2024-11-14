<script setup>
import { watch, ref, computed } from 'vue';
import { formatDistanceToNow, format } from 'date-fns';

const props = defineProps(['message']);

const alertShown = ref(false);
const parsedMessage = computed(() => {
    let message = props.message;
    let matches = message.matchAll(/\$\{([^}]*)\}/g);

    for (const match of matches) {
        let date = new Date(Number(match[1]) * 1000);
        message = message.replace(match[0], `${format(date, 'PPp')} (${formatDistanceToNow(date, { addSuffix: true })})`);
    }

    return message;
});

watch(() => props.message, (newValue, oldValue) => {
    if (newValue != oldValue) {
        alertShown.value = false;
    }
});
</script>

<template>
    <div class="wrapper" v-if="!alertShown && message">
        <div class="row">
            <div class="col">
                <p class="message" v-html="parsedMessage"></p>
            </div>
        </div>
        <div class="row">
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
</style>