import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// Setup Pinia
const pinia = createPinia()
app.use(pinia)

// Setup Vue Query with specified configuration
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        networkMode: 'always',
        staleTime: Infinity,
        gcTime: 60 * 60 * 1000,
      },
    },
  },
})

// Setup Vue Router
app.use(router)

app.mount('#app')

