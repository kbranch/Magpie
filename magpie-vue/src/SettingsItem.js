// import { ref } from "vue";

export class SettingsItem {
    static types = Object.freeze({
        checkbox: 0,
        dropdown: 1,
        text: 2,
        slider: 3,
        color: 4,
        button: 5,
        link: 6,
    });

    title;
    type;
    settingBase;
    settingName;
    icon;
    customIcon;
    options;
    placeholder;
    min;
    max;
    step;
    action;
    tooltip;
    helperText;
    href;
    visibleCondition = true;
    settingBind;

    constructor(obj) {
        obj && Object.assign(this, obj);
    }

    refreshBind(obj) {
        if (!obj) {
            return;
        }

        let chunks = this.settingBase.split('/');
        this.settingBind = this.popSetting(obj, chunks);
    }

    popSetting(value, chunks) {
        if (value === undefined) {
            return undefined;
        }

        if (chunks.length == 1) {
            return value[chunks[0]];
        }

        return this.popSetting(value[chunks.shift()], chunks);
    }
}