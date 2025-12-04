<template>
  <div class="space-y-3">
    <div 
      v-for="comment in comments" 
      :key="comment.commentId"
      class="bg-gray-100 rounded-lg p-3 text-sm relative group transition-colors hover:bg-gray-200"
    >
      <div class="flex justify-between items-start mb-1">
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
          <span class="font-semibold text-gray-800 text-xs">{{ commentListState.getUserName(comment.userId) }}</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="text-xs text-gray-500 flex-shrink-0">
            {{ formatDateUTC(comment.timestamp) }}
          </span>
          <button 
            @click="handleDeleteComment(comment.commentId)"
            class="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-white"
            title="Delete comment"
            :disabled="commentListState.isDeletingComment(comment.commentId)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <p class="text-gray-700 pl-5 leading-relaxed">{{ comment.message }}</p>
    </div>
    
    <div v-if="!comments.length" class="text-gray-500 text-sm text-center py-2 bg-white rounded-lg border border-gray-200">
      No comments yet. Be the first to comment!
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { formatDateUTC, toTitleCase } from '../../services/utils'
import { commentListState, toastState } from '../../stores/componentState'
import { deleteComment, fetchUserById } from '../../services/api'

const props = defineProps({
  comments: Array,
  projectId: {
    type: String,
    required: true
  },
  taskId: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'comment-deleted', 'task-updated'])

const loadUserNames = async (comments) => {
  if (!comments) return
  
  for (const comment of comments) {
    if (!commentListState.getUserName(comment.userId) || commentListState.getUserName(comment.userId) === 'Loading...') {
      commentListState.setLoadingUser(comment.userId, true)
      try {
        const user = await fetchUserById(comment.userId)
        commentListState.setUserName(
          comment.userId, 
          toTitleCase(user.name || user || user.username || 'Unknown User')
        )
      } catch (error) {
        console.error('Error loading user:', error)
        commentListState.setUserName(comment.userId, 'Unknown User')
      } finally {
        commentListState.setLoadingUser(comment.userId, false)
      }
    }
  }
}

// Watch for changes in comments array
watch(() => props.comments, async (newComments) => {
  if (newComments) {
    await loadUserNames(newComments)
  }
}, { immediate: true })

const handleDeleteComment = async (commentId) => {
  if (!confirm('Are you sure you want to delete this comment?')) {
    return
  }

  commentListState.setDeletingComment(commentId, true)
  try {
    await deleteComment(props.projectId, props.taskId, commentId)
    emit('comment-deleted')
    toastState.addNotification('success', 'Comment deleted successfully')
  } catch (error) {
    console.error('Error deleting comment:', error)
    toastState.addNotification('error', 'Failed to delete comment')
  } finally {
    commentListState.setDeletingComment(commentId, false)
  }
}

onMounted(async () => {
  await loadUserNames(props.comments)
})
</script>

<style scoped>
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>