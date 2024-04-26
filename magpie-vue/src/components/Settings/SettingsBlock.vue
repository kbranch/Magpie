<script setup>
import VFragment from '@/components/VFragment.vue';
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
    <template v-if="item.visibleCondition() && (!item.settingName || item.settingBind)">
        <component :is="item.includeRow ? 'div' : VFragment" class="row" :class="{ 'pb-2': !item.children.length || item.children[0].type != types.color }">
            <component :is="item.includeCol ? 'div' : VFragment" :class="colSize" :data-bs-toggle="bsToggle" :data-bs-trigger="bsTrigger" :data-bs-title="item.tooltip">
                <component :is="item.type == types.group ? 'fieldset' : VFragment" class="form-group">
                    <SettingControls v-model="model" :item="item" />

                    <template v-for="child in item.children" :key="child">
                        <SettingsBlock v-model="child.settingBind" :item="child" />
                    </template>
                </component>
            </component>
        </component>
    </template>
</template>

<style scoped>
</style>