<script setup>
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { useTextTooltipStore } from '@/stores/textTooltipStore';
import { computed } from 'vue';
import BaseChunk from './BaseChunk.vue';

const tip = useTextTooltipStore();
const logic = useLogicViewerStore();

const props = defineProps(['subject']);

const nonTricks = [
    'bush',
    'pit_bush',
    'attack',
    'attack_hookshot',
    'hit_switch',
    'attack_hookshot_powder',
    'attack_no_bomb',
    'attack_hookshot_no_bomb',
    'attack_no_boomerang',
    'attack_skeleton',
    'attack_gibdos',
    'attack_pols_voice',
    'attack_wizrobe',
    'stun_wizrobe',
    'stun_mask_mimic',
    'rear_attack',
    'rear_attack_range',
    'fire',
    'push_hardhat',
    'shuffled_magnifier',
    'throw_pot',
    'throw_enemy',
    'tight_jump',
];

const requirement = computed(() => {
    if (props.subject.requirements) {
        return props.subject.requirements;
    }

    return props.subject.shortReq ? props.subject.shortReq : props.subject.req;
});

const reqChunks = computed(() => {
    const itemRegex = /([^/A-Z_0-8]|^)('?[A-Z][A-Z_0-8]{2,}'?)/g;
    const quoteRegex = /\/'([A-Z_0-8]{2,})'_1\.png/g;
    const tooltipRegex = /(\w+)\(([^)]+)\)/g;
    const wrapperRegex = /\((?:and|or)\[('[A-Z_0-8]{3,}')\]\)/g;
    const killRegex = /kill_([\w_]+)/g

    let req = requirement.value;

    // Tricks have already had their requirements parsed
    if (!logic.inspectedTrick) {
        req = requirement.value
            .replaceAll('\\', '')
            .replaceAll('"', '')
            .replaceAll("and['TRUE']", 'None')
            .replaceAll("or['FALSE']", 'Disabled')
            .replace(wrapperRegex, '($1)')
            .replace(itemRegex, `$1~$2~`)
            .replace(quoteRegex, '/$1_1.png')
            .replaceAll("'", "")
            .replace(tooltipRegex, '|$1%$2|')
            .replace(killRegex, `<img class="logic-item" src="/images/$1.png">`);
    }

    const chunks = [];
    for (const chunk of req.split('|')) {
        if (chunk.includes('%')) {
            const itemChunkRegex = /~([A-Z][A-Z_0-8]{2,})~/g;
            const halves = chunk.split('%');

            chunks.push({
                name: halves[0],
                details: halves[1].replace(itemChunkRegex, '<img class="logic-item" src="/images/$1_1.png">'),
                isTrick: !nonTricks.includes(halves[0]) && !halves[0].includes('<img'),
                isEnemy: halves[0].includes('<img'),
            });
        }
        else {
            chunks.push(chunk);
        }
    }

    return chunks;
});

</script>

<template>

<div>
    <template v-for="chunk in reqChunks" :key="chunk">
        <a v-if="chunk.isTrick" @click="logic.viewTrick(chunk.name, chunk.details)" href="#"
            @mouseover="tip.tooltip(chunk.details, $event)">
            {{ chunk.name }}
        </a>
        <span v-else-if="chunk.isEnemy" v-html="chunk.name" @mouseover="tip.tooltip(chunk.details, $event)">
        </span>
        <span v-else-if="chunk.name" @mouseover="tip.tooltip(chunk.details, $event)">
            {{ chunk.name }}
        </span>
        <BaseChunk v-else :chunk="chunk" />
    </template>
</div>

</template>

<style scoped>
</style>