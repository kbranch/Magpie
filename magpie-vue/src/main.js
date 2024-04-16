// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import 'jquery'
// import 'summernote'
// import 'jquery/dist/jquery.min.js';
// import './assets/main.css'

// import './static/css/site.css'
// import './static/css/icons.css'
// import './static/css/theme.css'
// import './static/css/animate.min.css'

// import SummernoteEditor from 'vue3-summernote-editor'

import { createApp } from 'vue'
import App from './App.vue'

function addCssLink(href, id='') {
  var link = document.createElement("link");
  link.href = href;
  link.id = id;
  link.type = "text/css";
  link.rel = "stylesheet";

  document.getElementsByTagName("head")[0].appendChild(link);
}

createApp(App).mount('#app');

addCssLink("/lib/bootstrap/css/bootstrap.min.css");
addCssLink("/css/site.css");
addCssLink("/css/icons.css", "iconsSheet");
addCssLink("/css/theme.css", "themeSheet");
addCssLink("/css/animate.min.css");
addCssLink("/lib/summernote/summernote-lite.css");

// App.component('SummernoteEditor', SummernoteEditor);