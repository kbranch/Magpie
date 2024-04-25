<script setup>
import SettingControls from './SettingControls.vue';
import { SettingsItem } from '@/SettingsItem.js';
import { computed } from 'vue';

const model = defineModel();
const props = defineProps(['item']);

const types = SettingsItem.types;

const colSize = computed(() => `col${props.item.colSize !== undefined ? props.item.colSize == '' ? '' : '-' + props.item.colSize 
                                                        : props.item.type == types.column ? '-auto' : ''}`);
const bsToggle = computed(() => props.item.tooltip ? 'tooltip' : undefined);
const bsTrigger = computed(() => props.item.tooltip ? 'hover' : undefined);
</script>

<template>
    <div v-if="item.includeRow && item.includeCol" class="row" :class="{ 'pb-2': !item.children.length || item.children[0].type != types.color }">
        <div :class="colSize" :data-bs-toggle="bsToggle" :data-bs-trigger="bsTrigger" :data-bs-title="item.tooltip">
            <template v-if="item.type == types.group">
                <fieldset class="form-group">
                    <SettingControls v-model="model" :item="item" />

                    <template v-for="child in item.children" :key="child">
                        <SettingsBlock v-if="!child.settingName || child.settingBind" v-model="child.settingBind" :item="child" />
                    </template>
                </fieldset>
            </template>
            <template v-else>
                <SettingControls v-model="model" :item="item" />

                <template v-for="child in item.children" :key="child">
                    <SettingsBlock v-if="!child.settingName || child.settingBind" v-model="child.settingBind" :item="child" />
                </template>
            </template>
        </div>
    </div>
    <div v-else-if="item.includeCol" :class="colSize" :data-bs-toggle="bsToggle" :data-bs-trigger="bsTrigger" :data-bs-title="item.tooltip">
        <template v-if="item.type == types.group">
            <fieldset class="form-group">
                <SettingControls v-model="model" :item="item" />

                <template v-for="child in item.children" :key="child">
                    <SettingsBlock v-if="!child.settingName || child.settingBind" v-model="child.settingBind" :item="child" />
                </template>
            </fieldset>
        </template>
        <template v-else>
            <SettingControls v-model="model" :item="item" />

            <template v-for="child in item.children" :key="child">
                <SettingsBlock v-if="!child.settingName || child.settingBind" v-model="child.settingBind" :item="child" />
            </template>
        </template>
    </div>
    <div v-else-if="item.includeRow" class="row" :class="{ 'pb-2': !item.children.length || item.children[0].type != types.color }"
        :data-bs-toggle="bsToggle" :data-bs-trigger="bsTrigger" :data-bs-title="item.tooltip">

        <template v-if="item.type == types.group">
            <fieldset class="form-group">
                <SettingControls v-model="model" :item="item" />

                <template v-for="child in item.children" :key="child">
                    <SettingsBlock v-if="!child.settingName || child.settingBind" v-model="child.settingBind" :item="child" />
                </template>
            </fieldset>
        </template>
        <template v-else>
            <SettingControls v-model="model" :item="item" />

            <template v-for="child in item.children" :key="child">
                <SettingsBlock v-if="!child.settingName || child.settingBind" v-model="child.settingBind" :item="child" />
            </template>
        </template>
    </div>
    <template v-else>
        <template v-if="item.type == types.group">
            <fieldset class="form-group">
                <SettingControls v-model="model" :item="item" />

                <template v-for="child in item.children" :key="child">
                    <SettingsBlock v-if="!child.settingName || child.settingBind" v-model="child.settingBind" :item="child" />
                </template>
            </fieldset>
        </template>
        <template v-else>
            <SettingControls v-model="model" :item="item" />

            <template v-for="child in item.children" :key="child">
                <SettingsBlock v-if="!child.settingName || child.settingBind" v-model="child.settingBind" :item="child" />
            </template>
        </template>
    </template>
</template>

<style scoped>
</style>