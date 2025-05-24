import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router'
import { initializeSockets } from './services/socket'
import './stores/componentState' // Import the reactive state

// Initialize sockets
initializeSockets()

// Create the Vue app
const app = createApp(App)

// Add router
app.use(router)

// Mount the app
app.mount('#app')
