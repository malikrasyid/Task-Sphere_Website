<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Props
const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'error', 'warning'].includes(value)
  },
  message: {
    type: String,
    required: true
  },
  onClose: {
    type: Function,
    default: () => {}
  }
});

// State
const isVisible = ref(false);
let timer = null;

// Show the toast and set up auto-hide timer
onMounted(() => {
  // Show toast after a small delay for animation
  setTimeout(() => {
    isVisible.value = true;
  }, 10);
  
  // Set up timer to auto-hide
  timer = setTimeout(() => {
    hideToast();
  }, 5000); // Fixed duration of 5 seconds
});

// Clear timer on unmount
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});

// Hide the toast
function hideToast() {
  isVisible.value = false;
  // Call the onClose callback after animation completes
  setTimeout(() => {
    props.onClose();
  }, 300);
}

// Get the appropriate icon and color based on toast type
const toastConfig = {
  info: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-500',
    icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>`
  },
  success: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-500',
    icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>`
  },
  error: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-500',
    icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>`
  },
  warning: {
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-500',
    icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>`
  }
};

// Get the current toast configuration
const currentConfig = toastConfig[props.type];
</script>

<template>
  <div 
    class="fixed top-4 right-4 max-w-xs w-full flex items-center p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform z-50"
    :class="[
      currentConfig.bgColor, 
      currentConfig.textColor, 
      currentConfig.borderColor,
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    ]"
  >
    <div class="flex-shrink-0" v-html="currentConfig.icon"></div>
    <div class="ml-3 mr-4 flex-grow">
      <p class="text-sm font-medium">{{ message }}</p>
    </div>
    <button 
      @click="hideToast" 
      class="flex-shrink-0 ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex items-center justify-center"
      :class="[currentConfig.textColor, 'hover:bg-opacity-20 hover:bg-gray-500 focus:ring-gray-300']"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
      </svg>
    </button>
  </div>
</template> 