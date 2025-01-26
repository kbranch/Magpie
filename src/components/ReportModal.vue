<script setup>
import { sendError } from '@/moduleWrappers';
import { useReportStore } from '@/stores/reportStore';
import { nextTick, onMounted, ref, watch } from 'vue';

const report = useReportStore();

const summernote = ref(null);
const modal = ref(null);

watch(() => report.showing, (showing) => {
    if (showing) {
        new window.bootstrap.Modal('#errorModal', null).show();
    }
    else {
        new window.bootstrap.Modal('#errorModal', null).hide();
    }
});

onMounted(() => {
    modal.value.addEventListener('hide.bs.modal', () => {
        nextTick(report.hide);
    });

    window.$(summernote.value).summernote({
        height: 200,
    });
});

function submit() {
    sendError(report.payload, window.$(summernote.value).summernote('code'));
}

</script>

<template>

  <div ref="modal" class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h6 class="modal-title" id="errorModalLabel">
            <span v-if="report.type == 'error'">Error</span>
            <span v-else-if="report.type == 'tip-report'">Report a problem with a tip</span>
          </h6>
          <button id="modalClose" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <h5 id="errorModalMessage"></h5>
          <h6 v-if="report.type == 'error'">Please report this error so it can be fixed!</h6>
          <div class="mb-3">
            <label for="errorEmail" class="form-label">Email address (optional)</label>
            <input type="email" class="form-control" id="errorEmail" placeholder="Optional">
          </div>

          <div>
            <div id="errorTextArea" name="editordata" ref="summernote"></div>
          </div>

          <p>Data to be sent:</p>
          <pre id="errorModalPayload">{{ JSON.stringify(report.payload, null, 3) }}</pre>
        </div>
        <div class="modal-footer">
          <button id="sendErrorButton" type="button" class="btn btn-primary big-button" data-bs-dismiss="modal"
            @click="submit()">Send Report</button>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>
