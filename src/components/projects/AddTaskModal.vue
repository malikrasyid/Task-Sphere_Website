<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">Add New Task</h2>
        <button @click="handleClose" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Task Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="deliverable" class="block text-sm font-medium text-gray-700">Deliverable</label>
          <textarea
            id="deliverable"
            v-model="deliverable"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          ></textarea>
        </div>
        <div>
          <label for="startDate" class="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            id="startDate"
            v-model="startDate"
            type="datetime-local"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="endDate" class="block text-sm font-medium text-gray-700">End Date</label>
          <input
            id="endDate"
            v-model="endDate"
            type="datetime-local"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="handleClose"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="addTaskState.isLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
          >
            {{ addTaskState.isLoading ? 'Creating...' : 'Create Task' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { addTaskState, toastState } from '../../stores/componentState'
import { addTask } from '../../services/api'

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

const emit = defineEmits(['close', 'task-added'])

// Computed properties for two-way binding
const name = computed({
  get: () => addTaskState.getFormData.name,
  set: (value) => addTaskState.updateFormField('name', value)
})

const deliverable = computed({
  get: () => addTaskState.getFormData.deliverable,
  set: (value) => addTaskState.updateFormField('deliverable', value)
})

const startDate = computed({
  get: () => addTaskState.getFormData.startDate,
  set: (value) => addTaskState.updateFormField('startDate', value)
})

const endDate = computed({
  get: () => addTaskState.getFormData.endDate,
  set: (value) => addTaskState.updateFormField('endDate', value)
})

const handleSubmit = async () => {
  try {
    addTaskState.setLoading(true)
    
    // Convert local datetime to UTC
    const startDateLocal = new Date(startDate.value)
    const endDateLocal = new Date(endDate.value)
    
    // Format to UTC ISO string
    const startDateUTC = startDateLocal.toISOString()
    const endDateUTC = endDateLocal.toISOString()
    
    const taskData = {
      name: name.value,
      deliverable: deliverable.value,
      startDate: startDateUTC,
      endDate: endDateUTC,
      status: 'Not Started' // Add default status
    }
    
    const task = await addTask(props.projectId, taskData)
    if (task) {
      toastState.addNotification('success', 'Task created successfully')
      emit('task-added', task)
      handleClose()
    }
  } catch (error) {
    console.error('Error creating task:', error)
    toastState.addNotification('error', 'Failed to create task')
  } finally {
    addTaskState.setLoading(false)
  }
}

const handleClose = () => {
  addTaskState.resetForm()
  emit('close')
}

// Reset form when modal is closed
watch(() => props.show, (newValue) => {
  if (!newValue) {
    addTaskState.resetForm()
  }
})
</script> 