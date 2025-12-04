<template>
    <div class="bg-white rounded-xl shadow-lg border border-gray-100">
      <div class="p-5 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
      </div>
      <div class="p-5">
        <ul class="space-y-4">
          <li v-if="items.length === 0" class="text-center py-4 text-gray-500">
            <p>No {{ itemType }} found</p>
          </li>
          <li 
            v-for="item in items" 
            :key="item.id || item.projectId || item.taskId" 
            class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div class="font-medium text-gray-900">{{ item.name || item.title }}</div>
            <p v-if="itemType === 'projects'" class="text-sm text-gray-500 mt-1 truncate">{{ item.description || 'No description' }}</p>
            
            <div v-if="itemType === 'tasks'" class="flex justify-between items-end mt-1">
              <p class="text-xs text-gray-500">Project: {{ item.projectName }}</p>
              <span class="px-2 py-0.5 text-white text-xs rounded-full" :style="{ backgroundColor: getTaskColor(item.status) }">
                {{ item.status }}
              </span>
            </div>
            <div v-if="itemType === 'tasks'" class="flex items-center text-xs text-gray-400 mt-2">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
              </svg>
              Due: {{ formatDateUTC(item.endDate) }}
            </div>
            
            <div v-if="itemType === 'projects'" class="flex items-center text-xs text-gray-400 mt-2">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
              </svg>
              {{ (item.team && item.team.length) || 0 }} member{{ (item.team && item.team.length !== 1) ? 's' : '' }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  import { formatDateUTC, getTaskColor } from '../services/utils';
  
  const props = defineProps({
    title: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    itemType: {
      type: String,
      validator: (value) => ['projects', 'tasks'].includes(value),
      required: true
    }
  });
  </script>