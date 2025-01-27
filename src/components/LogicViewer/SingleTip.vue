<script setup>
import { computed } from 'vue';
import '@textabledev/langs-flags-list/lang-flags.css';
import { useStateStore } from '@/stores/stateStore';
import { MdPreview } from 'md-editor-v3';
import { useTextTooltipStore } from '@/stores/textTooltipStore';
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { useReportStore } from '@/stores/reportStore';

const state = useStateStore();
const logic = useLogicViewerStore();
const report = useReportStore();
const tipStore = useTextTooltipStore();

const tip = defineModel();
defineProps(['expanded']);
const emit = defineEmits(['updatedTips']);

const id = computed(() => `tip-${tip.value.tipId}`);

const textColor = computed(() => state.settings.textColor);

</script>

<template>

<div class="accordion-item">
    <h2 class="accordion-header">
        <button class="accordion-button" :class="{ 'unapproved': !tip.approved, 'collapsed': !expanded }"
            type="button" data-bs-toggle="collapse" :data-bs-target="`#${id}`"
            :aria-expanded="expanded ? 'true' : 'false'" :aria-controls="id">

            <span class="lang-icon" :class="`lang-icon-${tip.language}`"></span>
            <span class="title-span">{{ tip.title }}</span>
        </button>
    </h2>
    <div :id="id" class="accordion-collapse collapse" :class="{ 'show': expanded }">
        <div class="accordion-body">
            <MdPreview v-model="tip.body" id="bodyPreview" language="en-US" theme="dark"
                class="md-outer-editor" :no-mermaid="true" :no-katex="true" />

            <div class="footer">
                <span class="attribution">
                    <template v-if="tip.attribution?.length">
                        <span class="pe-2">Credit: </span>
                        <MdPreview v-model="tip.attribution" id="attributionPreview" language="en-US" theme="dark"
                            class="md-outer-editor" :no-mermaid="true" :no-katex="true" />
                    </template>
                </span>
                <template v-if="state.tipAdmin">
                    <button class="btn btn-secondary me-2"
                        @mouseover="tipStore.tooltip('Delete this tip', $event)"
                        @click="async () => { await logic.deleteTip(tip); emit('updatedTips'); }">

                        <img class="invert" src="/images/trash3-fill.svg">
                    </button>
                    <button v-if="!tip.approved" class="btn btn-secondary me-2"
                        @mouseover="tipStore.tooltip('Approve this tip', $event)"
                        @click="async () => { await logic.approveTip(tip, true); emit('updatedTips'); }">

                        <img class="invert" src="/images/hand-thumbs-up-fill.svg">
                    </button>
                    <button v-else class="btn btn-secondary me-2"
                        @mouseover="tipStore.tooltip('Unapprove this tip', $event)"
                        @click="async () => { await logic.approveTip(tip, false); emit('updatedTips'); }">

                        <img class="invert" src="/images/hand-thumbs-down-fill.svg">
                    </button>
                    <button v-if="tip.parentId" class="btn btn-secondary me-2"
                        @mouseover="tipStore.tooltip('Revert edit', $event)"
                        @click="async () => { await logic.revertTipEdit(tip); emit('updatedTips'); }">
                        
                        <img class="invert" src="/images/arrow-clockwise.svg">
                    </button>
                </template>

                <button class="btn btn-secondary me-2"
                    @mouseover="tipStore.tooltip('Suggest an edit', $event)" @click="logic.editTip(tip)">
                    <img class="invert" src="/images/pencil-square.svg">
                </button>
                <button class="btn btn-secondary" @mouseover="tipStore.tooltip('Report a problem', $event)"
                    @click="report.show('tip-report', tip)">
                    <img class="invert" src="/images/flag-fill.svg">
                </button>
            </div>
        </div>
    </div>
</div>

</template>

<style scoped>

.unapproved {
    background-color: goldenrod;
}

.btn {
    display: flex;
    align-items: center;
    padding-left: 6px;
    padding-right: 6px;
}

.footer {
    display: flex;
    height: 24px;
    align-items: center;
}

.attribution {
    padding-right: 10px;
    padding-left: 10px;
    display: flex;
    align-items: center;
    flex-grow: 1;
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
    padding-top: 12px;
    padding-bottom: 12px;
}

.lang-icon {
    background-image: url('/images/lang-flags.png');
    margin-right: 12px;
}

</style>

<style>

.md-editor-previewOnly .md-editor-preview-wrapper {
    padding: 0;
}

#bodyPreview.md-editor, #attributionPreview.md-editor {
    background-color: initial;
}

</style>