<script setup>
import { onMounted, onUnmounted } from 'vue';
import ToastNotification from './ToastNotification.vue';
import { toastState } from '../stores/componentState';

// Listen for toast events
onMounted(() => {
  window.addEventListener('show-toast', handleToastEvent);
});

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('show-toast', handleToastEvent);
});

// Handle toast event
function handleToastEvent(event) {
  const { type, message, duration } = event.detail;
  toastState.addNotification(type, message);
}
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <ToastNotification
        v-for="toast in toastState.getNotifications"
        :key="toast.id"
        :type="toast.type"
        :message="toast.message"
        :onClose="() => toastState.removeNotification(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style> 