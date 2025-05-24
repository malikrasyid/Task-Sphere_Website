# Task Sphere Vue

A modern task management application built with Vue.js 3 and the Composition API.

## Features

- User authentication
- Project management
- Task tracking
- Real-time updates with Socket.IO
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd task-sphere-vue
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Project Structure

```
task-sphere-vue/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── LoginForm.vue
│   │   ├── ProjectCard.vue
│   │   ├── ProjectList.vue
│   │   ├── TaskCard.vue
│   │   ├── ToastContainer.vue
│   │   └── ToastNotification.vue
│   ├── services/
│   │   ├── api.js
│   │   ├── socket.js
│   │   └── utils.js
│   ├── stores/
│   │   ├── authStore.js
│   │   ├── notificationStore.js
│   │   ├── projectStore.js
│   │   └── taskStore.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── vite.config.js
```

## Technologies Used

- Vue.js 3 with Composition API
- Pinia for state management
- Socket.IO for real-time communication
- Tailwind CSS for styling
- Vite for build tooling

## Backend API

This application connects to a REST API backend. The API endpoints are defined in `src/services/api.js`.

## License

MIT
