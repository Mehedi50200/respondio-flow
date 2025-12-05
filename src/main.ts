import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import './style.css'
import { useTheme } from './composables/useTheme'

// Initialize theme before app mounts
useTheme().initTheme()

// Import Vue Flow styles
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

// Import custom node components
import TriggerNode from './components/nodes/TriggerNode.vue'
import SendMessageNode from './components/nodes/SendMessageNode.vue'
import AddCommentNode from './components/nodes/AddCommentNode.vue'
import BusinessHoursNode from './components/nodes/BusinessHoursNode.vue'
import DateTimeConnectorNode from './components/nodes/DateTimeConnectorNode.vue'

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

// Register custom node components globally
app.component('TriggerNode', TriggerNode)
app.component('SendMessageNode', SendMessageNode)
app.component('AddCommentNode', AddCommentNode)
app.component('BusinessHoursNode', BusinessHoursNode)
app.component('DateTimeConnectorNode', DateTimeConnectorNode)

app.mount('#app')
