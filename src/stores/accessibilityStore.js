import { Check } from "@/moduleWrappers";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAccessibilityStore = defineStore('accessibility', () => {
    const checks = ref([]);
    const checksById = ref({});
    const allChecksById = ref({});
    const entrances = ref({});

    function loadChecks(bareChecks) {
        checksById.value = {};
        allChecksById.value = {};

        window.allChecksById = allChecksById.value;
        window.checksById = checksById.value;

        checks.value = bareChecks.map(x => {
            let check = new Check(x);
            checksById.value[x.id] = check;

            return check;
        });

        window.checkAccessibility = checks.value;
    }

    function loadEntrances(bareEntrances) {
        entrances.value = bareEntrances;

        window.entranceAccessibility = entrances.value;
    }

    return {
        checks,
        checksById,
        entrances, 
        loadChecks,
        loadEntrances,
    };
});