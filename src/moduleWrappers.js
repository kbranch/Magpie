import { debounce } from "./main";
import { useAlertStore } from "./stores/alertStore";
import { useStateStore } from "./stores/stateStore";

export let toggleCheck = window.toggleCheck
export let $ = window.$;
export let getStateZip = window.getStateZip
export let init = window.init;
export let win = window;
export let openItemsBroadcastView = window.openItemsBroadcastView;
export let openMapBroadcastView = window.openMapBroadcastView;
export let closeAllTooltips = window.closeAllTooltips;
export let removeNodes = window.removeNodes;
export let drawNodes = window.drawNodes;
export let drawActiveTab = window.drawActiveTab;
export let resetSession = window.resetSession;
export let saveQuickSettings = window.saveQuickSettings;
export let saveSettings = window.saveSettings;
export let resetColors = window.resetColors;
export let getFile = window.getFile;
export let importState = window.importState;
export let importLogicDiff = window.importLogicDiff;
export let openExportStateDialog = window.openExportStateDialog;
export let resetUndoRedo = window.resetUndoRedo;
export let fixArgs = window.fixArgs;
export let saveSettingsToStorage = window.saveSettingsToStorage;
export let applySettings = window.applySettings;
export let refreshItems = window.refreshItems;
export let broadcastArgs = window.broadcastArgs;
export let toggleSingleNodeCheck = window.toggleSingleNodeCheck;
export let setCheckContents = window.setCheckContents;
export let spoilLocation = window.spoilLocation;
export let itemsByLocation = window.itemsByLocation;
export let getPopperConfig = window.getPopperConfig;
export let setStartLocation = window.setStartLocation;
export let canBeStart = window.canBeStart;
export let startGraphicalConnection = window.startGraphicalConnection;
export let getInsideOutEntrance = window.getInsideOutEntrance;
export let connectEntrances = window.connectEntrances;
export let startIsSet = window.startIsSet;
export let openDeadEndDialog = window.openDeadEndDialog;
export let inOutEntrances = window.inOutEntrances;
export let mapToLandfill = window.mapToLandfill;
export let spoilEntrance = window.spoilEntrance;
export let clearEntranceMapping = window.clearEntranceMapping;
export let spoilerLogExists = window.spoilerLogExists;
export let graphicalMapType = window.graphicalMapType;
export let graphicalMapSource = window.graphicalMapSource;
export let coupledEntrances = window.coupledEntrances;
export let mapBoss = window.mapBoss;
export let skipNextAnimation = window.skipNextAnimation;
export let eventNameInput = window.eventNameInput;
export let spoilerLog = window.spoilerLog;
export let download = window.download;
export let sortByKey = window.sortByKey;
export let saveHints = window.saveHints;
export let processMessage = window.processMessage;
export let alertModal = window.alertModal;
export let coordDict = window.coordDict;
export let bootstrap = window.bootstrap;
export let autotrackerIsConnected = window.autotrackerIsConnected;
export let sendMessage = window.sendMessage;
export let prefixOverrides = window.prefixOverrides;
export let hydrateConnections = window.hydrateConnections;
export let getMapScaling = window.getMapScaling;
export let entranceDict = window.entranceDict;
export let connectorDict = window.connectorDict;
export let sendError = window.sendError;
export let logicHintDict = window.logicHintDict;
export let bosses = window.bosses;
export let bossDataDict = window.bossDataDict;
export let connectors = window.connectors;
export let connectorsMixed = window.connectorsMixed;
export let vanillaConnectors = window.vanillaConnectors;
export let createElement = window.createElement;
export let advancedER = window.advancedER;
export let pickingEntrances = window.pickingEntrances;
export let checkGraphicLeftClick = window.checkGraphicLeftClick;
export let nodeMiddle = window.nodeMiddle;
export let checkGraphicRightClick = window.checkGraphicRightClick;
export let checkGraphicMouseEnter = window.checkGraphicMouseEnter;
export let checkGraphicMouseLeave = window.checkGraphicMouseLeave;
export let broadcastMode = window.broadcastMode;
export let allowAutotracking = window.allowAutotracking;
export let broadcastLocation = window.broadcastLocation;
export let updateReverseMap = window.updateReverseMap;
export let refreshMapNdi = window.refreshMapNdi;
export let updateNdi = window.updateNdi;

export function initGlobals(data) {
    let state = useStateStore();
    let alertStore = useAlertStore();

    window.alertModal = alertStore.show;
    window.locationHistory = state.locationHistory;

    window.defaultArgs = data.args;
    window.defaultSettings = data.defaultSettings;
    window.diskSettings = data.diskSettings;
    window.local = Boolean(data.local);
    window.settingsPrefix = data.settingsPrefix;
    window.allowAutotracking = Boolean(data.allowAutotracking);
    window.allowMap = Boolean(data.allowMap);
    window.refreshMap = data.refreshMap !== false;
    window.allowItems = Boolean(data.allowItems);
    window.keepQueryArgs = Boolean(data.keepQueryArgs);
    window.graphicsOptions = data.graphicsOptions;

    if ('jsonSettingsOverrides' in data) {
        window.settingsOverrides = data.jsonSettingsOverrides;
        window.argsOverrides = data.jsonArgsOverrides;
    }
    else {
        window.settingsOverrides = {};
        window.argsOverrides = {};
    }

    if ('players' in data) {
        window.players = data.players;
    }
    else {
        window.players = [''];
    }

    if ('broadcastMode' in data) {
        window.broadcastMode = data.broadcastMode;
    }
    else {
        window.broadcastMode = 'receive';
    }

    itemsByLocation = window.itemsByLocation;

    window.rootPrefix = import.meta.env.VITE_API_URL;
    window.iconStyles = $('link#iconsSheet')[0].sheet;

    window.debounce = debounce;
}