<script setup>
import { useAlertStore } from '@/stores/alertStore';
import { computed, nextTick, ref, watch } from 'vue';

const store = useAlertStore();
const modal = ref(null);

const showing = computed(() => store.showing);

watch(showing, (value) => {
  if (value) {
    nextTick(() => {
      new window.bootstrap.Modal(modal.value).show();
    });
  }
});

</script>

<template>

<div v-if="showing" ref="modal" class="modal fade" id="alertModal" tabindex="-1" aria-labelledby="alertModalLabel">
  <div class="modal-dialog modal-dialog-scrollable modal-l">
    <div class="modal-content">
      <div class="modal-header">
        <h6 class="modal-title" id="alertModalLabel">{{ store.header }}</h6>
        <button @click="store.hide()" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <span id="alertBody">{{ store.body }}</span>
      </div>
      <div class="modal-footer">
        <input id="ignoreBox" v-model="store.ignore" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="ignoreBox">Don't show again during this session</label>

        <button type="button" class="btn btn-primary big-button" @click="store.hide()" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

</template>

<style scoped>
.modal-footer {
  display: flex;
  justify-content: start;
}
</style>