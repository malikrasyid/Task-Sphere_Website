// Format UTC date to a user-friendly string
export function formatDateUTC(dateStr) {
  if (!dateStr) return '-';

  const date = new Date(dateStr);
  if (isNaN(date)) return '-';

  return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short'
  });
}

// Calculate duration between two dates
export function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1 ? '1 day' : `${diffDays} days`;
}

// Convert string to title case
export function toTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get color for task status
export function getTaskColor(status) {
  switch (status) {
    case 'Done':
      return '#10B981'; // Green
    case 'In Progress':
      return '#3B82F6'; // Blue
    case 'Ongoing':
      return '#8B5CF6'; // Purple
    case 'Overdue':
      return '#EF4444'; // Red
    case 'Not Started':
    default:
      return '#6B7280'; // Gray
  }
}

// Get CSS class for task status
export function getStatusClass(status) {
  switch (status) {
    case 'Done':
      return 'bg-green-100 text-green-800';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'Ongoing':
      return 'bg-purple-100 text-purple-800';
    case 'Overdue':
      return 'bg-red-100 text-red-800';
    case 'Not Started':
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Determine task status based on dates
export function getAutoStatus(startDate, endDate) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  if (!start || !end) return 'Not Started';
  
  if (now < start) {
    return 'Not Started';
  } else if (now > end) {
    return 'Overdue';
  } else {
    return 'Ongoing';
  }
}

// Generate a contrast color for text based on background color
export function getContrastColor(hexColor) {
  // Remove the # if present
  hexColor = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// Lighten a color by a percentage
export function lightenColor(hex, percent) {
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  let r = parseInt(hex.substr(0, 2), 16);
  let g = parseInt(hex.substr(2, 2), 16);
  let b = parseInt(hex.substr(4, 2), 16);
  
  // Lighten
  r = Math.min(255, Math.round(r + (255 - r) * percent));
  g = Math.min(255, Math.round(g + (255 - g) * percent));
  b = Math.min(255, Math.round(b + (255 - b) * percent));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Create a debounced function
export function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Show toast notification
export function showToast(type, message) {
  // Import toastState dynamically to avoid circular dependencies
  import('../stores/componentState').then(({ toastState }) => {
    toastState.addNotification(type, message);
  }).catch(err => {
    console.error('Error showing toast:', err);
    // Fallback to event-based toast if import fails
    const toastEvent = new CustomEvent('show-toast', {
      detail: { type, message }
    });
    window.dispatchEvent(toastEvent);
  });
} 

// NEW AUTH/USER UTILITIES
export const authUtils = {
  /**
   * Checks sessionStorage for authentication token and user data.
   * @returns {{isAuthenticated: boolean, user: object | null}}
   */
  checkAuth() {
      const token = sessionStorage.getItem('sessionToken');
      const storedUser = sessionStorage.getItem('user');
      if (token && storedUser) {
          return {
              isAuthenticated: true,
              user: JSON.parse(storedUser)
          };
      }
      return {
          isAuthenticated: false,
          user: null
      };
  },

  /**
   * Clears session storage on expiration.
   * @param {function} updateAuthStateCallback - Callback to refresh Vue's reactive auth state.
   */
  handleSessionExpired(updateAuthStateCallback) {
      sessionStorage.removeItem('sessionToken');
      sessionStorage.removeItem('user');
      if (updateAuthStateCallback) {
          updateAuthStateCallback();
      }
  },

  /**
   * Logs out the user by clearing session storage.
   * @param {function} updateAuthStateCallback - Callback to refresh Vue's reactive auth state.
   */
  logout(updateAuthStateCallback) {
      sessionStorage.removeItem('sessionToken');
      sessionStorage.removeItem('user');
      if (updateAuthStateCallback) {
          updateAuthStateCallback();
      }
  },

  /**
   * Gets user initials from the user object.
   * @param {object | null} user
   * @returns {string}
   */
  getUserInitials(user) {
      if (!user) return '';
      const { firstName, lastName } = user;
      return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  },

  /**
   * Gets user full name from the user object.
   * @param {object | null} user
   * @returns {string}
   */
  getUserFullName(user) {
      if (!user) return '';
      const { firstName, lastName } = user;
      return `${firstName || ''} ${lastName || ''}`.trim();
  }
};