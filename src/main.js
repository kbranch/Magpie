import { createWebHistory, createRouter } from 'vue-router'
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import MapBroadcast from './views/MapBroadcast.vue';
import ItemsBroadcast from './views/ItemsBroadcast.vue';
import MainTracker from './views/MainTracker.vue';
import EventRestream from './views/EventRestream.vue';
import PlayerShare from './views/PlayerShare.vue';

function addCssLink(href, id='') {
  var link = document.createElement("link");
  link.href = href;
  link.id = id;
  link.type = "text/css";
  link.rel = "stylesheet";

  document.getElementsByTagName("head")[0].appendChild(link);
};

const routes = [
  { path: '/', component: MainTracker },
  { path: '/mapBroadcast', component: MapBroadcast },
  { path: '/itemsBroadcast', component: ItemsBroadcast },
  { path: '/event', component: EventRestream, props: route => ({ eventName: route.query.eventName, viewCode: route.query.viewCode }) },
  { path: '/player/:playerName', component: PlayerShare },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const pinia = createPinia();
let app = createApp(App);

app.use(pinia);
app.use(router);
window.vueApp = app.mount('#app');
window.rateLimit = rateLimit;
window.debounce = debounce;
app.config.globalProperties.window = window;

addCssLink("/lib/bootstrap/css/bootstrap.min.css");
addCssLink("/css/vue-legacy.css");
addCssLink("/css/icons.css", "iconsSheet");
addCssLink("/css/animate.min.css");
addCssLink("/lib/summernote/summernote-lite.css");

const debouncers = {};
export function debounce(f, delay) {
  if (!(f.name in debouncers)) {
    debouncers[f.name] = setTimeout(f, delay);
    return;
  }

  if (debouncers[f.name]) {
    clearTimeout(debouncers[f.name]);
  }

  debouncers[f.name] = setTimeout(f, delay);
}

const limiters = {};
const suppressedLimiters = new Set();
export function rateLimit(f, delay) {
  if (f.name in limiters) {
    suppressedLimiters.add(f.name);
    return;
  }

  f();

  limiters[f.name] = setTimeout(() => {
    delete limiters[f.name];

    if (suppressedLimiters.has(f.name)) {
      suppressedLimiters.delete(f.name);
      rateLimit(f, delay);
    }
  }, delay);
}

export function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

window.isNumeric = isNumeric;