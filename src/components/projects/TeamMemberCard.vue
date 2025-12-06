<template>
  <div class="bg-slate-200 rounded-lg flex items-center p-3 hover:bg-gray-50 transition-colors">
    <div class="h-8 w-8 rounded-full bg-white text-indigo-700 flex items-center justify-center font-bold mr-3">
      {{ userInitial }}
    </div>
    <div>
      <div class="font-medium text-gray-800">{{ userName }}</div>
      <div class="text-xs text-gray-500">{{ member.role }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { toTitleCase } from '../../services/utils'
import { teamMemberState } from '../../stores/componentState'
import { fetchUserById } from '../../services/api'

const props = defineProps({
  member: {
    type: Object,
    required: true
  }
})

// Computed property for user name
const userName = computed(() => teamMemberState.getUserName(props.member.userId))

// Computed property for user initial
const userInitial = computed(() => {
  const name = userName.value;
  return name.charAt(0).toUpperCase();
})

onMounted(async () => {
  await loadUserName()
})

const loadUserName = async () => {
  const userId = props.member.userId
  
  // Only load if not already loaded
  if (!teamMemberState.getUserName(userId) || teamMemberState.getUserName(userId) === 'Unknown User') {
    teamMemberState.setLoadingUser(userId, true)
    try {
      const user = await fetchUserById(userId)
      teamMemberState.setUserName(
        userId, 
        toTitleCase(user.name || user || user.username || 'Unknown User')
      )
    } catch (error) {
      console.error('Error loading user:', error)
      teamMemberState.setUserName(userId, 'Unknown User')
    } finally {
      teamMemberState.setLoadingUser(userId, false)
    }
  }
}
</script>