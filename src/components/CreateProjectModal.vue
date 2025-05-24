<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">Create New Project</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Project Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            v-model="description"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          ></textarea>
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
            :disabled="createProjectState.isLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
          >
            {{ createProjectState.isLoading ? 'Creating...' : 'Create Project' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { createProjectState, toastState } from '../stores/componentState'
import { createProject } from '../services/api'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'project-created'])

// Computed properties for two-way binding
const name = computed({
  get: () => createProjectState.getFormData.name,
  set: (value) => createProjectState.updateFormField('name', value)
})

const description = computed({
  get: () => createProjectState.getFormData.description,
  set: (value) => createProjectState.updateFormField('description', value)
})

const handleSubmit = async () => {
  try {
    createProjectState.setLoading(true)
    const formData = {
      name: name.value,
      description: description.value
    }
    const project = await createProject(formData)
    toastState.addNotification('success', 'Project created successfully')
    emit('project-created', project)
    handleClose()
  } catch (error) {
    console.error('Error creating project:', error)
    toastState.addNotification('error', 'Failed to create project')
  } finally {
    createProjectState.setLoading(false)
  }
}

const handleClose = () => {
  createProjectState.resetForm()
  emit('close')
}

// Reset form when modal is closed
watch(() => props.show, (newValue) => {
  if (!newValue) {
    createProjectState.resetForm()
  }
})
</script> 