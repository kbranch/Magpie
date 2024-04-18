export let toggleCheck = window.toggleCheck
export let $ = window.$;
export let getStateZip = window.getStateZip
export let init = window.init;
export let win = window;
export let openItemsBroadcastView = window.openItemsBroadcastView;
export let openMapBroadcastView = window.openMapBroadcastView;

export function initGlobals(data) {
    window.defaultArgs = data.args;
    window.defaultSettings = data.defaultSettings;
    window.settingsOverrides = data.jsonSettingsOverrides;
    window.argsOverrides = data.jsonArgsOverrides;
    window.diskSettings = data.diskSettings;

    window.iconStyles = $('link#iconsSheet')[0].sheet;
    window.themeStyles = $('link#themeSheet')[0].sheet;

    window.local = Boolean(data.local);
    window.allowAutotracking = Boolean(data.allowAutotracking);
    window.allowMap = Boolean(data.allowMap);
    window.refreshMap = data.refreshMap !== false;
    window.allowItems = Boolean(data.allowItems);
    window.keepQueryArgs = Boolean(data.keepQueryArgs);
    window.settingsPrefix = data.settingsPrefix;
    window.players = data.players;
    window.broadcastMode = data.broadcastMode;
    window.rootPrefix = import.meta.env.VITE_API_URL;
}