import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useReportStore = defineStore('report', () => {
    const contact = ref(null);
    const payload = ref(null);
    const type = ref(null);

    const showing = computed(() => type.value !== null);

    function show(newType, newPayload) {
        type.value = newType;
        payload.value = newPayload;
    }

    function hide() {
        type.value = null;
    }

    function showErrorDialog(message, payload) {
        show('error', message, payload);
    }

    window.showErrorDialog = showErrorDialog;

    return {
        contact,
        payload,
        type,
        showing,
        show,
        hide,
    };
});