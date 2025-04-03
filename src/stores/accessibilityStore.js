import { LogicHint } from "@/model/logicHint";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAccessibilityStore = defineStore('accessibility', () => {
    const checks = ref([]);
    const checksById = ref({});
    const allChecksById = ref({});
    const entrances = ref({});
    const logicHints = ref([]);

    function loadEntrances(bareEntrances) {
        entrances.value = bareEntrances;

        window.entranceAccessibility = entrances.value;
    }

    function loadLogicHints(bareLogicHints) {
        logicHints.value = bareLogicHints.map(x => new LogicHint(x));

        window.logicHintAccessibility = logicHints.value;
    }

    return {
        checks,
        checksById,
        entrances, 
        allChecksById,
        logicHints,
        loadEntrances,
        loadLogicHints,
    };
});