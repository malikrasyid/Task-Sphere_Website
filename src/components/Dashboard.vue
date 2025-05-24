<template>
  <div class="space-y-6">
    <!-- Dashboard Summary -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Projects -->
      <div class="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Projects</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ filteredProjects.length }}</h3>
          </div>
          <div class="rounded-full p-2 bg-indigo-50">
            <svg class="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Total Tasks -->
      <div class="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Tasks</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ totalTasks }}</h3>
          </div>
          <div class="rounded-full p-2 bg-blue-50">
            <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
        <div class="mt-2">
          <p class="text-sm text-gray-500">{{ completedTasks }} completed</p>
          <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div class="bg-blue-500 h-1.5 rounded-full" :style="{ width: `${completionPercentage}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Overdue Tasks -->
      <div class="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500">Overdue Tasks</p>
            <h3 class="text-2xl font-bold text-red-600 mt-1">{{ overdueCount }}</h3>
          </div>
          <div class="rounded-full p-2 bg-red-50">
            <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Upcoming Deadlines -->
      <div class="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500">Upcoming (7 days)</p>
            <h3 class="text-2xl font-bold text-amber-600 mt-1">{{ upcomingCount }}</h3>
          </div>
          <div class="rounded-full p-2 bg-amber-50">
            <svg class="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Upcoming Deadlines -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
        </div>
        <div class="p-4">
          <div v-if="upcomingTasks.length === 0" class="text-center py-6 text-gray-500">
            <p>No upcoming deadlines in the next 7 days</p>
          </div>
          <div v-else class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="task in upcomingTasks" :key="task.taskId">
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ task.name }}</div>
                    <div class="text-xs text-gray-500">{{ task.deliverable || '-' }}</div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ getProjectName(task.projectId) }}</div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatDateUTC(task.endDate) }}</div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white" :style="{ backgroundColor: getTaskColor(task.status) }">
                      {{ task.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tasks by Status -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Tasks by Status</h2>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div v-for="(count, status) in statusCounts" :key="status">
              <div class="flex justify-between items-center mb-1">
                <div class="text-sm font-medium text-gray-700">{{ status }}</div>
                <div class="text-sm text-gray-500">{{ count }} ({{ getStatusPercentage(count) }}%)</div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="h-2.5 rounded-full" :style="{ width: `${getStatusPercentage(count)}%`, backgroundColor: getTaskColor(status) }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Projects -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Recent Projects</h2>
        </div>
        <div class="p-4">
          <ul class="space-y-3">
            <li v-if="recentProjects.length === 0" class="text-center py-4 text-gray-500">
              <p>No projects found</p>
            </li>
            <li v-for="project in recentProjects" :key="project.projectId" class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow p-3">
              <div class="font-medium text-gray-900">{{ project.name }}</div>
              <p class="text-sm text-gray-500 mt-1 truncate">{{ project.description || 'No description' }}</p>
              <div class="flex items-center text-xs text-gray-400 mt-2">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                </svg>
                {{ (project.team && project.team.length) || 0 }} member{{ (project.team && project.team.length !== 1) ? 's' : '' }}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Recent Tasks -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Recent Tasks</h2>
        </div>
        <div class="p-4">
          <ul class="space-y-3">
            <li v-if="recentTasks.length === 0" class="text-center py-4 text-gray-500">
              <p>No tasks found</p>
            </li>
            <li v-for="task in recentTasks" :key="task.taskId" class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow p-3">
              <div class="flex justify-between items-start">
                <div class="font-medium text-gray-900">{{ task.name }}</div>
                <span class="px-2 py-1 text-white text-xs rounded" :style="{ backgroundColor: getTaskColor(task.status) }">{{ task.status }}</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ getProjectName(task.projectId) }}</p>
              <div class="flex items-center text-xs text-gray-400 mt-2">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                </svg>
                Due: {{ formatDateUTC(task.endDate) }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { formatDateUTC, getTaskColor } from '../services/utils'
import { dashboardState, toastState } from '../stores/componentState'
import { fetchProjects, fetchTasksFromProject } from '../services/api'

// Local state
const projects = ref([])
const tasks = ref([])
const isLoading = ref(true)
const error = ref(null)

// Computed properties for dashboard stats with null safety
const filteredProjects = computed(() => {
  console.log('Local Projects for filtering:', projects.value);
  return Array.isArray(projects.value) ? projects.value : [];
});

const filteredTasks = computed(() => {
  console.log('Local Tasks for filtering:', tasks.value);
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
    console.log('Starting to load dashboard data...')
    
    // Load all projects
    const projectsResponse = await fetchProjects();
    console.log('Raw API Response:', projectsResponse);
    console.log('Projects array:', projectsResponse?.projects);
    console.log('Is projects array?', Array.isArray(projectsResponse?.projects));
    
    if (projectsResponse && projectsResponse.projects && Array.isArray(projectsResponse.projects)) {
      projects.value = projectsResponse.projects;
      console.log('Projects set to:', projects.value);
      console.log('Projects length:', projects.value.length);
      
      if (projects.value.length > 0) {
      // Load tasks for each project
      const allTasks = []
      for (const project of projects.value) {
        if (project && project.projectId) {
          try {
            console.log(`Fetching tasks for project ${project.projectId}...`)
            const projectTasks = await fetchTasksFromProject(project.projectId)
            console.log(`Tasks for project ${project.projectId}:`, projectTasks)
            
            if (projectTasks && Array.isArray(projectTasks)) {
              allTasks.push(...projectTasks)
            }
          } catch (error) {
            console.error(`Error loading tasks for project ${project.projectId}:`, error)
          }
        }
      }
      
      tasks.value = allTasks;
        console.log('All tasks set to:', tasks.value);
        console.log('Total tasks:', tasks.value.length);
      } else {
        console.warn('No projects found in response');
        tasks.value = [];
      }
    } else {
      console.warn('Invalid or empty projects response:', projectsResponse);
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
    console.log('Final dashboard state:', {
      projectsCount: projects.value.length,
      tasksCount: tasks.value.length,
      projects: projects.value,
      tasks: tasks.value
    });
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