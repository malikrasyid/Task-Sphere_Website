  
<script setup>
import { defineProps, defineEmits } from 'vue';
import NotificationList from '../NotificationList.vue';
  
defineProps({
  initials: { type: String, required: true },
  fullName: { type: String, required: true },
  firstName: { type: String, required: true },
  email: { type: String, required: true },
  showDropdown: { type: Boolean, required: true },
  isExpanded: { type: Boolean, required: true }
});
  
defineEmits([
  'toggle-desktop-sidebar', 
  'toggle-profile-dropdown', 
  'logout'
]);
</script>
<template>
    <header class="bg-white w-full h-16 fixed top-0 left-0 z-30">
      <div class="flex items-center justify-between h-full px-3">
        
        <div class="flex items-center">
          <button 
            @click="$emit('toggle-desktop-sidebar')" 
            class="text-gray-600 focus:outline-none mr-2 p-2 rounded-md hover:bg-indigo-50"
            aria-label="Toggle sidebar"
            :title="isExpanded ? 'Collapse Menu' : 'Expand Menu'"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <h1 class="text-xl font-bold text-gray-900 flex items-center">
            <svg class="w-6 h-6 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            Task Sphere
          </h1>
        </div>
  
        <div class="flex items-center">            
          <NotificationList class="notification-button mr-1" />
          
          <div class="relative profile-button">
            <button 
              @click="$emit('toggle-profile-dropdown')" 
              class="flex items-center focus:outline-none p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
            >
              <div class="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium text-sm border-2 border-indigo-600">
                <span>{{ initials }}</span>
              </div>
              <span class="text-sm font-medium text-gray-700 ml-2 hidden sm:inline">{{ firstName }}</span>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <div 
              v-if="showDropdown" 
              class="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl py-1 z-50 transition ease-out duration-100 shadow-lg"
            >
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900 truncate">{{ fullName }}</p>
                <p class="text-xs text-gray-500 truncate">{{ email }}</p>
              </div>
              <button 
                @click="$emit('logout')" 
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  </template>
