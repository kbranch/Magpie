import { defineStore } from "pinia";
import { ref } from "vue";

export const useEventStore = defineStore('event', () => {
    const eventName = ref(null);
    const viewCode = ref(null);

    return {
        eventName,
        viewCode, 
    };
});