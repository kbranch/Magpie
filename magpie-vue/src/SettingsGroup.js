export class SettingsGroup {
    name;
    items = [];
    columns = [];

    constructor(obj) {
        obj && Object.assign(this, obj);
    }
}