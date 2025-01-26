<script setup>
import { closeAllTooltips } from '@/moduleWrappers';
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import NodeSection from './NodeSection.vue';
import NewTipForm from './NewTipForm.vue';
import ViewTips from './ViewTips.vue';

const logic = useLogicViewerStore();

const modal = ref(null);
const body = ref(null);

const node = computed(() => logic.inspectedNode);

watch(node, async (value, oldValue) => {
    if (value != null && oldValue == null) {
        closeAllTooltips();

        nextTick(() => { 
            new window.bootstrap.Modal(modal.value).show();
        });
    }
});

onMounted(() => {
    modal.value.addEventListener('hide.bs.modal', () => {
        logic.clearNode();
    });
});

</script>

<template>

<div ref="modal" class="modal fade" tabindex="-1" aria-labelledby="logicModalLabel" aria-hidden="true" data-bs-keyboard="true">
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <div class="modal-content">
            <div class="modal-header py-2">
                <h6 class="modal-title" id="logicModalLabel">
                    <div v-if="logic.stack?.length > 0" id="backSection">
                        <button type="button" class="btn btn-secondary me-2"
                            @click="logic.popStack()">

                            <img src="/images/chevron-left.svg" class="invert pe-1">
                            Back
                        </button>
                        <span>to {{ logic.stackTop }}</span>
                    </div>
                    <template v-if="node == 'bad-check'">Check not found</template>
                    <template v-else-if="node == 'bad-entrance'">Entrance not found</template>
                    <template v-else-if="node == 'submission-form'">Submit a tip for '{{ logic.getLogicNodeName(logic.stackTop) }}'</template>
                    <template v-else-if="node == 'tips'">Viewing tips for '{{ logic.getLogicNodeName(logic.stackTop) }}'</template>
                    <template v-else-if="node">Viewing node '{{ logic.getLogicNodeName(node.id) }}'</template>
                </h6>
                <button type="button" class="btn-close invert" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div ref="body" class="modal-body">
                <template v-if="node == 'bad-check'">Check not found in logic graph. You may need to connect additional entrances.</template>
                <template v-else-if="node == 'bad-entrance'">Entrance not found in logic graph. You may need to connect additional entrances.</template>
                <NewTipForm v-else-if="node == 'submission-form'" />
                <ViewTips v-else-if="node == 'tips'" />
                <NodeSection v-else-if="node" />
            </div>
            <div v-if="node != 'submission-form'" class="modal-footer">
                <div class="display-flex justify-content-end">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</div>

</template>

<style scoped>

#logicModalLabel {
    display: flex;
    align-items: center;
    justify-content: end;
    padding-right: 12px;
    width: 100%;
}

#backSection {
    display: flex;
    align-items: center;
    position: absolute;
    left: 8px;
}

.modal-header {
    min-height: 56px;
}

</style>