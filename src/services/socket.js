import { io } from 'socket.io-client';
import { reactive } from 'vue';

const SERVER_URL = 'wss://websocket-task-sphere-production.up.railway.app';

// Socket connection state
export const socketState = reactive({
  projects: {
    connected: false
  },
  tasks: {
    connected: false
  },
  users: {
    connected: false
  },
  comments: {
    connected: false
  },
  notifications: {
    connected: false
  },
  
  // Getters
  isProjectsConnected() {
    return this.projects.connected;
  },
  isTasksConnected() {
    return this.tasks.connected;
  },
  isUsersConnected() {
    return this.users.connected;
  },
  isCommentsConnected() {
    return this.comments.connected;
  },
  isNotificationsConnected() {
    return this.notifications.connected;
  },
  
  // Check if all sockets are connected
  areAllConnected() {
    return this.projects.connected && 
           this.tasks.connected && 
           this.users.connected && 
           this.comments.connected && 
           this.notifications.connected;
  }
});

// Socket instances
let projectsSocket = null;
let tasksSocket = null;
let usersSocket = null;
let commentsSocket = null;
let notificationsSocket = null;

// Initialize all sockets
export function initializeSockets() {
  // Create socket instances if they don't exist
  if (!projectsSocket) projectsSocket = io(`${SERVER_URL}/projects`);
  if (!tasksSocket) tasksSocket = io(`${SERVER_URL}/tasks`);
  if (!usersSocket) usersSocket = io(`${SERVER_URL}/users`);
  if (!commentsSocket) commentsSocket = io(`${SERVER_URL}/comments`);
  if (!notificationsSocket) notificationsSocket = io(`${SERVER_URL}/notifications`);
  
  // Set up event listeners for projects socket
  setupSocketEvents(projectsSocket, 'projects', socketState.projects);
  
  // Set up event listeners for tasks socket
  setupSocketEvents(tasksSocket, 'tasks', socketState.tasks);
  
  // Set up event listeners for users socket
  setupSocketEvents(usersSocket, 'users', socketState.users);
  
  // Set up event listeners for comments socket
  setupSocketEvents(commentsSocket, 'comments', socketState.comments);
  
  // Set up event listeners for notifications socket
  setupSocketEvents(notificationsSocket, 'notifications', socketState.notifications);
}

// Set up common event listeners for a socket
function setupSocketEvents(socket, namespace, stateRef) {
  socket.on('connect', () => {
    console.log(`🟢 Connected to ${namespace} namespace`);
    stateRef.connected = true;
  });
  
  socket.on('disconnect', () => {
    console.log(`🔴 Disconnected from ${namespace} namespace`);
    stateRef.connected = false;
  });
  
  socket.on('error', (error) => {
    console.error(`Error in ${namespace} socket:`, error);
    stateRef.connected = false;
  });
}

// Get socket instances (for components to subscribe to events)
export function getProjectsSocket() {
  return projectsSocket;
}

export function getTasksSocket() {
  return tasksSocket;
}

export function getUsersSocket() {
  return usersSocket;
}

export function getCommentsSocket() {
  return commentsSocket;
}

export function getNotificationsSocket() {
  return notificationsSocket;
}

// Check if all sockets are connected
export function checkAllConnections() {
  return {
    projects: socketState.projects.connected,
    tasks: socketState.tasks.connected,
    users: socketState.users.connected,
    comments: socketState.comments.connected,
    notifications: socketState.notifications.connected,
    allConnected: socketState.areAllConnected()
  };
}

// Disconnect all sockets (e.g., on logout)
export function disconnectAllSockets() {
  if (projectsSocket) projectsSocket.disconnect();
  if (tasksSocket) tasksSocket.disconnect();
  if (usersSocket) usersSocket.disconnect();
  if (commentsSocket) commentsSocket.disconnect();
  if (notificationsSocket) notificationsSocket.disconnect();
  
  socketState.projects.connected = false;
  socketState.tasks.connected = false;
  socketState.users.connected = false;
  socketState.comments.connected = false;
  socketState.notifications.connected = false;
} 