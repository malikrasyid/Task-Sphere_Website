<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import ProjectCard from './ProjectCard.vue'
import AddTaskModal from './AddTaskModal.vue'
import AddMemberModal from './AddMemberModal.vue'
import CreateProjectModal from './CreateProjectModal.vue'
import { projectListState, modalState, toastState } from '../../stores/componentState'
import { fetchProjects, fetchTasksFromProject, updateTask } from '../../services/api'

// Computed property for projects
const projects = computed(() => projectListState.getProjects)

// Auto-update interval
let statusUpdateInterval = null

onMounted(async () => {
  await loadProjects()
  await updateTaskStatuses()
  
  // Set up automatic status updates every 5 minutes
  statusUpdateInterval = setInterval(updateTaskStatuses, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval)
  }
})

const loadProjects = async () => {
  try {
    projectListState.setLoading(true)
    const response = await fetchProjects()
    // Handle the response structure where projects are nested in a 'projects' property
    projectListState.setProjects(Array.isArray(response?.projects) ? response.projects : [])
    console.log('Loaded projects:', projects.value) // Debug log
  } catch (error) {
    console.error('Error loading projects:', error)
    toastState.addNotification('error', 'Failed to load projects')
    projectListState.setProjects([])
  } finally {
    projectListState.setLoading(false)
  }
}

// Modal handlers
const handleCreateProject = () => {
  modalState.openCreateProjectModal()
}

const handleCloseCreateProjectModal = () => {
  modalState.closeCreateProjectModal()
}

const handleCloseAddTaskModal = () => {
  modalState.closeAddTaskModal()
}

const handleCloseAddMemberModal = () => {
  modalState.closeAddMemberModal()
}

const handleTaskAdded = async () => {
  modalState.closeAddTaskModal()
  await loadProjects() // Refresh projects to show new task
}

const handleMemberAdded = async () => {
  modalState.closeAddMemberModal()
  await loadProjects() // Refresh projects to show new member
}

const handleProjectCreated = async () => {
  modalState.closeCreateProjectModal()
  await loadProjects() // Refresh projects to show new project
}

// Function to automatically update task statuses based on dates
const updateTaskStatuses = async () => {
  console.log('Checking for task status updates...')
  const token = sessionStorage.getItem("sessionToken")
  if (!token) return
  
  try {
    let updatedCount = 0
    
    for (const project of projects.value) {
      const tasks = await fetchTasksFromProject(project.projectId || project.id)
      if (!tasks) continue
      
      for (const task of tasks) {
        // Skip tasks that are already marked as Done
        if (task.status === 'Done') continue
        
        // Get the auto-calculated status based on dates
        const autoStatus = getAutoStatus(task.startDate, task.endDate)
        console.log(`Calculated auto status: ${autoStatus}`)

        // If the status has changed, update it
        if (task.status !== autoStatus) {
          console.log(`Status needs update: ${task.status} -> ${autoStatus}`)
          console.log(`Updating task with ID: ${task.taskId || task.id} in project: ${project.projectId || project.id}`)
          
          try {
            console.log('About to call updateTask...')
            const result = await updateTask(project.projectId || project.id, task.taskId || task.id, { status: autoStatus })
            console.log(`Update result:`, result)
            
            if (result) {
              updatedCount++
              console.log(`Successfully updated task. Total updated: ${updatedCount}`)
            } else {
              console.log('Update failed - result was falsy')
            }
          } catch (updateError) {
            console.error('Error calling updateTask:', updateError)
            console.error('Error details:', {
              projectId: project.projectId || project.id,
              taskId: task.taskId || task.id,
              newStatus: autoStatus,
              error: updateError.message || updateError
            })
          }
        } else {
          console.log(`No update needed - status already correct: ${task.status}`)
        }
      }
    }
    
    if (updatedCount > 0) {
      toastState.addNotification('info', `Updated ${updatedCount} task statuses`)
      await loadProjects() // Refresh to show updated statuses
    }
  } catch (error) {
    console.error('Error updating task statuses:', error)
  }
}

// Helper function to determine task status based on dates
const getAutoStatus = (startDate, endDate) => {
  // Get current time in UTC
  if (!startDate || !endDate) return 'Not Started'
  
  const now = new Date()
  
  // Ensure UTC parsing by adding Z if not present
  const startUTC = startDate.includes('Z') || startDate.includes('+') ? startDate : startDate + 'Z'
  const endUTC = endDate.includes('Z') || endDate.includes('+') ? endDate : endDate + 'Z'
  
  const start = new Date(startUTC)
  const end = new Date(endUTC)
  
  // Log for debugging
  console.log('Date comparison:', {
    now: now.toISOString(),
    start: start.toISOString(),
    end: end.toISOString(),
    startLocal: start.toLocaleString(),
    endLocal: end.toLocaleString(),
    nowTime: now.getTime(),
    startTime: start.getTime(),
    endTime: end.getTime(),
    isBeforeStart: now < start,
    isAfterEnd: now > end
  })
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('Invalid date detected:', { startDate, endDate })
    return 'Not Started'
  }
  
  if (now < start) {
    console.log('Status: Not Started (now < start)')
    return 'Not Started'
  } else if (now > end) {
    console.log('Status: Overdue (now > end)')
    return 'Overdue'
  } else {
    console.log('Status: Ongoing (start <= now <= end)')
    return 'Ongoing'
  }
}
</script>

<template>
  <div class="container mx-auto">
    <div id="projects-container">
      <!-- Loading state -->
      <div v-if="projectListState.isLoading" class="flex justify-center items-center p-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
      
      <!-- Empty state -->
      <div 
        v-else-if="!projects || projects.length === 0" 
        class="flex flex-col items-center justify-center p-12 text-center"
      >
        <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
        </svg>
        <p class="text-xl font-medium text-gray-600">No projects found</p>
        <p class="text-gray-500 mt-1">Create your first project to get started</p>
        <button
          @click="handleCreateProject"
          class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Project
        </button>
      </div>
      
      <!-- Projects list -->
      <div v-else class="grid grid-cols-1">
        <!-- Add Create Project button at the top -->
        <div class="mb-6 flex justify-end">
          <button
            @click="handleCreateProject"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Create Project
          </button>
        </div>

        <ProjectCard
          v-for="project in projects"
          :key="project.projectId || project.id"
          :project="project"
        />
      </div>
    </div>
    
    <!-- Modals -->
    <CreateProjectModal
      v-if="modalState.isCreateProjectModalOpen"
      :show="modalState.isCreateProjectModalOpen"
      @close="handleCloseCreateProjectModal"
      @project-created="handleProjectCreated"
    />
    
    <AddTaskModal
      v-if="modalState.isAddTaskModalOpen"
      :show="modalState.isAddTaskModalOpen"
      :project-id="modalState.getAddTaskProjectId"
      @close="handleCloseAddTaskModal"
      @task-added="handleTaskAdded"
    />
    
    <AddMemberModal
      v-if="modalState.isAddMemberModalOpen"
      :show="modalState.isAddMemberModalOpen"
      :project-id="modalState.getAddMemberProjectId"
      @close="handleCloseAddMemberModal"
      @member-added="handleMemberAdded"
    />
  </div>
</template>

