import { defineStore } from "pinia";
import { ref } from "vue";

export const useAccessibilityStore = defineStore('accessibility', () => {
    const checks = ref([]);
    const checksById = ref({});
    const allChecksById = ref({});
    const entrances = ref({});

    function loadEntrances(bareEntrances) {
        entrances.value = bareEntrances;

        window.entranceAccessibility = entrances.value;
    }

    return {
        checks,
        checksById,
        entrances, 
        allChecksById,
        loadEntrances,
    };
});