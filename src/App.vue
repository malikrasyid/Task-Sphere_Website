<script setup>
import { ref, onMounted, onUnmounted, computed, provide } from 'vue';
import LoginForm from './components/Auth/LoginForm.vue'; // Updated Path
import ToastContainer from './components/ToastContainer.vue';
import { TopBar, Sidebar } from './components/layout'; // New layout imports
import { authUtils } from './services/utils';

// State
const isSidebarExpanded = ref(true); // Desktop state: true (w-64) or false (w-20)
const showProfileDropdown = ref(false);
const isAuthenticated = ref(false);
const user = ref(null);

// Auth Logic
function checkAuth() {
  const { isAuthenticated: auth, user: userData } = authUtils.checkAuth();
  isAuthenticated.value = auth;
  user.value = userData;
}

function updateAuthState() {
  checkAuth();
}

function handleSessionExpired() {
  authUtils.handleSessionExpired(updateAuthState);
}

function logout() {
  authUtils.logout(updateAuthState);
}

// UI Handlers
function toggleProfileDropdown() {
  showProfileDropdown.value = !showProfileDropdown.value;
}

function toggleDesktopSidebar() {
  isSidebarExpanded.value = !isSidebarExpanded.value;
}

function toggleMobileSidebar() {
  showMobileSidebar.value = !showMobileSidebar.value;
}

function closeMobileSidebar() {
    showMobileSidebar.value = false;
}

function handleClickOutside(event) {
  const profileButton = document.querySelector('.profile-button');
  const notificationButton = document.querySelector('.notification-button');
  
  const isOutsideProfile = profileButton && !profileButton.contains(event.target);
  const isOutsideNotification = notificationButton && !notificationButton.contains(event.target);

  if (isOutsideProfile && isOutsideNotification) {
    showProfileDropdown.value = false;
  }
}

// Computed properties
const initials = computed(() => authUtils.getUserInitials(user.value));
const fullName = computed(() => authUtils.getUserName(user.value));
const firstName = computed(() => authUtils.getUserFirstName(user.value));
const email = computed(() => authUtils.getUserEmail(user.value));

// Lifecycle hooks
onMounted(() => {
  checkAuth();
  window.addEventListener('session-expired', handleSessionExpired);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('session-expired', handleSessionExpired);
  document.removeEventListener('click', handleClickOutside);
});

// Provide the updateAuthState function to child components
provide('updateAuthState', updateAuthState);
</script>

<template>
  <div class="min-h-screen bg-white">
    
    <div v-if="!isAuthenticated" class="h-screen flex items-center justify-center bg-indigo-50">
      <div class="bg-white rounded-2xl shadow-lg shadow-blue-200 p-8 max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-extrabold text-gray-900">Task Sphere</h1>
        </div>
        
        <LoginForm />
      </div>
    </div>
    
    <div v-else class="flex flex-col h-screen overflow-hidden">
      
      <TopBar 
        :initials="initials" 
        :full-name="fullName" 
        :first-name="firstName"
        :email="email"
        :show-dropdown="showProfileDropdown"
        :is-expanded="isSidebarExpanded"
        @toggle-desktop-sidebar="toggleDesktopSidebar"
        @toggle-profile-dropdown="toggleProfileDropdown"
        @logout="logout"
      />

      <div class="flex flex-1 pt-16 overflow-hidden">
            
        <Sidebar 
            :is-expanded="isSidebarExpanded" 
        />

        <main class="flex-1 p-4 sm:p-6 overflow-y-auto bg-white">
          <div class="max-w-7xl mx-auto h-full">
            <router-view></router-view>
          </div>
        </main>
      </div>
    </div>
    
    <ToastContainer />
  </div>
</template>