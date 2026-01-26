import { saveHints, saveSettingsToStorage } from "@/moduleWrappers";
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
    const locationHistory = ref([]);
    const linkFaceShowing = ref(false);
    const connectionSource = ref(null);
    const connectionType = ref(null);
    const tipAdmin = ref(false);
    const errorMessage = ref(null);

    let hintCallbacks = [];

    watch(hints,
        () => {
            saveHints();

            for (let callback of hintCallbacks) {
                callback();
            }
        },
        { deep: true },
    );

    watch(args, 
        (value, oldValue) => {
            if (value.ap_logic && Object.keys(oldValue).length && !value.prerelease) {
                if (!['none', 'simple'].includes(value.entranceshuffle)) {
                    value.entranceshuffle = 'none';
                }

                value.shufflewater = value.entranceshuffle == 'simple';
                value.randomstartlocation = false;
                value.shufflejunk = false;
                value.shuffleannoying = false;
            }

            saveSettingsToStorage(value, settings.value);
        },
        { deep: true },
    )

    function removeHint(hint) {
        hints.value = hints.value.filter(x => x != hint);
        window.hints = hints.value;
    }

    function onHintUpdate(callback) {
        hintCallbacks.push(callback);
    }

    function offHintUpdate(callback) {
        hintCallbacks = hintCallbacks.filter(x => x != callback);
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
        locationHistory,
        linkFaceShowing,
        connectionType,
        connectionSource,
        tipAdmin,
        errorMessage,
        removeHint,
        onHintUpdate,
        offHintUpdate,
    };
});