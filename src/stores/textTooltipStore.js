import { defineStore } from "pinia";
import { ref } from "vue";

export const useTextTooltipStore = defineStore('textTooltip', () => {
    const text = ref(null);
    const element = ref(null);
    const delayMs = ref(null);
    const show = ref(false);

    const delayTimeout = ref(null);
    function tooltip(Text, event, DelayMs=0) {
        if (event.currentTarget) {
            element.value = event.currentTarget;
        }

        text.value = Text;
        delayMs.value = DelayMs;

        clearTooltip();

        event.srcElement.addEventListener('mouseleave', clearTooltip);

        if (DelayMs) {
            delayTimeout.value = setTimeout(() => { tooltip(Text, event); }, DelayMs);
            return;
        }

        show.value = true;
    }

    function clearTooltip() {
        show.value = false;
        
        if (element.value) {
            element.value.removeEventListener('mouseleave', clearTooltip);
        }

        if (delayTimeout.value) { 
            clearTimeout(delayTimeout.value);
            delayTimeout.value = null;
        }
    }

    window.vueTooltip = tooltip;

    return { text, element, delayTimeout, delayMs, show, tooltip, clearTooltip };
});