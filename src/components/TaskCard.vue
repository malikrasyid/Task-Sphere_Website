<template>
  <div class="bg-white rounded-lg border-gray-200 shadow-sm hover:shadow-md transition-all p-4 group relative">
    <!-- Task Header -->
    <div class="flex justify-between items-start mb-2">
      <span class="font-medium text-gray-900">{{ task.name }}</span>
      <span class="px-2 py-1 rounded text-white text-xs" :style="{ backgroundColor: getTaskColor(task.status) }">
        {{ task.status }}
      </span>
    </div>

    <div class="text-sm text-gray-600 mb-3">{{ task.deliverable }}</div>

    <div class="flex items-center text-xs text-gray-500 mb-3">
      
      {{ formatDateUTC(task.startDate) }} - {{ formatDateUTC(task.endDate) }}
    </div>

    <!-- Action Buttons -->
    <div class="opacity-0 group-hover:opacity-100 flex justify-end space-x-2 mb-3 transition-opacity">
      <button @click="handleMarkAsDone" class="bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-md flex items-center">
        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Complete
      </button>

      <button @click="handleDelete" class="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-md flex items-center">
        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142..." />
        </svg>
        Delete
      </button>
    </div>

    <!-- Comments Section -->
    <div class="pt-3 border-t border-gray-100">
      <div class="flex items-center text-xs font-medium text-gray-700 mb-2">
        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 5v8a2 2 0..." clip-rule="evenodd" />
        </svg>
        Comments ({{ taskCardState.getComments(taskId).length }})
      </div>

      <!-- Loading State -->
      <div v-if="taskCardState.isLoadingComments(taskId)" class="text-sm text-gray-400 text-center py-4">
        Loading comments...
      </div>

      <!-- Loaded Comments -->
      <template v-else>
        <div class="comments-container max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1">
          <CommentsList
            :comments="taskCardState.getComments(taskId)"
            :project-id="projectId"
            :task-id="taskId"
            :loading="false"
            @comment-deleted="loadComments"
          />
        </div>

        <div class="flex mt-2">
          <input
            v-model="newCommentValue"
            type="text"
            class="flex-grow border border-gray-200 rounded-l-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Add a comment..."
            @keyup.enter="handleAddComment"
          />
          <button 
          @click="handleAddComment"
          class="bg-indigo-600 text-white px-3 py-1 rounded-r-md text-sm hover:bg-indigo-700 transition-colors"
        >
          Send
        </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { formatDateUTC, showToast, getTaskColor } from '../services/utils'
import CommentsList from './CommentList.vue'
import { 
  fetchComments, 
  updateTask ,
  deleteTask,
  addComment,
  sendNotification
} from '../services/api'
import { taskCardState, toastState } from '../stores/componentState'

const props = defineProps({
  task: { type: Object, required: true },
  projectId: { type: String, required: true }
})

const emit = defineEmits(['comment-deleted'])

// Computed properties
const taskId = computed(() => props.task.taskId || props.task.id)
const newCommentValue = computed({
  get: () => taskCardState.getNewComment(taskId.value),
  set: (value) => taskCardState.setNewComment(taskId.value, value)
})

onMounted(async () => {
  await loadComments()
})

const loadComments = async () => {
  if (!taskId.value) {
    console.error('No task ID found')
    return
  }
  
  taskCardState.setLoadingComments(taskId.value, true)
  
  try {
    const fetchedComments = await fetchComments(props.projectId, taskId.value)
    taskCardState.setComments(taskId.value, fetchedComments.comments || [])
  } catch (error) {
    console.error('Error loading comments:', error)
    taskCardState.setComments(taskId.value, [])
    toastState.addNotification('error', 'Failed to load comments')
  } finally {
    taskCardState.setLoadingComments(taskId.value, false)
  }
}

const handleMarkAsDone = async () => {
  if (!taskId.value) {
    console.error('No task ID found')
    return
  }
  
  try {
    await updateTask(props.projectId, taskId.value, { status: 'Done' })

    const userId = sessionStorage.getItem("userId")
    await sendNotification(
      userId,
      'Task Completed',
      `Task has been marked as Done`
    )

    toastState.addNotification('success', 'Task marked as done!')
  } catch (error) {
    console.error('Error marking task as done:', error)
    toastState.addNotification('error', 'Failed to mark task as done')
  }
}

const handleDelete = async () => {
  if (!taskId.value) {
    console.error('No task ID found')
    return
  }
  
  try {
    await deleteTask(props.projectId, taskId.value)
    toastState.addNotification('success', 'Task deleted successfully!')
  } catch (error) {
    console.error('Error deleting task:', error)
    toastState.addNotification('error', 'Failed to delete task')
  }
}

const handleAddComment = async () => {
  if (!newCommentValue.value.trim() || !taskId.value) return

  try {
    await addComment(props.projectId, taskId.value, { message: newCommentValue.value })
    taskCardState.clearNewComment(taskId.value)
    await loadComments()
    toastState.addNotification('success', 'Comment added!')
  } catch (error) {
    console.error('Error adding comment:', error)
    toastState.addNotification('error', 'Failed to add comment')
  }
}
</script>
