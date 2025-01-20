<script setup>
import { useAccessibilityStore } from '@/stores/accessibilityStore';
import { useStateStore } from '@/stores/stateStore';
import { useTextTooltipStore } from '@/stores/textTooltipStore';
import { computed } from 'vue';

const tip = useTextTooltipStore();
const state = useStateStore();
const accessibility = useAccessibilityStore();

const countableChecks = computed(() => {
    // This shouldn't be needed - check.checked isn't behaving reactive for some reason
    // eslint-disable-next-line no-unused-vars
    let dummy = state.checkedChecks?.has('asdf');

    return accessibility.checks.filter(x => !x.isVanillaOwl()
        && x.id != 'egg'
        && !x.metadata.vanillaItem
        && x.isEnabled())
});

const totalChecks = computed(() => new Set(countableChecks.value.map(x => x.id)).size);
const checksByDifficulty = computed(() => Object.groupBy(countableChecks.value, check => check.difficulty));

</script>

<template>

<div id="checkStats" class="col-auto ps-2">
    <div id="hideButton">
        <img :src="`/images/chevron-${state.settings.showStats ? 'left' : 'right'}.svg`" class="invert close-button ms-0"
            @mouseenter="tip.tooltip(state.settings.showStats ? 'Hide stats' : 'Show stats', $event)"
            @click="() => { state.settings.showStats = !state.settings.showStats; tip.clearTooltip(); }">
    </div>

    <div id="statsWrapperWrapper">
        <Transition>
            <div id="statsWrapper" v-if="state.settings.showStats">
                <div v-for="difficulty in Object.keys(checksByDifficulty)" :key="difficulty" class="check-stat px-2">
                        <div :class="`tooltip-check-graphic difficulty-${difficulty == -1 ? 'checked' : difficulty}`">
                            <svg class="tooltip-check-graphic">
                                <use :xlink:href="`#difficulty-${difficulty == -1 ? 'checked' : difficulty}`"></use>
                            </svg>
                        </div>
                    <span>
                        : {{ checksByDifficulty[difficulty].length }} ({{ (checksByDifficulty[difficulty].length / totalChecks * 100).toFixed(1) }}%)
                    </span>
                </div>
                <span>Total: {{ totalChecks }}</span>
            </div>
        </Transition>
    </div>
</div>

</template>

<style scoped>

#checkStats {
    align-content: center;
    padding-right: 0.4em;
    display: flex;
}

#hideButton {
    align-items: center;
    cursor: pointer;
    display:flex;
}

#statsWrapperWrapper {
    overflow: hidden;
    align-content: center;
}

#statsWrapper.v-enter-active,
#statsWrapper.v-leave-active {
  transition: all 0.3s ease;
}

#statsWrapper.v-enter-from,
#statsWrapper.v-leave-to {
    transform: translateX(-100%);
}

.check-stat {
    display: inline-block;
}

.close-button {
    height: 24px;
    opacity: 0.5;
    padding: 4px;
}

.close-button:hover {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
}

</style>