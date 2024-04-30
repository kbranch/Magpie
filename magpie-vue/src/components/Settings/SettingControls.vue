<script setup>
import SettingLabel from '@/components/Settings/SettingLabel.vue';
import { SettingsItem } from '@/SettingsItem.js';
import { useTextTooltipStore } from '@/stores/textTooltipStore.js';

const tip = useTextTooltipStore();
const types = SettingsItem.types;

const model = defineModel();
defineProps(['item']);
</script>

<template>
    <!-- Group -->
    <legend v-if="item.type == types.group">{{ item.title }}</legend>
    
    <!-- Header -->
    <h2 v-if="item.header">{{ item.header }}</h2>

    <!-- Checkbox -->
    <input v-if="item.type == types.checkbox && item.settingBind" v-model="model[item.settingName]" type="checkbox" :id="`${item.settingName}-setting`" class="form-check-input">

    <label v-if="![types.group, types.header, types.button, types.link, types.color].includes(item.type) && (item.customIcon || item.icon || item.helperText || item.title)"
            :for="`${item.settingName}-setting`"
            :class="item.type == types.checkbox ? 'form-check-label' : 'form-label'">
        <SettingLabel :item="item" />
    </label>

    <!-- Dropdown -->
    <select v-if="item.type == types.dropdown && item.settingBind" v-model="model[item.settingName]" :id="`${item.settingName}-setting`" class="form-select">
        <option v-for="option in Object.keys(item.options)" :key="option" :value="option">{{ item.options[option] }}</option>
    </select>

    <!-- Slider -->
    <input v-if="item.type == types.slider && item.settingBind" v-model="model[item.settingName]" :id="`${item.settingName}-setting`" type="range" :min="item.min" :max="item.max" class="form-range">

    <!-- Text -->
    <input v-if="item.type == types.text && item.settingBind" v-model="model[item.settingName]" :id="`${item.settingName}-setting`" type="text" class="form-control" :placeholder="item.placeholder">

    <!-- Color -->
    <template v-if="item.type == types.color && item.settingBind[item.settingName]">
        <div class="color-block">
            <span @mouseenter="tip.tooltip(item.tooltip, $event)">
                <label :for="`${item.settingName}-setting`" class="color-label">
                    <SettingLabel :item="item" />
                </label>
                <input v-model="model[item.settingName]" :id="`${item.settingName}-setting`" type="color" class="color-picker">
            </span>
            <div v-if="item.opacitySettingName" class="opacity-block ps-2" @mouseenter="tip.tooltip('Opacity', $event)">
                <label :for="`${item.opacitySettingName}-setting`" class="color-label"><img class="invert" src="/images/eye.svg"></label>
                <input v-model="model[item.opacitySettingName]" :id="`${item.opacitySettingName}-setting`" type="range" min="0.2" max="1" step="0.1" class="form-range node-opacity-slider pt-2 me-0">
            </div>
        </div>
    </template>

    <!-- Button -->
    <button v-if="item.type == types.button" type="button" :style="item.maxWidth ? 'width: 100%;' : ''" class="btn btn-secondary" @click="item.action">
        <SettingLabel :item="item" />
    </button>

    <!-- Link -->
    <a v-if="item.type == types.link" :href="item.href"><SettingLabel :item="item" /></a>

    <span v-if="item.customHtml" v-html="item.customHtml"></span>
</template>