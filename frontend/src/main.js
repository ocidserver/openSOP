import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Ripple from 'primevue/ripple'
import Tooltip from 'primevue/tooltip'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

// PrimeVue CSS
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

// Sakai Base Styles
import './assets/styles/base.scss'

// Sakai Layout CSS
import './layout/layout.scss'

// BPMN.js Styles
import './assets/styles/bpmn.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

// Restore auth state from localStorage
const authStore = useAuthStore()
authStore.restoreAuth()

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: '.p-dark',
      cssLayer: false
    }
  },
  ripple: true
})
app.use(ToastService)
app.use(ConfirmationService)

// Directives
app.directive('ripple', Ripple)
app.directive('tooltip', Tooltip)

app.mount('#app')
