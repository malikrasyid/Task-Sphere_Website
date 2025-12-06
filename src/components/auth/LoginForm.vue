<script setup>
import { computed, ref, inject } from 'vue';
import { loginFormState, toastState } from '../../stores/componentState';
import { login, signUp } from '../../services/api';
import { useRouter } from 'vue-router';

// Local state
const router = useRouter();
const isLoading = ref(false);
const error = ref(null);
const updateAuthState = inject('updateAuthState');

// Computed properties for two-way binding
const email = computed({
  get: () => loginFormState.getEmail,
  set: (value) => loginFormState.setEmail(value)
});

const password = computed({
  get: () => loginFormState.getPassword,
  set: (value) => loginFormState.setPassword(value)
});

const firstName = computed({
  get: () => loginFormState.getFirstName,
  set: (value) => loginFormState.setFirstName(value)
});

const lastName = computed({
  get: () => loginFormState.getLastName,
  set: (value) => loginFormState.setLastName(value)
});

const isSignup = computed(() => loginFormState.getIsSignup);

// Toggle between login and signup
function toggleForm() {
  loginFormState.toggleForm();
  error.value = null; // Clear error when toggling forms
}

// Handle form submission
async function handleSubmit() {
  isLoading.value = true;
  error.value = null;
  
  try {
    if (isSignup.value) {
      await signUp({
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value
      });
      toastState.addNotification('success', 'Account created successfully! Please log in.');
      loginFormState.toggleForm(); // Switch to login form after successful signup
    } else {
      const response = await login(email.value, password.value);
      // Save token and user data to sessionStorage
      sessionStorage.setItem('sessionToken', response.token);
      sessionStorage.setItem('user', JSON.stringify({
        email: email.value,
        name: response.name
      }));
      toastState.addNotification('success', 'Logged in successfully!');
      loginFormState.resetForm();
      // Update authentication state
      updateAuthState();
      // Navigate to dashboard using router
      router.push('/dashboard');
    }
  } catch (err) {
    console.error('Authentication error:', err);
    error.value = err.message || 'Authentication failed';
    toastState.addNotification('error', error.value);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <template v-if="!isSignup">
      <div>
        <label for="loginEmail" class="block text-sm font-medium text-gray-700">Email</label>
        <input 
          type="email" 
          id="loginEmail" 
          v-model="email"
          class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border transition-shadow hover:shadow-md" 
          required
        >
      </div>
      <div>
        <label for="loginPassword" class="block text-sm font-medium text-gray-700">Password</label>
        <input 
          type="password" 
          id="loginPassword" 
          v-model="password"
          class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border transition-shadow hover:shadow-md" 
          required
        >
      </div>
      <button 
        type="submit" 
        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        :disabled="isLoading"
      >
        <span v-if="isLoading">Signing in...</span>
        <span v-else>Sign in</span>
      </button>
    </template>
    
    <template v-else>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="signupFirstName" class="block text-sm font-medium text-gray-700">First Name</label>
          <input 
            type="text" 
            id="signupFirstName" 
            v-model="firstName"
            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border transition-shadow hover:shadow-md" 
            required
          >
        </div>
        <div>
          <label for="signupLastName" class="block text-sm font-medium text-gray-700">Last Name</label>
          <input 
            type="text" 
            id="signupLastName" 
            v-model="lastName"
            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border transition-shadow hover:shadow-md" 
            required
          >
        </div>
      </div>
      <div>
        <label for="signupEmail" class="block text-sm font-medium text-gray-700">Email</label>
        <input 
          type="email" 
          id="signupEmail" 
          v-model="email"
          class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border transition-shadow hover:shadow-md" 
          required
        >
      </div>
      <div>
        <label for="signupPassword" class="block text-sm font-medium text-gray-700">Password</label>
        <input 
          type="password" 
          id="signupPassword" 
          v-model="password"
          class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border transition-shadow hover:shadow-md" 
          minlength="8" 
          required
        >
        <p class="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
      </div>
      <button 
        type="submit" 
        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        :disabled="isLoading"
      >
        <span v-if="isLoading">Creating account...</span>
        <span v-else>Create Account</span>
      </button>
    </template>
    
    <div v-if="error" class="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
      {{ error }}
    </div>
    
    <div class="mt-6 text-center">
      <a 
        href="#" 
        @click.prevent="toggleForm" 
        class="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        <span v-if="!isSignup">Don't have an account? Sign up</span>
        <span v-else>Already have an account? Sign in</span>
      </a>
    </div>
  </form>
</template>