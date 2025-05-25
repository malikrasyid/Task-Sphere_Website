<template>
  <div>
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
          <p><span class="font-medium">Deliverable:</span> {{ selectedTask.deliverable || 'No deliverable' }}</p>
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
import { getTaskColor } from '../services/utils';
import { calendarState, toastState } from '../stores/componentState';
import { fetchProjects, fetchTasksFromProject } from '../services/api';

export default {
  name: 'TaskCalendar',
  setup() {
    const calendarRef = ref(null);
    const calendar = ref(null);
    const showModal = ref(false);
    const events = ref([]);
    const selectedTask = ref({
      title: '',
      projectName: '',
      status: '',
      backgroundColor: '',
      deliverable: '',
      start: null,
      end: null
    });

    const loadCalendarData = async () => {
      try {
        // Fetch all projects
        const projectsData = await fetchProjects();
        console.log('Loaded projects data:', projectsData);
        const projects = projectsData.projects;
        console.log('Projects array:', projects);

        if (!projects || !projects.length) {
          console.log('No projects found');
          return [];
        }
        
        // Create a map of project names for quick lookup
        const projectMap = new Map();
        projects.forEach(project => {
          projectMap.set(project.name, project);
        });
        
        // Fetch all tasks from all projects
        const allTasks = [];
        for (const project of projects) {
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
            // Add project name to each task
            const tasksWithProject = tasksArray.map(task => ({
              ...task,
              projectName: project.name
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
          // Check if task exists and has required properties
          if (!task || typeof task !== 'object') {
            console.log('Invalid task object:', task);
            return false;
          }

          // Check if dates are Firestore Timestamps
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
          const color = getTaskColor(task.status);
          
          // Convert Firestore Timestamps to Date objects if needed
          const startDate = task.startDate?.toDate ? task.startDate.toDate() : new Date(task.startDate);
          const endDate = task.endDate?.toDate ? task.endDate.toDate() : new Date(task.endDate);
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn('Invalid date for task:', task.name);
            return null;
          }

          console.log('Creating calendar event:', {
            taskId: task.taskId || task.id,
            projectName: task.projectName,
            taskName: task.name
          });

          return {
            id: task.taskId || task.id,
            title: task.name,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            backgroundColor: color,
            borderColor: color,
            textColor: '#FFFFFF',
            deliverable: task.deliverable,
            extendedProps: {
              projectName: task.projectName,
              status: task.status,
              comments: task.comments || []
            }
          };
        }).filter(event => event !== null);
        
        console.log('Final events array:', calendarEvents);
        events.value = calendarEvents;
        calendarState.setEvents(calendarEvents);
        return calendarEvents;
      } catch (error) {
        console.error('Error loading calendar data:', error);
        toastState.addNotification('error', 'Failed to load calendar data');
        return [];
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
      
      console.log('Initializing calendar with events:', events.value);
      
      // Initialize calendar
      calendar.value = new Calendar(calendarRef.value, {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        },
        events: events.value,
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
        dayMaxEvents: true, // allow "more" link when too many events
        themeSystem: 'standard',
        height: 'auto',
        eventDidMount: function(info) {
          console.log('Event mounted:', info.event.title);
        }
      });
      
      calendar.value.render();
      console.log('Calendar rendered');
    };

    const renderCalendar = async () => {
      console.log('renderCalendar called');
      await loadCalendarData();
      await nextTick(); // Wait for DOM updates
      initializeCalendar();
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
        backgroundColor: event.backgroundColor,
        status: event.extendedProps.status,
        projectName: event.extendedProps.projectName,
        deliverable: event.extendedProps.deliverable || ''
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

    onMounted(async () => {
      console.log('Component mounted, waiting for DOM...');
      await nextTick();
      await renderCalendar();
    });

    onBeforeUnmount(() => {
      if (calendar.value) {
        calendar.value.destroy();
      }
    });

    return {
      calendarRef,
      showModal,
      selectedTask,
      closeModal,
      formatDate,
      events
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

:deep(.fc-event) {
  cursor: pointer;
}

:deep(.fc-event-title) {
  font-weight: 500;
}
</style>
