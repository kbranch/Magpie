<script setup>
import { bootstrap, sortByKey } from '@/moduleWrappers.js';
import { useLogicViewerStore } from '@/stores/logicViewerStore';
import { computed, onBeforeMount, onMounted, onUpdated, ref } from 'vue';
import { useStateStore } from '@/stores/stateStore';
import { MdEditor } from 'md-editor-v3';
import languages from '@textabledev/langs-flags-list/lang-flags.json';
import '@textabledev/langs-flags-list/lang-flags.css';
import 'md-editor-v3/lib/style.css';

const state = useStateStore();
const logic = useLogicViewerStore();

const priorityLanguages = [
    'en',
    'de',
    'fr',
    'es',
    'pt',
    'nl',
    'it',
    'pl',
    'ru',
];

const extraLanguages = [
    'zh-hans',
];

const toolbarExclude = [
    'pageFullscreen',
    'fullscreen',
    'mermaid',
    'katex',
    'revoke',
    'next',
    'save',
    'htmlPreview',
];

const languageDropdown = ref(null);
const requirementsDiv = ref(null);

const language = ref('en');
const body = ref('');
const attribution = ref('');
const title = ref('');
const anonymous = ref(false);
const permission = ref(false);

const uploading = ref(false);
const invalidFields = ref([]);
const complete = ref(false);
const error = ref(null);

const fromName = computed(() => logic.getLogicNodeName(logic.inspectedConnection?.from));
const toName = computed(() => logic.getLogicNodeName(logic.inspectedConnection?.to));
const languageCodes = computed(() => sortByKey(
    Object.keys(languages).filter(x => x.length == 2 || extraLanguages.includes(x)),
    x => [!priorityLanguages.includes(x), languages[x].nameEnglish])
);

const bgColor = computed(() => state.settings.bgColor);
const textColor = computed(() => state.settings.textColor);

onBeforeMount(() => {
    languages['zh-hans'].nameEnglish = 'Chinese';
});

onMounted(() => {
    configureDropdown(languageDropdown.value);
    initTooltips();
});

onUpdated(initTooltips);

function initTooltips() {
    let tooltipTriggerList = requirementsDiv.value.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl, { sanitize: false }));
}

async function uploadFile(file) {
    let data = new FormData();
    data.append('file', file);
    data.append('filename', file.name);
    data.append('connectionId', logic.inspectedConnection.id);

    return fetch(`${logic.tipsUrlPrefix.value}/api/tipImage`, {
        method: 'POST',
        body: data,
    })
}

async function onUpload(files, callback) {
    uploading.value = true;

    let responses = [];

    try {
        responses = await Promise.all(
            files.map((file) => {
                return new Promise((resolve, reject) => {
                    uploadFile(file)
                        .then(async (response) => resolve(await response.text()))
                        .catch((error) => reject(error));
                })
            })
        );
    }
    catch (err) {
        console.log('Error uploading images', err);
    }

    uploading.value = false;

    callback(responses);
}

function configureDropdown(element) {
    if (element.popperConfigured) {
        return;
    }
    
    new bootstrap.Dropdown(element, {
        popperConfig: { 
            strategy: 'fixed',
            placement: 'auto',
        },
    });

    element.popperConfigured = true;
}

async function submit() {
    if (complete.value) {
        return;
    }

    let result = await logic.submitTip(
        logic.inspectedConnection.id,
        language.value,
        body.value,
        attribution.value,
        title.value,
        anonymous.value,
        permission.value
    );

    if ('invalidFields' in result) {
        invalidFields.value = result.invalidFields;
    }
    else if (result.success) {
        invalidFields.value = [];
        complete.value = true;
    }
    else {
        invalidFields.value = [];
        error.value = result.message;
    }
}

</script>

<template>
    <h5 class="d-flex align-items-center">
        <div class="text-start d-flex p-1 mb-0 align-items-center">
            <div class="tooltip-check-graphic align-middle" :class="{[`difficulty-${logic.inspectedConnection?.diff}`]: true}">
                <div class="tooltip-check-graphic icon-wrapper">
                    <svg class="tooltip-check-graphic align-middle">
                        <use :xlink:href="`#difficulty-${logic.inspectedConnection?.diff}`"></use>
                    </svg>
                </div>
            </div>
        </div>
        Connection from '{{ fromName }}' to '{{ toName }}'
    </h5>
    <div ref="requirementsDiv">
        <label for="requirementsIcons" class="form-label mt-2">Requirements</label>
        <div id="requirementsIcons" class="cell-wrapper"
            v-html="logic.iconifyRequirement(logic.inspectedConnection?.shortReq
                ? logic.inspectedConnection?.shortReq
                : logic.inspectedConnection?.req)">
        </div>
    </div>

    <template v-if="complete">
        <div class="alert alert-success mt-2">
            <div>Your tip has successfully been submitted and will be reviewed soon</div>
            <div class="mt-4">Thank you!</div>
        </div>
    </template>

    <template v-else>
        <div v-if="error" class="alert alert-danger mt-2">
            {{ error }}
        </div>

        <div>
            <label for="titleBox" class="form-label mt-2">
                Title
                <span v-if="invalidFields.includes('title')" class="alert alert-danger">
                    Required
                </span>
            </label>
            <input v-model="title" id="titleBox" type="text" class="form-control" maxlength="75">
        </div>

        <div class="md-wrapper mt-2">
            <div v-if="uploading" class="spinner-border" role="status">
                <span class="visually-hidden">Uploading...</span>
            </div>
            <label for="bodyMd" class="form-label">
                Explanation
                <span v-if="invalidFields.includes('body')" class="alert alert-danger">
                    Required
                </span>
            </label>
            <MdEditor v-model="body" id="bodyMd" language="en-US" theme="dark" :toolbars-exclude="toolbarExclude"
                :max-length="10000" class="md-outer-editor" :auto-focus="true" :no-mermaid="true" :no-katex="true"
                @on-upload-img="onUpload" />
        </div>

        <div class="md-wrapper mt-2">
            <div v-if="uploading" class="spinner-border" role="status">
                <span class="visually-hidden">Uploading...</span>
            </div>
            <label for="attributionMd" class="form-label">
                Attribution
                <span v-if="invalidFields.includes('attribution')" class="alert alert-danger">
                    Required
                </span>
            </label>
            <MdEditor v-model="attribution" id="attributionMd" language="en-US" theme="dark" :toolbars-exclude="toolbarExclude"
                :max-length="200" class="md-outer-editor" :no-mermaid="true" :no-katex="true"
                @on-upload-img="onUpload" />
        </div>

        <div class="row pt-2">
            <div class="col">
                <div class="d-flex align-items-center">
                    <input v-model="anonymous" type="checkbox" id="anonymousCheck" class="form-check-input mt-0">
                    <label for="anonymousCheck" class="form-label m-0">
                        Submit anonymously
                    </label>
                </div>

                <div class="d-flex align-items-center pt-2">
                    <input v-model="permission" type="checkbox" id="permissionCheck" class="form-check-input mt-0">
                    <label for="permissionCheck" class="form-label m-0">
                        The author gives permission to use this with the attribution above
                        <span v-if="invalidFields.includes('permission')" class="alert alert-danger">
                            Required
                        </span>
                    </label>
                </div>
            </div>

            <div class="col-auto">
                <label for="classDropdown" class="form-label">Language</label>
                <div id="classDropdown" class="dropdown">
                    <button ref="languageDropdown" class="btn btn-secondary dropdown-toggle" type="button"
                        data-bs-toggle="dropdown" aria-expanded="false">

                        <span class="lang-icon" :class="`lang-icon-${language}`"></span>
                        {{ languages[language].nameEnglish }}
                        <template v-if="languages[language].nameNative != languages[language].nameEnglish">
                                / {{ languages[language].nameNative }}
                        </template>
                    </button>
                    <ul class="dropdown-menu">
                        <li v-for="lang in languageCodes" :key="lang" @click="language = lang">
                            <a class="dropdown-item" :class="{'dropdown-active': language == lang}" href="#">
                                <span class="lang-icon" :class="`lang-icon-${lang}`"></span>
                                {{ languages[lang].nameEnglish }}
                                <template v-if="languages[lang].nameNative != languages[lang].nameEnglish">
                                    / {{ languages[lang].nameNative }}
                                </template>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

    </template>

    <div class="modal-footer">
        <div class="display-flex justify-content-end">
            <button v-if="!complete" type="button" class="btn btn-primary"
                @click="submit()">
                Submit New Tip
            </button>
            <button v-else type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
        </div>
    </div>

</template>

<style scoped>

.modal-footer {
    margin-left: -0.75em;
    margin-bottom: -0.75em;
    margin-right: -0.75em;
    margin-top: 0.75em;
}

span.alert {
    padding: 4px;
    padding-left: 8px;
    padding-right: 8px;
    margin-left: 8px;
}

.validation-error {
    color: red;
}

.spinner-border {
    position: absolute;
    top: 50%;
    left: 22.5%;
}

.md-wrapper {
    position: relative;
}

#bodyMd {
    border-radius: 5px;
}

#titleBox:not(:focus) {
	background-color: rgba(255, 255, 255, 0.05);
    border-style: none;
	color: v-bind(textColor);
}

#titleBox {
	background-color: rgba(255, 255, 255, 0.1);
    border-style: none;
	color: v-bind(textColor);
}

#attributionMd {
    height: 125px;
    border-radius: 5px;
}

.lang-icon {
    background-image: url('/images/lang-flags.png');
    margin-right: 6px;
}

.lang-icon-zh {
  background-position: -550px -105px;
}

.dropdown-menu {
    background-color: v-bind(bgColor);
    filter: brightness(120%);
}

.dropdown-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: v-bind(textColor);
}

.dropdown-item.dropdown-active {
    background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-item {
    color: v-bind(textColor);
    display: flex;
    border-radius: 5px;
    align-items: center;
}

.dropdown-toggle {
    display: flex;
    align-items: center;
}

</style>

<style>

svg.md-editor-icon {
    height: 24px;
    width: 24px;
}

.md-outer-editor {
    --md-color: v-bind(textColor);
    --md-bk-color: rgba(255, 255, 255, 0.05);
}

.md-editor-resize-operate {
    background-color: var(--md-color) !important;
}

.cm-editor {
    background-color: rgba(0, 0, 0, 0);
}

</style>