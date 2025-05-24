<script setup>
import { ref, onMounted, onUnmounted, computed, provide } from 'vue';
import { getNotificationsSocket } from './services/socket';
import LoginForm from './components/LoginForm.vue';
import ToastContainer from './components/ToastContainer.vue';
import { toastState } from './stores/componentState';

// State - using local refs for UI state that's specific to App.vue
const showSidebar = ref(false);
const showProfileDropdown = ref(false);
const toastContainerRef = ref(null);
const isAuthenticated = ref(false);
const user = ref(null);
const notifications = ref([]);
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

// Check authentication status
function checkAuth() {
  const token = sessionStorage.getItem('sessionToken');
  const storedUser = sessionStorage.getItem('user');
  if (token && storedUser) {
    isAuthenticated.value = true;
    user.value = JSON.parse(storedUser);
    return true;
  }
  isAuthenticated.value = false;
  user.value = null;
  return false;
}

// Update authentication state
function updateAuthState() {
  checkAuth();
}

// Provide the updateAuthState function to child components
provide('updateAuthState', updateAuthState);

// Toggle profile dropdown
function toggleProfileDropdown() {
  showProfileDropdown.value = !showProfileDropdown.value;
}

// Close profile dropdown when clicking outside
function handleClickOutside(event) {
  const profileButton = document.querySelector('.profile-button');
  if (profileButton && !profileButton.contains(event.target)) {
    showProfileDropdown.value = false;
  }
}

// Add click outside listener
onMounted(() => {
  // Check if user is already authenticated
  checkAuth();
  
  // Set up socket event listeners
  const notificationsSocket = getNotificationsSocket();
  if (notificationsSocket) {
    notificationsSocket.on('notification', handleNotification);
  }
  
  // Set up session expiration event listener
  window.addEventListener('session-expired', handleSessionExpired);

  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
});

// Clean up event listeners on unmount
onUnmounted(() => {
  const notificationsSocket = getNotificationsSocket();
  if (notificationsSocket) {
    notificationsSocket.off('notification', handleNotification);
  }
  
  window.removeEventListener('session-expired', handleSessionExpired);
  document.removeEventListener('click', handleClickOutside);
});

// Handle notification from socket
function handleNotification(data) {
  if (!data) return;
  
  // Add new notification to the list
  notifications.value.unshift({
    id: Date.now(),
    message: data.message,
    type: data.type,
    read: false,
    timestamp: new Date()
  });
  
  // Show toast notification
  toastState.addNotification(data.type, data.message);
}

// Handle session expiration
function handleSessionExpired() {
  isAuthenticated.value = false;
  user.value = null;
  sessionStorage.removeItem('sessionToken');
  sessionStorage.removeItem('user');
}

// Toggle sidebar
function toggleSidebar() {
  showSidebar.value = !showSidebar.value;
}

// Logout
function logout() {
  isAuthenticated.value = false;
  user.value = null;
  sessionStorage.removeItem('sessionToken');
  sessionStorage.removeItem('user');
}

// Computed properties
const initials = computed(() => {
  if (!user.value) return '';
  const { firstName, lastName } = user.value;
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
});

const fullName = computed(() => {
  if (!user.value) return '';
  const { firstName, lastName } = user.value;
  return `${firstName || ''} ${lastName || ''}`.trim();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Auth Section -->
    <div v-if="!isAuthenticated" class="h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Task Sphere</h1>
          <p class="text-gray-600">Project Management Platform</p>
        </div>
        
        <!-- Login Form -->
        <LoginForm />
      </div>
    </div>
    
    <!-- Main Application -->
    <div v-else class="flex h-screen overflow-hidden">
      <!-- Overlay for mobile when sidebar is open -->
      <div 
        v-if="showSidebar" 
        @click="toggleSidebar" 
        class="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden transition-opacity duration-300"
      ></div>
      
      <!-- Sidebar -->
      <aside 
        class="fixed lg:static inset-y-0 left-0 w-64 bg-indigo-800 text-white z-30 transform transition-transform duration-300 ease-in-out"
        :class="showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      >
        <div class="p-4 border-b border-indigo-700 flex justify-between items-center">
          <h1 class="text-xl font-bold">Task Sphere</h1>
          <button 
            @click="toggleSidebar" 
            class="lg:hidden text-white focus:outline-none"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <nav class="mt-4">
          <router-link 
            to="/dashboard" 
            class="flex items-center px-4 py-3 text-white hover:bg-indigo-700"
            :class="{ 'bg-indigo-700': $route.path === '/dashboard' }"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Dashboard
          </router-link>
          <router-link 
            to="/projects" 
            class="flex items-center px-4 py-3 text-white hover:bg-indigo-700"
            :class="{ 'bg-indigo-700': $route.path === '/projects' }"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            Projects
          </router-link>
          <router-link 
            to="/calendar" 
            class="flex items-center px-4 py-3 text-white hover:bg-indigo-700"
            :class="{ 'bg-indigo-700': $route.path === '/calendar' }"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Calendar
          </router-link>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col w-full">
        <!-- Header -->
        <header class="bg-white shadow-sm sticky top-0 z-20">
          <div class="relative flex items-center h-16 px-4">
            <div class="flex items-center flex-shrink-0">
              <button 
                @click="toggleSidebar" 
                class="text-gray-600 focus:outline-none mr-3"
                aria-label="Toggle sidebar"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <h1 class="text-xl font-semibold text-gray-800">Task Sphere</h1>
            </div>
            
            <!-- Right side controls -->
            <div class="flex items-center space-x-4 absolute right-4 top-1/2 transform -translate-y-1/2">
              <!-- Notifications -->
              <div class="relative">
                <button class="p-1 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                  <span 
                    v-if="unreadCount > 0" 
                    class="absolute top-0 right-0 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {{ unreadCount }}
                  </span>
                </button>
              </div>
              
              <!-- User profile -->
              <div class="relative">
                <button 
                  @click="toggleProfileDropdown" 
                  class="flex items-center focus:outline-none"
                >
                  <div class="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium">
                    <span>{{ initials }}</span>
                  </div>
                  <svg class="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <!-- Profile dropdown -->
                <div 
                  v-if="showProfileDropdown" 
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                >
                  <div class="px-4 py-2 text-sm text-gray-700 border-b">
                    {{ fullName }}
                  </div>
                  <button 
                    @click="logout" 
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 p-6 overflow-y-auto">
          <div class="max-w-7xl mx-auto h-full">
            <router-view></router-view>
          </div>
        </main>
      </div>
    </div>
    
    <!-- Toast Container -->
    <ToastContainer ref="toastContainerRef" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
