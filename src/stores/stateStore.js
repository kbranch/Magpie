import { saveHints } from "@/moduleWrappers";
import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useStateStore = defineStore('state', () => {
    const args = ref({});
    const settings = ref({});
    const checkedChecks = ref(null);
    const checkContents = ref({});
    const logics = ref([]);
    const checkAccessibility = ref([]);
    const isLocal = ref(false);
    const remoteVersion = ref(null);
    const updateMessage = ref(null);
    const sidebarMessage = ref(null);
    const graphicsOptions = ref([]);
    const argDescriptions = ref([]);
    const spoilerLog = ref(null);
    const ndiEnabled = ref(false);
    const hints = ref([]);

    watch(hints,
        () => {
            saveHints();
        },
        { deep: true },
    );

    function removeHint(hint) {
        hints.value = hints.value.filter(x => x != hint);
        window.hints = hints.value;
    }

    return {
        settings,
        checkedChecks, 
        args, 
        checkContents, 
        logics,
        checkAccessibility,
        isLocal,
        remoteVersion,
        updateMessage,
        sidebarMessage,
        graphicsOptions,
        argDescriptions,
        spoilerLog,
        ndiEnabled,
        hints,
        removeHint,
    };
});