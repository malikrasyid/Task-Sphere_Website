<template>
  <div class="relative">
    <!-- Notification Button -->
    <button 
      @click="toggleNotifications" 
      class="p-2 text-gray-500 rounded-lg hover:bg-indigo-50 focus:outline-none relative"
    >
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

    <!-- Notification Dropdown -->
    <div 
      v-if="showNotifications" 
      class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto"
    >
      <!-- Header -->
      <div class="px-4 py-2 border-b flex justify-between items-center">
        <h3 class="text-sm font-medium text-gray-900">Notifications</h3>
        <button 
          v-if="unreadCount > 0"
          @click="markAllAsRead" 
          class="text-xs text-indigo-600 hover:text-indigo-800"
        >
          Mark all as read
        </button>
      </div>

      <!-- Notification List -->
      <div v-if="notifications.length > 0">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
          :class="{ 'bg-indigo-50': !notification.read }"
        >
          <div class="flex items-start">
            <!-- Notification Icon -->
            <div class="flex-shrink-0">
              <div 
                class="w-2 h-2 rounded-full mt-2"
                :class="{
                  'bg-blue-500': notification.type === 'info',
                  'bg-yellow-500': notification.type === 'warning',
                  'bg-red-500': notification.type === 'error'
                }"
              ></div>
            </div>
            
            <!-- Notification Content -->
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
              <p class="text-sm text-gray-500">{{ notification.body }}</p>
              <p class="text-xs text-gray-400 mt-1">
                {{ formatDate(notification.timestamp) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="px-4 py-3 text-center text-gray-500 text-sm">
        No notifications
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';

export default {
  name: 'NotificationList',
  setup() {
    const notifications = ref([]);
    const showNotifications = ref(false);
    const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

    // Fetch notifications
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        notifications.value = data.notifications || [];
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    // Toggle notifications dropdown
    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value;
      if (showNotifications.value) {
        loadNotifications();
      }
    };

    // Handle notification click
    const handleNotificationClick = async (notification) => {
      if (!notification.read) {
        try {
          await markNotificationAsRead(notification.id);
          notification.read = true;
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      }

      // Handle navigation if needed
      if (notification.projectId && notification.taskId) {
        // Navigate to task
        // You can implement navigation logic here
      } else if (notification.projectId) {
        // Navigate to project
        // You can implement navigation logic here
      }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
      try {
        await markAllNotificationsAsRead();
        notifications.value = notifications.value.map(n => ({ ...n, read: true }));
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    };

    // Format date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      
      // Less than 24 hours
      if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString();
      }
      // Less than 7 days
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString();
      }
      // More than 7 days
      return date.toLocaleDateString();
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.notification-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        showNotifications.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      loadNotifications();
    });

    return {
      notifications,
      showNotifications,
      unreadCount,
      toggleNotifications,
      handleNotificationClick,
      markAllAsRead,
      formatDate
    };
  }
};
</script>

<style scoped>
.notification-dropdown {
  max-height: 24rem;
  overflow-y: auto;
}
</style> 