<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">Add Team Member</h2>
        <button @click="handleClose" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <!-- Search input -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700">Search Users</label>
          <div class="mt-1 relative">
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="Search by name or email"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              @input="handleSearch"
            />
            <div v-if="addMemberState.isLoading" class="absolute right-3 top-2">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>

        <!-- Search results -->
        <div v-if="searchResults.length > 0" class="max-h-60 overflow-y-auto">
          <div
            v-for="user in searchResults"
            :key="user.userId"
            class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span class="text-indigo-600 font-medium">{{ user.firstName.charAt(0) || 'U' }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</p>
                <p class="text-xs text-gray-500">{{ user.email }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <select 
                v-model="user.role" 
                class="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                :disabled="addMemberState.isLoading"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                @click="handleAddMember(user)"
                class="text-sm text-indigo-600 hover:text-indigo-700"
                :disabled="addMemberState.isLoading"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <!-- No results -->
        <div v-else-if="searchQuery && !addMemberState.isLoading" class="text-center py-4 text-gray-500">
          No users found
        </div>

        <!-- Selected members -->
        <div v-if="selectedMembers.length > 0" class="mt-4">
          <h3 class="text-sm font-medium text-gray-700 mb-2">Selected Members</h3>
          <div class="space-y-2">
            <div
              v-for="member in selectedMembers"
              :key="member.userId"
              class="flex items-center justify-between p-2 bg-gray-50 rounded-md"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span class="text-indigo-600 font-medium">{{ member.firstName.charAt(0) || 'U'}}</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ member.firstName }} {{ member.lastName }}</p>
                  <p class="text-xs text-gray-500">{{ member.email }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs px-2 py-1 rounded-full" :class="{
                  'bg-blue-100 text-blue-800': member.role === 'member',
                  'bg-purple-100 text-purple-800': member.role === 'admin'
                }">
                  {{ member.role }}
                </span>
                <button
                  @click="handleRemoveMember(member)"
                  class="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end space-x-3 mt-4">
          <button
            @click="handleClose"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="addMemberState.isLoading || selectedMembers.length === 0"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
          >
            {{ addMemberState.isLoading ? 'Adding...' : 'Add Members' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { debounce } from '../../services/utils'
import { addMemberState, toastState } from '../../stores/componentState'
import { addMemberToProject, searchUser } from '../../services/api'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  projectId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'members-added'])

// Computed properties for two-way binding
const searchQuery = computed({
  get: () => addMemberState.getSearchQuery,
  set: (value) => addMemberState.setSearchQuery(value)
})

const searchResults = computed(() => addMemberState.getSearchResults)
const selectedMembers = computed(() => addMemberState.getSelectedMembers)

// Debounced search function
const handleSearch = debounce(async () => {
  if (!searchQuery.value) {
    addMemberState.setSearchResults([])
    return
  }

  try {
    console.log('⏳ Starting search...');
    addMemberState.setLoading(true);
    
    const results = await searchUser(searchQuery.value);
    console.log('📊 Search results received:', results);
    console.log('📊 Results type:', typeof results);
    
    // Fix: Extract users array from the response object
    let userArray = [];
    if (results && results.users && Array.isArray(results.users)) {
      userArray = results.users;
    } else if (Array.isArray(results)) {
      userArray = results;
    } else {
      console.log('⚠️ Unexpected results format:', results);
      userArray = [];
    }
    
    console.log('📊 Extracted user array:', userArray);
    console.log('📊 User array length:', userArray.length);
    
    // Filter out already selected members
    const filteredResults = userArray.filter(user => {
      if (!user || !user.userId) { // Note: using userId instead of id
        console.log('⚠️ Invalid user object:', user);
        return false;
      }
      
      const isAlreadySelected = selectedMembers.value.some(member => member.userId === user.userId);
      if (isAlreadySelected) {
        console.log('🔄 User already selected:', user.firstName || user.userId);
      }
      return !isAlreadySelected;
    });
    
    console.log('📊 Filtered results:', filteredResults);
    console.log('📊 Setting search results to state...');
    
    addMemberState.setSearchResults(filteredResults);
    
    // Additional logging
    console.log('📊 Search results set. Current state:', addMemberState.getSearchResults);
    
    if (filteredResults.length === 0) {
      console.log('ℹ️ No users found after filtering');
    } else {
      console.log(`✅ Found ${filteredResults.length} users after filtering`);
    }
    
  } catch (error) {
    console.error('❌ Error in handleSearch:', error);
    console.error('❌ Error stack:', error.stack);
    
    // More specific error handling
    if (error.message.includes('403')) {
      toastState.addNotification('warning', 'You do not have permission to search users');
    } else if (error.message.includes('401')) {
      toastState.addNotification('error', 'Please log in again');
    } else if (error.message.includes('500')) {
      toastState.addNotification('error', 'Server error. Please try again later.');
    } else {
      toastState.addNotification('error', `Search failed: ${error.message}`);
    }
    
    addMemberState.setSearchResults([]);
  } finally {
    console.log('🏁 Search completed, setting loading to false');
    addMemberState.setLoading(false);
  }
}, 300);

const handleAddMember = (user) => {
  // Ensure user has a role, default to 'member' if not set
  const userWithRole = {
    ...user,
    role: user.role || 'member'
  }
  addMemberState.addSelectedMember(userWithRole)
}

const handleRemoveMember = (member) => {
  addMemberState.removeSelectedMember(member)
}

const handleSubmit = async () => {
  try {
    addMemberState.setLoading(true)
    
    // Validate data before sending
    if (!props.projectId) {
      throw new Error('Project ID is missing');
    }
    
    if (!selectedMembers.value || selectedMembers.value.length === 0) {
      throw new Error('No members selected');
    }
    
    // Add members one by one since the backend expects single user format
    for (const member of selectedMembers.value) {
      if (!member.userId || !member.role) {
        throw new Error(`Invalid member data: ${JSON.stringify(member)}`);
      }
      
      console.log('🚀 Adding member:', member);
      
      // Send individual member data in the format the backend expects
      const userData = {
        userId: member.userId,
        role: member.role
      };
      await addMemberToProject(props.projectId, userData);
    }
    
    console.log('✅ All members added successfully');
    toastState.addNotification('success', 'Members added successfully')
    emit('members-added')
    handleClose()
  } catch (error) {
    console.error('❌ Error adding members:', error)
    };
}

const handleClose = () => {
  addMemberState.resetState()
  emit('close')
}

// Clear search when modal is closed
watch(() => props.show, (newValue) => {
  if (!newValue) {
    addMemberState.resetState()
  }
})
</script> 