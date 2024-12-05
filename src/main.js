import { createWebHistory, createRouter } from 'vue-router'
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import MapBroadcast from './views/MapBroadcast.vue';
import ItemsBroadcast from './views/ItemsBroadcast.vue';
import MainTracker from './views/MainTracker.vue';
import EventRestream from './views/EventRestream.vue';

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