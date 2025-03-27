import { saveHints, saveSettingsToStorage } from "@/moduleWrappers";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

export const useStateStore = defineStore('state', () => {
    const args = ref({});
    const settings = ref({});
    const checkedChecks = ref(new Set());
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
    const connections = ref([]);
    const entranceMap = ref({});
    const reverseEntranceMap = ref({});
    const startHouse = ref('start_house:inside');
    const randomizedEntrances = ref([]);
    const startLocations = ref([]);
    const stickyBehindKeys = ref(false);
    const inventory = ref({});
    const hoveredItems = ref([]);
    const errorMessage = ref(null);

    const checkSize = computed(() => settings.value.checkSize / window.visualViewport.scale);

    let hintCallbacks = [];

    window.connections = connections.value;
    window.entranceMap = entranceMap.value;
    window.reverseEntranceMap = entranceMap.value;
    window.startHouse = startHouse.value;
    window.randomizedEntrances = randomizedEntrances.value;
    window.startLocations = startLocations.value;
    window.inventory = inventory.value;
    window.hoveredItems = hoveredItems.value;

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
            if (value.ap_logic && Object.keys(oldValue).length) {
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

    watch(connections, () => window.connections = connections.value, { deep: false });
    watch(entranceMap, () => window.entranceMap = entranceMap.value, { deep: false });
    watch(reverseEntranceMap, () => window.reverseEntranceMap = reverseEntranceMap.value, { deep: false });
    watch(startHouse, () => window.startHouse = startHouse.value, { deep: false });
    watch(randomizedEntrances, () => window.randomizedEntrances = randomizedEntrances.value, { deep: false });
    watch(startLocations, () => window.startLocations = startLocations.value, { deep: false });
    watch(inventory, () => window.inventory = inventory.value, { deep: false });
    watch(hoveredItems, () => window.hoveredItems = hoveredItems.value, { deep: false });

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
        connections,
        entranceMap,
        reverseEntranceMap,
        startHouse,
        randomizedEntrances,
        startLocations,
        stickyBehindKeys,
        checkSize,
        hoveredItems,
        inventory,
        errorMessage,
        removeHint,
        onHintUpdate,
        offHintUpdate,
    };
});