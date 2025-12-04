<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  isExpanded: { type: Boolean, required: true },
});

const sidebarWidth = computed(() => props.isExpanded ? 'w-60' : 'w-16');
</script>
<template>
    <aside 
      :class="[sidebarWidth, 'static inset-y-0 left-0 top-16 bg-white z-20 flex-shrink-0 border-r border-gray-200 transition-all duration-300 ease-in-out']"
    >
      <nav class="mt-2 px-3 space-y-2">
        
        <router-link 
          to="/dashboard" 
          :title="isExpanded ? '' : 'Dashboard'"
          class="flex items-center text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          :class="{ 
            'p-2': isExpanded,
            'w-10 h-10 justify-center': !isExpanded,
            'bg-indigo-50 text-indigo-700 font-semibold': $route.path === '/dashboard', 'justify-center': !isExpanded }"
        >
          <svg class="w-6 h-6 flex-shrink-0" :class="{ 'mr-3': isExpanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span 
            v-show="isExpanded" 
            class="whitespace-nowrap overflow-hidden transition-opacity duration-150"
            :class="isExpanded ? 'opacity-100 delay-150' : 'opacity-0'"
          >
            Dashboard
          </span>
        </router-link>
        
        <router-link 
          to="/projects" 
          :title="isExpanded ? '' : 'Projects'"
          class="flex items-center text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          :class="{ 
            'p-2': isExpanded,
            'w-10 h-10 justify-center': !isExpanded,
            'bg-indigo-50 text-indigo-700 font-semibold': $route.path === '/projects', 'justify-center': !isExpanded }"
        >
          <svg class="w-6 h-6 flex-shrink-0" :class="{ 'mr-3': isExpanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <span 
            v-show="isExpanded" 
            class="whitespace-nowrap overflow-hidden transition-opacity duration-150"
            :class="isExpanded ? 'opacity-100 delay-150' : 'opacity-0'"
          >
            Projects
          </span>
        </router-link>
        
        <router-link 
          to="/calendar" 
          :title="isExpanded ? '' : 'Calendar'"
          class="flex items-center text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          :class="{ 
            'p-2': isExpanded,
            'w-10 h-10 justify-center': !isExpanded,
            'bg-indigo-50 text-indigo-700 font-semibold': $route.path === '/calendar', 'justify-center': !isExpanded }"
        >
          <svg class="w-6 h-6 flex-shrink-0" :class="{ 'mr-3': isExpanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span 
            v-show="isExpanded" 
            class="whitespace-nowrap overflow-hidden transition-opacity duration-150"
            :class="isExpanded ? 'opacity-100 delay-150' : 'opacity-0'"
          >
            Calendar
          </span>
        </router-link>
      </nav>
    </aside>
  </template>
  
