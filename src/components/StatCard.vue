<template>
    <div class="bg-white shadow-lg rounded-xl p-5 border border-gray-100 transition-shadow duration-300 hover:shadow-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">{{ title }}</p>
          <h3 class="text-3xl font-extrabold mt-1" :class="textColor">{{ value }}</h3>
        </div>
        <div class="rounded-full p-3 flex-shrink-0" :class="bgColor">
          <slot name="icon">
            <svg class="w-6 h-6" :class="textColor" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"></path>
            </svg>
          </slot>
        </div>
      </div>
      <slot name="extra"></slot>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  const props = defineProps({
    title: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    bgColor: {
      type: String,
      default: 'bg-indigo-50'
    },
    textColor: {
      type: String,
      default: 'text-indigo-600'
    }
  });
  </script>