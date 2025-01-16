import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAlertStore = defineStore('alert', () => {
    const ignoredAlerts = ref(new Set());
    const header = ref(null);
    const body = ref(null);
    const ignore = ref(false);
    const alertLog = [];

    const showing = computed(() => header.value !== null || body.value !== null);

    function show(newHeader, newBody) {
        const ignored = ignoredAlerts.value.has(id(newHeader, newBody));

        alertLog.push({
            header: newHeader,
            body: newBody,
            ignored: ignored,
            time: Date.now(),
        });

        if (ignored) {
            return;
        }

        ignore.value = false;
        header.value = newHeader;
        body.value = newBody;
    }

    function hide() {
        if (ignore.value) {
            ignoredAlerts.value.add(id(header.value, body.value));
        }

        header.value = null;
        body.value = null;
    }

    function id(header, body) {
        return `${header}-${body}`;
    }

    window.alertLog = alertLog;

    return {
        ignoredAlerts,
        header, 
        body,
        ignore,
        showing,
        show,
        hide,
    };
});