import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router'
import './stores/componentState' 

// Create the Vue app
const app = createApp(App)

// Add router
app.use(router)

// Mount the app
app.mount('#app')
