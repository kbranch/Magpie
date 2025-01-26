<script setup>
import { computed } from 'vue';
import '@textabledev/langs-flags-list/lang-flags.css';
import { useStateStore } from '@/stores/stateStore';
import { MdPreview } from 'md-editor-v3';

const state = useStateStore();

const tip = defineModel();

const id = computed(() => `tip-${tip.value.tipId}`);

const textColor = computed(() => state.settings.textColor);

</script>

<template>

<div class="accordion-item">
    <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#${id}`" aria-expanded="false" :aria-controls="id">
            <span class="lang-icon" :class="`lang-icon-${tip.language}`"></span>
            <span class="title-span">{{ tip.title }}</span>
            <span class="attribution">
                <MdPreview v-model="tip.attribution" id="attributionPreview" language="en-US" theme="dark"
                    class="md-outer-editor" :no-mermaid="true" :no-katex="true" />
            </span>
        </button>
    </h2>
    <div :id="id" class="accordion-collapse collapse">
        <div class="accordion-body">
            <MdPreview v-model="tip.body" id="bodyPreview" language="en-US" theme="dark"
                class="md-outer-editor" :no-mermaid="true" :no-katex="true" />
        </div>
    </div>
</div>

</template>

<style scoped>

.attribution {
    padding-right: 10px;
    padding-left: 10px;
}

.title-span {
    flex-grow: 1;
}

.accordion-body {
	color: v-bind(textColor) !important;
    padding-top: 8px;
    padding-bottom: 8px;
}

.accordion-button:not(.collapsed) {
	background-color: rgba(255, 255, 255, 0.05) !important;
	color: v-bind(textColor) !important;
    box-shadow: none !important; 
}

.accordion-button:not(.collapsed)::after {
    filter: invert(1);
    --bs-accordion-btn-active-icon: var(--bs-accordion-btn-icon);
}

.accordion-item {
    margin-top: 2px;
}

.accordion-item, .accordion-button {
    border-style: none !important;
    --bs-accordion-btn-bg: rgba(255, 255, 255, 0.05);
    --bs-accordion-btn-color: v-bind(textColor);
}

.accordion-button {
    display: flex;
    align-items: center;
    padding-top: 4px;
    padding-bottom: 4px;
}

.lang-icon {
    background-image: url('/images/lang-flags.png');
    margin-right: 12px;
}

</style>

<style>

.md-editor-preview-wrapper {
    padding: 0;
}

#bodyPreview.md-editor, #attributionPreview.md-editor {
    background-color: initial;
}

</style>