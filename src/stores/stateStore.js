import { defineStore } from "pinia";
import { ref } from "vue";

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
    };
});