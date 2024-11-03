import { defineStore } from "pinia";
import { ref } from "vue";

export const useNodeTooltipStore = defineStore('nodeTooltip', () => {
    const node = ref(null);
    const element = ref(null);
    const delayMs = ref(null);
    const show = ref(false);

    const auxNode = ref(null);
    const auxElement = ref(null);
    const auxDelayMs = ref(null);
    const auxShow = ref(false);

    const delayTimeout = ref(null);
    const auxDelayTimeout = ref(null);
    function tooltip(Node, event, DelayMs=0) {
        let aux = show.value || delayTimeout.value;
        let el = aux ? auxElement : element;
        let n = aux ? auxNode : node;
        let delay = aux ? auxDelayMs : delayMs;
        let type = aux ? 'auxNode' : 'node';
        let handler = aux ? auxLeaveHandler : leaveHandler;
        let timeout = aux ? auxDelayTimeout : delayTimeout;
        let s = aux ? auxShow : show;

        if (event.currentTarget) {
            el.value = event.currentTarget;
        }

        n.value = Node;
        delay.value = DelayMs;

        clearTooltip(type);

        event.currentTarget.addEventListener('mouseleave', handler);

        if (DelayMs) {
            timeout.value = setTimeout(() => { tooltip(Node, event); }, DelayMs);
            return;
        }

        s.value = true;
    }

    function leaveHandler() {
        if (node.value && node.value.pinned) {
            return;
        }

        clearTooltip('node');
    }

    function auxLeaveHandler() {
        if (auxNode.value && auxNode.value.pinned) {
            return;
        }

        clearTooltip('auxNode');
    }

    function clearTooltip(type) {
        if (type == 'auxNode') {
            auxShow.value = false;
            
            if (auxElement.value) {
                auxElement.value.removeEventListener('mouseleave', leaveHandler);
            }

            if (auxDelayTimeout.value) { 
                clearTimeout(auxDelayTimeout.value);
                auxDelayTimeout.value = null;
            }
        }
        else {
            show.value = false;
            
            if (element.value) {
                element.value.removeEventListener('mouseleave', leaveHandler);
            }

            if (delayTimeout.value) { 
                clearTimeout(delayTimeout.value);
                delayTimeout.value = null;
            }
        }

        // Dumb workaround for the dumb bootstrap tooltips still used for helpers
        [...document.querySelectorAll(".bs-tooltip-auto")].map((x) => x.remove());
    }

    window.vueNodeTooltip = tooltip;

    return { node, element, delayTimeout, delayMs, show, auxNode, auxElement, auxDelayMs, auxShow, tooltip, clearTooltip };
});