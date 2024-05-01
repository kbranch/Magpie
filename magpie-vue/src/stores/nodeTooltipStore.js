import { defineStore } from "pinia";
import { ref } from "vue";

export const useNodeTooltipStore = defineStore('nodeTooltip', () => {
    const node = ref(null);
    const element = ref(null);
    const delayMs = ref(null);
    const show = ref(false);

    const delayTimeout = ref(null);
    function tooltip(Node, event, DelayMs=0) {
        if (event.currentTarget) {
            element.value = event.currentTarget;
        }

        node.value = Node;
        delayMs.value = DelayMs;

        clearTooltip();

        event.currentTarget.addEventListener('mouseleave', leaveHandler);

        if (DelayMs) {
            delayTimeout.value = setTimeout(() => { tooltip(Node, event); }, DelayMs);
            return;
        }

        show.value = true;
    }

    function leaveHandler() {
        clearTooltip();
    }

    function clearTooltip() {
        show.value = false;
        
        if (element.value) {
            element.value.removeEventListener('mouseleave', leaveHandler);
        }

        if (delayTimeout.value) { 
            clearTimeout(delayTimeout.value);
            delayTimeout.value = null;
        }
    }

    window.vueNodeTooltip = tooltip;

    return { node, element, delayTimeout, delayMs, show, tooltip, clearTooltip };
});