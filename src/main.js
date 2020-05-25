import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'lightbox2/dist/js/lightbox-plus-jquery.min.js';
import 'lightbox2/dist/css/lightbox.min.css';
import VueSilentbox from 'vue-silentbox'

import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

Vue.use(VueSilentbox);

new Vue({
  render: h => h(App)
}).$mount('#app');
