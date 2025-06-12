const BASE_URL = "https://task-sphere-pi.vercel.app";

// API request helper function
async function apiRequest(endpoint, method = 'GET', data = null) {
  const token = sessionStorage.getItem('sessionToken');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    ...(data ? { body: JSON.stringify(data) } : {})
  };
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      // Handle session expiration
      if (response.status === 401) {
        // Event for session expiration
        const event = new CustomEvent('session-expired');
        window.dispatchEvent(event);
        return null;
      }
      
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Auth API
export async function login(email, password) {
  return apiRequest('/api/auth', 'POST', { action: 'login', email, password });
}

export async function signUp(userData) {
  return apiRequest('/api/auth', 'POST', { action: 'signup', ...userData });
}

// Projects API
export async function fetchProjects() {
  return apiRequest('/api/projects');
}

export async function fetchProject(projectId) {
  return apiRequest(`/api/projects?projectId=${projectId}`);
}

export async function createProject(projectData) {
  return apiRequest('/api/projects', 'POST', projectData);
}

export async function updateProject(projectId, updateData) {
  return apiRequest(`/api/projects?projectId=${projectId}`, 'PUT', updateData);
}

export async function deleteProject(projectId) {
  return apiRequest(`/api/projects?projectId=${projectId}`, 'DELETE');
}

export async function addMemberToProject(projectId, userData) {
  return apiRequest(`/api/projects/member.js?projectId=${projectId}`, 'POST', { action: 'add', ...userData });
}

// Tasks API
export async function fetchTasksFromProject(projectId) {
  const data = await apiRequest(`/api/projects/tasks?projectId=${projectId}`);

  const tasksWithStringDates = data.tasks.map(task => ({
    ...task,
    startDate: task.startDate ? new Date(task.startDate._seconds * 1000).toISOString() : null,
    endDate: task.endDate ? new Date(task.endDate._seconds * 1000).toISOString() : null
  }));
  
  return tasksWithStringDates;
}

export async function fetchTask(projectId, taskId) {
  return apiRequest(`/api/projects/tasks?projectId=${projectId}&&taskId=${taskId}`);
}

export async function addTask(projectId, taskData) {
  return apiRequest(`/api/projects/tasks?projectId=${projectId}`, 'POST', taskData);
}

export async function updateTask(projectId, taskId, updateData) {
  return apiRequest(`/api/projects/tasks?projectId=${projectId}&&taskId=${taskId}`, 'PUT', updateData);
}

export async function deleteTask(projectId, taskId) {
  return apiRequest(`/api/projects/tasks?projectId=${projectId}&&taskId=${taskId}`, 'DELETE');
}

// Comments API
export async function fetchComments(projectId, taskId) {
  return apiRequest(`/api/projects/tasks/comments?projectId=${projectId}&&taskId=${taskId}`);
}

export async function addComment(projectId, taskId, commentData) {
  return apiRequest(`/api/projects/tasks/comments?projectId=${projectId}&&taskId=${taskId}`, 'POST', commentData);
}

export async function deleteComment(projectId, taskId, commentId) {
  return apiRequest(`/api/projects/tasks/comments?projectId=${projectId}&&taskId=${taskId}&&commentId=${commentId}`, 'DELETE');
}

// Users API
export async function fetchUserById(userId) {
  return apiRequest(`/api/users?action=name&userId=${encodeURIComponent(userId)}`);
}

export async function searchUser(query) {
  return apiRequest(`/api/users?action=search&query=${encodeURIComponent(query)}`);
}

export async function updateUserProfile(userData) {
  return apiRequest(`/api/users/profile`, 'PUT', userData);
}

// Notifications API
export async function fetchNotifications() {
  return apiRequest('/api/notifications');
}

export async function markNotificationAsRead(notificationId) {
  return apiRequest(`/api/notifications?notificationId=${notificationId}`, 'PUT');
}

export async function markAllNotificationsAsRead() {
  return apiRequest('/api/notifications', 'PUT');
}

export async function sendNotification(projectId, taskId, title, body, type = 'info') {
  return apiRequest('/api/notifications', 'POST', { 
    projectId, 
    taskId, 
    title, 
    body, 
    type 
  });
} 