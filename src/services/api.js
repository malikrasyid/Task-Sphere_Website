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
  return apiRequest('/api/auth/login', 'POST', { email, password });
}

export async function signUp(userData) {
  return apiRequest('/api/auth/signup', 'POST', { userData });
}

// Projects API
export async function fetchProjects() {
  return apiRequest('/api/projects');
}

export async function fetchProject(projectId) {
  return apiRequest(`/api/projects/${projectId}`);
}

export async function createProject(projectData) {
  return apiRequest('/api/projects', 'POST', projectData);
}

export async function updateProject(projectId, updateData) {
  return apiRequest(`/api/projects/${projectId}`, 'PATCH', updateData);
}

export async function deleteProject(projectId) {
  return apiRequest(`/api/projects/${projectId}`, 'DELETE');
}

export async function addMemberToProject(projectId, userData) {
  return apiRequest(`/api/projects/${projectId}/members/add`, 'POST', { userData });
}

export async function removeMemberFromProject(projectId, userData) {
  return apiRequest(`/api/projects/${projectId}/members/remove`, 'POST', { userData });
}

export async function updateRole(projectId, userData) {
  return apiRequest(`/api/projects/${projectId}/members/update-role`, 'POST', { userData });
}

// Tasks API
export async function fetchTasksFromProject(projectId) {
  const data = await apiRequest(`/api/projects/${projectId}/tasks`);

  const parseDate = (dateValue) => {
    if (!dateValue) return null;
    
    // Handle Firestore Timestamp object (has _seconds)
    if (typeof dateValue === 'object' && '_seconds' in dateValue) {
      return new Date(dateValue._seconds * 1000).toISOString();
    }
    
    // Handle existing ISO strings or numbers
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    
    return null;
  };

  const tasksWithStringDates = data.tasks.map(task => ({
    ...task,
    startDate: parseDate(task.startDate),
    endDate: parseDate(task.endDate)
  }));
  
  return tasksWithStringDates;
}

export async function fetchTask(projectId, taskId) {
  return apiRequest(`/api/projects/${projectId}/tasks/${taskId}`);
}

export async function addTask(projectId, taskData) {
  return apiRequest(`/api/projects/${projectId}/tasks`, 'POST', taskData);
}

export async function updateTask(projectId, taskId, updateData) {
  return apiRequest(`/api/projects/${projectId}/tasks/${taskId}`, 'PATCH', updateData);
}

export async function deleteTask(projectId, taskId) {
  return apiRequest(`/api/projects/${projectId}/tasks/${taskId}`, 'DELETE');
}

// Comments API
export async function fetchComments(projectId, taskId) {
  return apiRequest(`/api/projects/${projectId}/tasks/${taskId}/comments`);
}

export async function addComment(projectId, taskId, commentData) {
  return apiRequest(`/api/projects/${projectId}/tasks/${taskId}/comments`, 'POST', commentData);
}

export async function deleteComment(projectId, taskId, commentId) {
  return apiRequest(`/api/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, 'DELETE');
}

// Users API
export async function fetchUserById(userId) {
  return apiRequest(`/api/users/${encodeURIComponent(userId)}`);
}

export async function searchUser(query) {
  return apiRequest(`/api/users/search?query=${encodeURIComponent(query)}`);
}

export async function updateUserProfile(userData) {
  return apiRequest(`/api/users/profile`, 'PUT', userData);
}

// Notifications API
export async function fetchNotifications() {
  return apiRequest('/api/notifications');
}

export async function markNotificationAsRead(notificationId) {
  return apiRequest(`/api/notifications/${notificationId}/read`, 'PUT');
}

export async function markAllNotificationsAsRead() {
  return apiRequest('/api/notifications/mark-all-read', 'PUT');
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