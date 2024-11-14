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
        column: 7,
        group: 8,
    });

    children = [];

    title;
    header;
    type;
    class;
    settingBase;
    settingName;
    opacitySettingName;
    icon;
    iconClass;
    customIcon;
    options;
    placeholder;
    min;
    max;
    step;
    action;
    maxWidth;
    tooltip;
    helperText;
    href;
    visibleCondition = () => { return true };
    includeRow = true;
    includeCol = true;
    colSize;
    settingBind;
    padding;

    constructor(obj) {
        obj && Object.assign(this, obj);

        if (!this.settingName) {
            this.settingBind = {};
        }
    }

    refreshBind(obj) {
        if (!obj || !this.settingBase || !this.settingName) {
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