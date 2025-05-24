import { reactive, computed } from 'vue';

// Task Card Component State
export const taskCardState = reactive({
  comments: {},
  newComments: {},
  loadingComments: {},
  
  // Getters
  getComments: computed(() => (taskId) => taskCardState.comments[taskId] || []),
  getNewComment: computed(() => (taskId) => taskCardState.newComments[taskId] || ''),
  isLoadingComments: computed(() => (taskId) => !!taskCardState.loadingComments[taskId]),
  
  // Setters
  setComments(taskId, commentsList) {
    taskCardState.comments[taskId] = commentsList;
  },
  setNewComment(taskId, comment) {
    taskCardState.newComments[taskId] = comment;
  },
  setLoadingComments(taskId, isLoading) {
    taskCardState.loadingComments[taskId] = isLoading;
  },
  clearNewComment(taskId) {
    taskCardState.newComments[taskId] = '';
  }
});

// Project Card Component State
export const projectCardState = reactive({
  expanded: {},
  loading: {},
  
  // Getters
  isExpanded: computed(() => (projectId) => !!projectCardState.expanded[projectId]),
  isLoading: computed(() => (projectId) => !!projectCardState.loading[projectId]),
  
  // Setters
  setExpanded(projectId, value) {
    projectCardState.expanded[projectId] = value;
  },
  setLoading(projectId, value) {
    projectCardState.loading[projectId] = value;
  },
  toggleExpanded(projectId) {
    projectCardState.expanded[projectId] = !projectCardState.expanded[projectId];
  }
});

// Dashboard Component State
export const dashboardState = reactive({
  activeTab: 'projects',
  searchQuery: '',
  filteredProjects: [],
  filteredTasks: [],
  
  // Getters
  getActiveTab: computed(() => dashboardState.activeTab),
  getSearchQuery: computed(() => dashboardState.searchQuery),
  getFilteredProjects: computed(() => dashboardState.filteredProjects),
  getFilteredTasks: computed(() => dashboardState.filteredTasks),
  
  // Setters
  setActiveTab(tab) {
    dashboardState.activeTab = tab;
  },
  setSearchQuery(query) {
    dashboardState.searchQuery = query;
  },
  setFilteredProjects(projects) {
    dashboardState.filteredProjects = projects;
  },
  setFilteredTasks(tasks) {
    dashboardState.filteredTasks = tasks;
  }
});

// Calendar Component State
export const calendarState = reactive({
  currentDate: new Date(),
  selectedDate: new Date(),
  events: [],
  view: 'month', // 'month', 'week', 'day'
  
  // Getters
  getCurrentDate: computed(() => calendarState.currentDate),
  getSelectedDate: computed(() => calendarState.selectedDate),
  getEvents: computed(() => calendarState.events),
  getView: computed(() => calendarState.view),
  
  // Setters
  setCurrentDate(date) {
    calendarState.currentDate = date;
  },
  setSelectedDate(date) {
    calendarState.selectedDate = date;
  },
  setEvents(eventsList) {
    calendarState.events = eventsList;
  },
  setView(view) {
    calendarState.view = view;
  }
});

// Modal States
export const modalState = reactive({
  addTask: {
    isOpen: false,
    projectId: null
  },
  createProject: {
    isOpen: false
  },
  addMember: {
    isOpen: false,
    projectId: null
  },
  
  // Getters
  isAddTaskModalOpen: computed(() => modalState.addTask.isOpen),
  isCreateProjectModalOpen: computed(() => modalState.createProject.isOpen),
  isAddMemberModalOpen: computed(() => modalState.addMember.isOpen),
  getAddTaskProjectId: computed(() => modalState.addTask.projectId),
  getAddMemberProjectId: computed(() => modalState.addMember.projectId),
  
  // Setters
  openAddTaskModal(projectId) {
    modalState.addTask.isOpen = true;
    modalState.addTask.projectId = projectId;
  },
  closeAddTaskModal() {
    modalState.addTask.isOpen = false;
    modalState.addTask.projectId = null;
  },
  openCreateProjectModal() {
    modalState.createProject.isOpen = true;
  },
  closeCreateProjectModal() {
    modalState.createProject.isOpen = false;
  },
  openAddMemberModal(projectId) {
    modalState.addMember.isOpen = true;
    modalState.addMember.projectId = projectId;
  },
  closeAddMemberModal() {
    modalState.addMember.isOpen = false;
    modalState.addMember.projectId = null;
  }
});

// Toast Notification State
export const toastState = reactive({
  notifications: [],
  
  // Getters
  getNotifications: computed(() => toastState.notifications),
  
  // Methods
  addNotification(type, message) {
    const id = Date.now();
    toastState.notifications.push({ id, type, message });
    setTimeout(() => {
      toastState.removeNotification(id);
    }, 5000);
    return id;
  },
  removeNotification(id) {
    const index = toastState.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      toastState.notifications.splice(index, 1);
    }
  }
});

// CommentList Component State
export const commentListState = reactive({
  userNames: {},
  loadingUsers: {},
  deletingComments: {},
  
  // Getters
  getUserName: computed(() => (userId) => commentListState.userNames[userId] || 'Loading...'),
  isLoadingUser: computed(() => (userId) => !!commentListState.loadingUsers[userId]),
  isDeletingComment: computed(() => (commentId) => !!commentListState.deletingComments[commentId]),
  
  // Setters
  setUserName(userId, name) {
    commentListState.userNames[userId] = name;
  },
  setLoadingUser(userId, isLoading) {
    commentListState.loadingUsers[userId] = isLoading;
  },
  setDeletingComment(commentId, isDeleting) {
    commentListState.deletingComments[commentId] = isDeleting;
  }
});

// CreateProjectModal Component State
export const createProjectState = reactive({
  formData: {
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  },
  loading: false,
  
  // Getters
  getFormData: computed(() => createProjectState.formData),
  isLoading: computed(() => createProjectState.loading),
  
  // Setters
  setFormData(data) {
    createProjectState.formData = { ...data };
  },
  updateFormField(field, value) {
    createProjectState.formData[field] = value;
  },
  setLoading(isLoading) {
    createProjectState.loading = isLoading;
  },
  resetForm() {
    createProjectState.formData = {
      name: '',
      description: '',
      startDate: '',
      endDate: ''
    };
  }
});

// LoginForm Component State
export const loginFormState = reactive({
  email: '',
  password: '',
  isSignup: false,
  firstName: '',
  lastName: '',
  
  // Getters
  getEmail: computed(() => loginFormState.email),
  getPassword: computed(() => loginFormState.password),
  getIsSignup: computed(() => loginFormState.isSignup),
  getFirstName: computed(() => loginFormState.firstName),
  getLastName: computed(() => loginFormState.lastName),
  
  // Setters
  setEmail(email) {
    loginFormState.email = email;
  },
  setPassword(password) {
    loginFormState.password = password;
  },
  setIsSignup(isSignup) {
    loginFormState.isSignup = isSignup;
  },
  setFirstName(firstName) {
    loginFormState.firstName = firstName;
  },
  setLastName(lastName) {
    loginFormState.lastName = lastName;
  },
  toggleForm() {
    loginFormState.isSignup = !loginFormState.isSignup;
    loginFormState.email = '';
    loginFormState.password = '';
    loginFormState.firstName = '';
    loginFormState.lastName = '';
  },
  resetForm() {
    loginFormState.email = '';
    loginFormState.password = '';
    loginFormState.firstName = '';
    loginFormState.lastName = '';
  }
});

// ProjectList Component State
export const projectListState = reactive({
  projects: [],
  loading: false,
  selectedProjectId: '',
  
  // Getters
  getProjects: computed(() => projectListState.projects),
  isLoading: computed(() => projectListState.loading),
  getSelectedProjectId: computed(() => projectListState.selectedProjectId),
  
  // Setters
  setProjects(projects) {
    projectListState.projects = projects;
  },
  setLoading(isLoading) {
    projectListState.loading = isLoading;
  },
  setSelectedProjectId(projectId) {
    projectListState.selectedProjectId = projectId;
  }
});

// AddTaskModal Component State
export const addTaskState = reactive({
  formData: {
    name: '',
    deliverable: '',
    startDate: '',
    endDate: ''
  },
  loading: false,
  
  // Getters
  getFormData: computed(() => addTaskState.formData),
  isLoading: computed(() => addTaskState.loading),
  
  // Setters
  setFormData(data) {
    addTaskState.formData = { ...data };
  },
  updateFormField(field, value) {
    addTaskState.formData[field] = value;
  },
  setLoading(isLoading) {
    addTaskState.loading = isLoading;
  },
  resetForm() {
    addTaskState.formData = {
      name: '',
      deliverable: '',
      startDate: '',
      endDate: ''
    };
  }
});

// AddMemberModal Component State
export const addMemberState = reactive({
  searchQuery: '',
  searchResults: [],
  selectedMembers: [],
  loading: false,
  
  // Getters
  getSearchQuery: computed(() => addMemberState.searchQuery),
  getSearchResults: computed(() => addMemberState.searchResults),
  getSelectedMembers: computed(() => addMemberState.selectedMembers),
  isLoading: computed(() => addMemberState.loading),
  
  // Setters
  setSearchQuery(query) {
    addMemberState.searchQuery = query;
  },
  setSearchResults(results) {
    addMemberState.searchResults = results;
  },
  setSelectedMembers(members) {
    addMemberState.selectedMembers = members;
  },
  setLoading(isLoading) {
    addMemberState.loading = isLoading;
  },
  addSelectedMember(member) {
    addMemberState.selectedMembers.push(member);
    addMemberState.searchResults = addMemberState.searchResults.filter(u => u.id !== member.id);
  },
  removeSelectedMember(member) {
    addMemberState.selectedMembers = addMemberState.selectedMembers.filter(m => m.id !== member.id);
  },
  resetState() {
    addMemberState.searchQuery = '';
    addMemberState.searchResults = [];
    addMemberState.selectedMembers = [];
    addMemberState.loading = false;
  }
});

// TeamMemberCard Component State
export const teamMemberState = reactive({
  userNames: {},
  loadingUsers: {},
  
  // Getters
  getUserName: computed(() => (userId) => teamMemberState.userNames[userId] || 'Unknown User'),
  isLoadingUser: computed(() => (userId) => !!teamMemberState.loadingUsers[userId]),
  
  // Setters
  setUserName(userId, name) {
    teamMemberState.userNames[userId] = name;
  },
  setLoadingUser(userId, isLoading) {
    teamMemberState.loadingUsers[userId] = isLoading;
  }
}); 