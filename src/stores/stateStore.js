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

    const difficultyByName = {
        'Casual': 0,
        'Normal': 1,
        'Hard': 2,
        'Glitched': 3,
        'Hell': 4,
    };

    const difficultyByNumber = {
        0: 'Casual',
        1: 'Normal',
        2: 'Hard',
        3: 'Glitched',
        4: 'Hell',
    };

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

    function getRelativeDifficulty(absDiff) {
        let selectedLogic = args.value.logic;
        if (args.value.logic == '') {
            selectedLogic = 'normal';
        }

        let selectedDifficulty = difficultyByName[Object.keys(difficultyByName).find(key => key.toLowerCase() == selectedLogic)];
        return Math.max(0, absDiff - selectedDifficulty);
    }

    function getAbsoluteDifficulty(relDiff) {
        let selectedLogic = args.value.logic;
        if (args.value.logic == '') {
            selectedLogic = 'normal';
        }

        let selectedDifficulty = difficultyByName[Object.keys(difficultyByName).find(key => key.toLowerCase() == selectedLogic)];
        return relDiff + selectedDifficulty;
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
        difficultyByName,
        difficultyByNumber,
        removeHint,
        onHintUpdate,
        offHintUpdate,
        getRelativeDifficulty,
        getAbsoluteDifficulty,
    };
});