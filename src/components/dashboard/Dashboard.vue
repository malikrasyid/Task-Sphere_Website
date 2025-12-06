<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Projects" 
        :value="filteredProjects.length" 
        bgColor="bg-indigo-100" 
        textColor="text-indigo-600"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
          </svg>
        </template>
      </StatCard>

      <StatCard 
        title="Total Tasks" 
        :value="totalTasks" 
        bgColor="bg-blue-100" 
        textColor="text-blue-600"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
          </svg>
        </template>
        <template #extra>
          <div class="mt-3">
            <p class="text-sm text-gray-500">{{ completedTasks }} completed</p>
            <div class="w-full bg-gray-300 rounded-full h-2 mt-1">
              <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" :style="{ width: `${completionPercentage}%` }"></div>
            </div>
          </div>
        </template>
      </StatCard>

      <StatCard 
        title="Overdue Tasks" 
        :value="overdueCount" 
        bgColor="bg-red-100" 
        textColor="text-red-600"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
        </template>
      </StatCard>

      <StatCard 
        title="Upcoming (7 days)" 
        :value="upcomingCount" 
        bgColor="bg-amber-100" 
        textColor="text-amber-600"
      >
        <template #icon>
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
          </svg>
        </template>
      </StatCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-indigo-50 rounded-xl">
        <div class="p-5 border-b border-gray-800">
          <h2 class="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
        </div>
        <div class="p-5">
          <div v-if="upcomingTasks.length === 0" class="text-center py-6 text-gray-500">
            <p>No upcoming deadlines in the next 7 days</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Task</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="task in upcomingTasks" :key="task.taskId" class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ task.name }}</div>
                    <div class="text-xs text-gray-500">{{ task.deliverable || '-' }}</div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm text-gray-700">{{ getProjectName(task.projectId) }}</div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm text-gray-700">{{ formatDateUTC(task.endDate) }}</div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white" :style="{ backgroundColor: getTaskColor(task.status) }">
                      {{ task.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="bg-indigo-50 rounded-xl">
        <div class="p-5 border-b border-gray-800">
          <h2 class="text-lg font-semibold text-gray-900">Tasks by Status</h2>
        </div>
        <div class="p-5">
          <div class="space-y-4">
            <div v-for="(count, status) in statusCounts" :key="status">
              <div class="flex justify-between items-center mb-1">
                <div class="text-sm font-medium text-gray-700">{{ status }}</div>
                <div class="text-sm text-gray-500">{{ count }} ({{ getStatusPercentage(count) }}%)</div>
              </div>
              <div class="w-full bg-gray-300 rounded-full h-2.5">
                <div class="h-2.5 rounded-full transition-all duration-500" :style="{ width: `${getStatusPercentage(count)}%`, backgroundColor: getTaskColor(status) }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecentActivityList
        title="Recent Projects"
        :items="recentProjects"
        item-type="projects"
      />

      <RecentActivityList
        title="Recent Tasks"
        :items="recentTasks.map(task => ({
          ...task,
          projectName: getProjectName(task.projectId) // Add projectName for display
        }))"
        item-type="tasks"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { formatDateUTC, getTaskColor } from '../../services/utils'
import { dashboardState, toastState, taskCardState } from '../../stores/componentState'
import { fetchProjects, fetchTasksFromProject, fetchComments } from '../../services/api'
import StatCard from '../StatCard.vue'
import RecentActivityList from '../RecentActivityList.vue' // New import

// Local state
const projects = ref([])
const tasks = ref([])
const isLoading = ref(true)
const error = ref(null)

// Computed properties for dashboard stats with null safety
const filteredProjects = computed(() => {
  return Array.isArray(projects.value) ? projects.value : [];
});

const filteredTasks = computed(() => {
  return Array.isArray(tasks.value) ? tasks.value : [];
});

const totalTasks = computed(() => filteredTasks.value.length)

const completedTasks = computed(() => {
  if (!Array.isArray(filteredTasks.value)) return 0
  return filteredTasks.value.filter(task => task && task.status === 'Done').length
})

const overdueCount = computed(() => {
  if (!Array.isArray(filteredTasks.value)) return 0
  return filteredTasks.value.filter(task => task && task.status === 'Overdue').length
})

const upcomingCount = computed(() => {
  if (!Array.isArray(filteredTasks.value)) return 0
  const now = new Date()
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return filteredTasks.value.filter(task => 
    task && 
    task.status !== 'Done' && 
    task.status !== 'Overdue' && 
    task.endDate &&
    new Date(task.endDate) > now && 
    new Date(task.endDate) <= oneWeekLater
  ).length
})

const completionPercentage = computed(() => {
  return totalTasks.value > 0 ? Math.round((completedTasks.value / totalTasks.value) * 100) : 0
})

// Upcoming tasks
const upcomingTasks = computed(() => {
  if (!Array.isArray(filteredTasks.value)) return []
  const now = new Date()
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return filteredTasks.value
    .filter(task => 
      task && 
      task.endDate &&
      task.status !== 'Done' && 
      new Date(task.endDate) >= now && 
      new Date(task.endDate) <= oneWeekLater
    )
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
})

// Tasks by status
const statusCounts = computed(() => {
  const counts = {
    'Not Started': 0,
    'Ongoing': 0,
    'Overdue': 0,
    'Done': 0
  }
  
  if (!Array.isArray(filteredTasks.value)) return counts
  
  filteredTasks.value.forEach(task => {
    if (task && task.status) {
      if (counts.hasOwnProperty(task.status)) {
        counts[task.status]++
      } else {
        counts[task.status] = 1
      }
    }
  })
  
  return counts
})

// Recent projects and tasks
const recentProjects = computed(() => {
  if (!Array.isArray(filteredProjects.value)) return []
  return [...filteredProjects.value]
    .filter(project => project)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)
})

const recentTasks = computed(() => {
  if (!Array.isArray(filteredTasks.value)) return []
  return [...filteredTasks.value]
    .filter(task => task)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)
})

// Helper functions
const getProjectName = (projectId) => {
  if (!projectId || !Array.isArray(filteredProjects.value)) return 'Unknown Project'
  const project = filteredProjects.value.find(p => p && p.projectId === projectId)
  return project ? project.name : 'Unknown Project'
}

const getStatusPercentage = (count) => {
  return totalTasks.value > 0 ? Math.round((count / totalTasks.value) * 100) : 0
}

// Load data
onMounted(async () => {
  try {
    isLoading.value = true
    
    // Load all projects
    const projectsResponse = await fetchProjects();
    
    if (projectsResponse && projectsResponse.projects && Array.isArray(projectsResponse.projects)) {
      projects.value = projectsResponse.projects;
      
      if (projects.value.length > 0) {
      // Load tasks for each project
      const allTasks = []
      const commentPromises = []

      for (const project of projects.value) {
        if (project && project.projectId) {
          try {
            const projectTasks = await fetchTasksFromProject(project.projectId)
            
            if (Array.isArray(projectTasks)) {
              const tasksWithId = projectTasks.map(t => ({
                ...t,
                projectId: project.projectId
              }))
              allTasks.push(...tasksWithId)

              // Fetch comments for each task and update store
              tasksWithId.forEach(task => {
                const taskId = task.taskId || task.id
                if (taskId) {
                  commentPromises.push(
                    fetchComments(project.projectId, taskId)
                      .then(data => {
                        if (data && data.comments) {
                          taskCardState.setComments(taskId, data.comments)
                        }
                      })
                      .catch(err => console.error(`Error loading comments for task ${taskId}:`, err))
                  )
                }
              })
            }
          } catch (error) {
            console.error(`Error loading tasks for project ${project.projectId}:`, error)
          }
        }
      }
      
      tasks.value = allTasks;
      await Promise.allSettled(commentPromises);

      } else {
        tasks.value = [];
      }
    } else {
      projects.value = [];
      tasks.value = [];
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    toastState.addNotification('error', 'Failed to load dashboard data: ' + error.message);
    projects.value = [];
    tasks.value = [];
  } finally {
    isLoading.value = false;
  }
})

// Add watchers to monitor state changes
watch(projects, (newVal) => {
  console.log('Projects ref changed:', newVal)
}, { deep: true })

watch(tasks, (newVal) => {
  console.log('Tasks ref changed:', newVal)
}, { deep: true })

watch(() => dashboardState.getFilteredProjects.value, (newVal) => {
  console.log('Dashboard filtered projects changed:', newVal)
}, { deep: true })

watch(() => dashboardState.getFilteredTasks.value, (newVal) => {
  console.log('Dashboard filtered tasks changed:', newVal)
}, { deep: true })
</script>