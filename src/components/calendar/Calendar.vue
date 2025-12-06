<template>
  <div>
    <div class="flex justify-end mb-4">
      <!-- Add Project Filter -->
      <div class=" flex items-center space-x-4">
        <div class="relative">
          <button 
            @click="toggleProjectFilter" 
            class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span>Filter Projects</span>
            <svg class="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <!-- Project Filter Dropdown -->
          <div 
            v-if="showProjectFilter" 
            class="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50"
          >
            <div class="px-4 py-2 border-b">
              <div class="flex justify-between items-center">
                <h3 class="text-sm font-medium text-gray-900">Select Projects</h3>
                <button 
                  @click="selectAllProjects" 
                  class="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  {{ selectedProjects.length === projects.length ? 'Deselect All' : 'Select All' }}
                </button>
              </div>
            </div>
            <div class="max-h-60 overflow-y-auto">
              <div 
                v-for="project in projects" 
                :key="project.projectId"
                class="px-4 py-2 hover:bg-gray-50"
              >
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    :value="project.projectId"
                    v-model="selectedProjects"
                    @change="handleProjectFilterChange"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  >
                  <span class="text-sm text-gray-700">{{ project.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="calendar" ref="calendarRef"></div>
    
    <!-- Task Details Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center pb-3 border-b">
          <h3 class="text-lg font-medium text-gray-900">{{ selectedTask.title }}</h3>
          <button class="text-gray-400 hover:text-gray-500" @click="closeModal">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="mt-4 space-y-3">
          <p><span class="font-medium">Project:</span> {{ selectedTask.projectName }}</p>
          <p>
            <span class="font-medium">Status:</span>
            <span 
              class="px-2 py-1 rounded text-white text-xs" 
              :style="{ backgroundColor: selectedTask.backgroundColor }">
              {{ selectedTask.status }}
            </span>
          </p>
          <p><span class="font-medium">Description:</span> {{ selectedTask.description || 'No description' }}</p>
          <p><span class="font-medium">Start:</span> {{ formatDate(selectedTask.start) }}</p>
          <p><span class="font-medium">End:</span> {{ formatDate(selectedTask.end) }}</p>
        </div>
        <div class="mt-5 flex justify-end">
          <button 
            @click="closeModal" 
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { getTaskColor } from '../../services/utils';
import { calendarState, toastState } from '../../stores/componentState';
import { fetchProjects, fetchTasksFromProject } from '../../services/api';

export default {
  name: 'TaskCalendar',
  setup() {
    const calendarRef = ref(null);
    const calendar = ref(null);
    const showModal = ref(false);
    const events = ref([]);
    const allEvents = ref([]); // Store all events for filtering
    const projects = ref([]); // Store projects list
    const showProjectFilter = ref(false);
    const selectedProjects = ref([]);
    const selectedTask = ref({
      title: '',
      projectName: '',
      status: '',
      backgroundColor: '',
      description: '',
      start: null,
      end: null
    });

    // Generate a color based on project name
    const getProjectColor = (projectName) => {
      const colors = [
        '#4F46E5', // Indigo
        '#7C3AED', // Violet
        '#EC4899', // Pink
        '#F59E0B', // Amber
        '#10B981', // Emerald
        '#3B82F6', // Blue
        '#8B5CF6', // Purple
        '#EF4444', // Red
        '#14B8A6', // Teal
        '#F97316'  // Orange
      ];
      
      // Generate a consistent index based on project name
      const index = projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[index % colors.length];
    };

    const loadCalendarData = async () => {
      try {
        // Fetch all projects
        const projectsData = await fetchProjects();
        console.log('Loaded projects data:', projectsData);
        projects.value = projectsData.projects;
        console.log('Projects array:', projects.value);

        if (!projects.value || !projects.value.length) {
          console.log('No projects found');
          return [];
        }
        
        // Fetch all tasks from all projects
        const allTasks = [];
        for (const project of projects.value) {
          console.log(`Loading tasks for project ${project.name}:`, project);
          const tasks = await fetchTasksFromProject(project.projectId);
          console.log(`Tasks for project ${project.name}:`, tasks);
          
          // Handle both array and object responses
          let tasksArray;
          if (Array.isArray(tasks)) {
            tasksArray = tasks;
          } else if (tasks && typeof tasks === 'object') {
            tasksArray = tasks.tasks || Object.values(tasks);
          } else {
            tasksArray = [];
          }
          
          if (tasksArray && tasksArray.length) {
            // Add project name and color to each task
            const projectColor = getProjectColor(project.name);
            const tasksWithProject = tasksArray.map(task => ({
              ...task,
              projectName: project.name,
              projectColor: projectColor,
              projectId: project.projectId // Make sure to add projectId here
            }));
            console.log(`Adding ${tasksWithProject.length} tasks to allTasks for project ${project.name}`);
            allTasks.push(...tasksWithProject);
          } else {
            console.log(`No tasks found for project ${project.name}`);
          }
        }
        
        console.log('Final allTasks array:', allTasks);
        
        // Filter tasks with valid dates
        const validTasks = allTasks.filter(task => {
          if (!task || typeof task !== 'object') {
            console.log('Invalid task object:', task);
            return false;
          }

          const startDate = task.startDate?.toDate ? task.startDate.toDate() : task.startDate;
          const endDate = task.endDate?.toDate ? task.endDate.toDate() : task.endDate;

          const isValid = task && startDate && endDate;
          if (!isValid && task) {
            console.log(`Task filtered out - Name: ${task.name}, 
              startDate: ${startDate}, endDate: ${endDate}`);
          }
          return isValid;
        });
        
        console.log(`${validTasks.length} tasks with valid dates out of ${allTasks.length} total tasks`);
        
        // Map tasks to calendar events
        const calendarEvents = validTasks.map(task => {
          const statusColor = getTaskColor(task.status);
          const projectColor = task.projectColor;
          
          // Convert Firestore Timestamps to Date objects if needed
          const startDate = task.startDate?.toDate ? task.startDate.toDate() : new Date(task.startDate);
          const endDate = task.endDate?.toDate ? task.endDate.toDate() : new Date(task.endDate);
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn('Invalid date for task:', task.name);
            return null;
          }

          console.log('Creating calendar event:', {
            taskId: task.taskId || task.id,
            projectId: task.projectId,
            projectName: task.projectName,
            taskName: task.name
          });

          return {
            id: task.taskId || task.id,
            title: task.name,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            backgroundColor: getTaskColor(task.status),
            borderColor: getTaskColor(task.status),
            textColor: '#FFFFFF',
            description: task.deliverable || task.description,
            extendedProps: {
              projectId: task.projectId,
              projectName: task.projectName,
              status: task.status,
              comments: task.comments || []
            }
          };
        }).filter(event => event !== null);
        
        console.log('Final events array:', calendarEvents);
        allEvents.value = calendarEvents;
        events.value = calendarEvents;
        calendarState.setEvents(calendarEvents);
        return calendarEvents;
      } catch (error) {
        console.error('Error loading calendar data:', error);
        toastState.addNotification('error', 'Failed to load calendar data');
        return [];
      }
    };

    const handleProjectFilterChange = () => {
      console.log('Project filter changed:', selectedProjects.value);
      console.log('All events:', allEvents.value);
      
      if (selectedProjects.value.length === 0) {
        // Show all events if no projects are selected
        console.log('Showing all events');
        events.value = [...allEvents.value];
      } else {
        // Filter events by selected projects
        console.log('Filtering events for projects:', selectedProjects.value);
        events.value = allEvents.value.filter(event => {
          return selectedProjects.value.includes(event.extendedProps.projectId);
        });
      }
      
      console.log('Filtered events:', events.value);
      
      // Update calendar events
      if (calendar.value) {
        console.log('Updating calendar with filtered events');
        calendar.value.removeAllEvents();
        calendar.value.addEventSource(events.value);
      }
    };

    const initializeCalendar = () => {
      if (!calendarRef.value) {
        console.warn('Calendar ref not available');
        return;
      }
      
      // Destroy existing calendar if it exists
      if (calendar.value) {
        calendar.value.destroy();
      }
      
      console.log('Initializing calendar UI');
      
      // Initialize calendar with empty events
      calendar.value = new Calendar(calendarRef.value, {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        },
        events: [], // Start with empty events
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        },
        eventClick: function(info) {
          showTaskDetails(info.event);
        },
        datesSet: function(dateInfo) {
          calendarState.setCurrentDate(dateInfo.start);
        },
        viewDidMount: function(viewInfo) {
          calendarState.setView(viewInfo.view.type);
        },
        dayMaxEvents: true,
        themeSystem: 'standard',
        height: 'auto',
        eventDidMount: function(info) {
          // Set border color to project color
          const projectColor = getProjectColor(info.event.extendedProps.projectName);
          info.el.style.borderTopWidth = '4px';
          info.el.style.borderTopColor = projectColor;
          info.el.style.borderTopStyle = 'solid';
          info.el.style.borderLeftWidth = '0';
          info.el.style.borderRightWidth = '0';
          info.el.style.borderBottomWidth = '0';
          info.el.title = `\nStatus: ${info.event.extendedProps.status}`.trim();
        }
      });
      
      calendar.value.render();
      console.log('Calendar UI rendered');
    };

    const renderCalendar = async () => {
      console.log('renderCalendar called');
      // Initialize calendar UI first
      await nextTick();
      initializeCalendar();
      
      // Then load the data
      console.log('Loading calendar data');
      await loadCalendarData();
    };

    // Watch for changes in events and update calendar
    watch(events, (newEvents) => {
      if (calendar.value && newEvents) {
        console.log('Updating calendar events:', newEvents);
        calendar.value.removeAllEvents();
        calendar.value.addEventSource(newEvents);
      }
    }, { deep: true });

    const showTaskDetails = (event) => {
      selectedTask.value = {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: getTaskColor(event.extendedProps.status),
        status: event.extendedProps.status,
        projectName: event.extendedProps.projectName,
        description: event.extendedProps.description || ''
      };
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString();
    };

    // Toggle project filter dropdown
    const toggleProjectFilter = () => {
      showProjectFilter.value = !showProjectFilter.value;
    };

    // Select/Deselect all projects
    const selectAllProjects = () => {
      if (selectedProjects.value.length === projects.value.length) {
        selectedProjects.value = [];
      } else {
        selectedProjects.value = projects.value.map(p => p.projectId);
      }
      handleProjectFilterChange();
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.project-filter-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        showProjectFilter.value = false;
      }
    };

    onMounted(async () => {
      console.log('Component mounted, initializing calendar UI...');
      await renderCalendar();
      document.addEventListener('click', handleClickOutside);
    });

    onBeforeUnmount(() => {
      if (calendar.value) {
        calendar.value.destroy();
      }
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      calendarRef,
      showModal,
      selectedTask,
      closeModal,
      formatDate,
      events,
      projects,
      selectedProjects,
      showProjectFilter,
      toggleProjectFilter,
      selectAllProjects,
      handleProjectFilterChange
    };
  }
};
</script>

<style scoped>
/* Ensure the calendar container has proper dimensions */
#calendar {
  min-height: 600px;
}

/* FullCalendar specific styles */
:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-h-event) {
  cursor: pointer;
}

:deep(.fc-event-title) {
  font-weight: 500;
}

/* Add hover effect for events */
:deep(.fc-h-event:hover) {
  filter: brightness(90%);
}

/* Add styles for the project filter dropdown */
.project-filter-dropdown {
  max-height: 24rem;
  overflow-y: auto;
}
</style>