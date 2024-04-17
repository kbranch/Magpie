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

window.vueApp = createApp(App).mount('#app');

addCssLink("/lib/bootstrap/css/bootstrap.min.css");
addCssLink("/css/vue-legacy.css");
addCssLink("/css/icons.css", "iconsSheet");
addCssLink("/css/theme.css", "themeSheet");
addCssLink("/css/animate.min.css");
addCssLink("/lib/summernote/summernote-lite.css");