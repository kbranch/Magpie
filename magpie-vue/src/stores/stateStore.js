import { defineStore } from "pinia";
import { ref } from "vue";

export const useStateStore = defineStore('state', () => {
    const args = ref({});
    const settings = ref({});
    const checkedChecks = ref(null);
    const checkContents = ref({});

    return { settings, checkedChecks, args, checkContents };
});