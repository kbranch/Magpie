<script setup>
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { computed } from 'vue';

const logic = useLogicViewerStore();

const props = defineProps(['chunk']);

const subChunks = computed(() => {
    const itemRegex = /([A-Z][A-Z_0-8]{2,})/g;
    let subChunks = [];

    for (const subChunk of props.chunk.split('~').filter(x => x.length > 0)) {
        subChunks.push({
            contents: subChunk,
            isItem: subChunk.match(itemRegex),
            forcedItemSource: subChunk in logic.logicByForcedItem ? logic.logicByForcedItem[subChunk] : null,
        });
    }

    return subChunks;
})

</script>

<template>

    <template v-for="subChunk in subChunks" :key="subChunk.contents">
        <a v-if="subChunk.forcedItemSource" href="#" @click="logic.pushStack(logic.inspectedNode.id, subChunk.forcedItemSource)">
            <img class="logic-item" :src="`/images/${subChunk.contents}_1.png`" data-bs-toggle='tooltip'
                data-bs-custom-class="secondary-tooltip" :data-bs-title="subChunk.contents" />
        </a>

        <img v-else-if="subChunk.isItem" class="logic-item" :src="`/images/${subChunk.contents}_1.png`"
            data-bs-toggle='tooltip' data-bs-custom-class="secondary-tooltip" :data-bs-title="subChunk.contents" />

        <span v-else v-html="subChunk.contents"></span>
    </template>

</template>