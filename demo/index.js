import Vue from 'vue'
import Demo from './Demo.vue'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faHeadphones,faHeadset,faMicrophone,faVolumeHigh,faPlug,faLink,faBatteryFull,faBatteryEmpty,faBatteryHalf,faBatteryQuarter,faBatteryThreeQuarters } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faHeadphones,faHeadset,faMicrophone,faVolumeHigh,faPlug,faLink,faBatteryFull,faBatteryEmpty,faBatteryHalf,faBatteryQuarter,faBatteryThreeQuarters)

/* add font awesome icon component */
Vue.component('font-awesome-icon', FontAwesomeIcon)

new Vue({
  el: '#app',
  render: (h) => h(Demo)
})
