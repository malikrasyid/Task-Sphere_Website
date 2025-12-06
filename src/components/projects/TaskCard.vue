<template>
  <div class="bg-white rounded-xl p-5 group relative transition-all duration-300">
    <div class="flex justify-between items-start mb-3">
      <h4 class="font-bold text-lg text-gray-900 pr-4">{{ task.name }}</h4>
      <span 
        class="px-3 py-1 rounded-full text-white text-xs font-semibold flex-shrink-0" 
        :style="{ backgroundColor: getTaskColor(task.status) }"
      >
        {{ task.status }}
      </span>
    </div>

    <p class="text-sm text-gray-600 mb-4">{{ task.deliverable }}</p>

    <div class="flex justify-between items-center mb-4 border-t border-gray-100 pt-3 min-h-[32px]">
      <div class="flex items-center text-xs text-gray-500 mb-4 pt-3">
        <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="font-medium text-gray-700 mr-2">Due:</span> 
        {{ formatDateUTC(task.endDate) }}
      </div>

      <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button 
          @click="handleMarkAsDone" 
          class="text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors p-1.5 rounded-md"
          title="Mark as Complete"
          :disabled="task.status === 'Done'"
          :class="{ 'opacity-50 cursor-not-allowed': task.status === 'Done' }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>

        <button 
          @click="handleDelete" 
          class="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors p-1.5 rounded-md"
          title="Delete Task"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-100">
      <div class="flex items-center justify-between text-sm font-medium text-gray-700 mb-3">
        <span class="flex items-center">
          <svg class="w-4 h-4 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm4 0h2v2h-2V8z" clip-rule="evenodd"></path>
          </svg>
          Comments ({{ taskCardState.getComments(taskId).length }})
        </span>
        <button 
          @click="loadComments" 
          class="text-xs text-indigo-600 hover:text-indigo-800 focus:outline-none"
          title="Refresh Comments"
        >
          <svg class="w-4 h-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 15m4.356-4H4v5m14-4a8.001 8.001 0 00-15.356 3H21v-5"></path>
          </svg>
        </button>
      </div>

      <div v-if="taskCardState.isLoadingComments(taskId)" class="text-sm text-gray-400 text-center py-4">
        Loading comments...
      </div>

      <template v-else>
        <div class="comments-container max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1 space-y-3">
          <CommentsList
            :comments="taskCardState.getComments(taskId)"
            :project-id="projectId"
            :task-id="taskId"
            :loading="false"
            @comment-deleted="loadComments"
          />
        </div>

        <div class="flex mt-3">
          <input
            v-model="newCommentValue"
            type="text"
            class="flex-grow border border-gray-300 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            placeholder="Add a comment..."
            @keyup.enter="handleAddComment"
          />
          <button 
          @click="handleAddComment"
          class="bg-indigo-600 text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
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
import { formatDateUTC, getTaskColor } from '../../services/utils'
import CommentsList from './CommentList.vue'
import { 
  fetchComments, 
  updateTask ,
  deleteTask,
  addComment,
  sendNotification
} from '../../services/api'
import { taskCardState, toastState } from '../../stores/componentState'

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