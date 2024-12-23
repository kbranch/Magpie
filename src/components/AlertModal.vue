<template>
<div class="modal fade" id="alertModal" tabindex="-1" aria-labelledby="alertModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-scrollable modal-l">
    <div class="modal-content">
      <div class="modal-header">
        <h6 class="modal-title" id="alertModalLabel"></h6>
        <button id="alertModalClose" type="button" class="btn-close" data-bs-dismiss="modal"
          aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <span id="alertBody"></span>
      </div>
      <div class="modal-footer">
        <button id="alertCloseButton" type="button" class="btn btn-primary big-button"
          data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
</template>