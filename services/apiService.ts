// services/apiService.ts

// Use different API base URLs for development and production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://eko-7.onrender.com/api'  // Production backend URL
  : 'http://localhost:5000/api';      // Local development

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('ekoToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Auth API calls
export const authAPI = {
  // Register a new user
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    if (response.ok) {
      // Save token to localStorage
      localStorage.setItem('ekoToken', data.token);
      return data;
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    if (response.ok) {
      // Save token to localStorage
      localStorage.setItem('ekoToken', data.token);
      return data;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  },

  // Google login
  googleLogin: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    const data = await response.json();
    if (response.ok) {
      // Save token to localStorage
      localStorage.setItem('ekoToken', data.token);
      return data;
    } else {
      throw new Error(data.message || 'Google login failed');
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('ekoToken');
  }
};

// User API calls
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to fetch profile');
    }
  },

  // Update user profile
  updateProfile: async (userData: Partial<{ name: string; email: string; avatarUrl: string }>) => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to update profile');
    }
  },

  // Update user settings
  updateSettings: async (settings: { theme?: string; language?: string; mapSource?: string }) => {
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(settings),
    });
    
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to update settings');
    }
  },

  // Add a saved place
  addSavedPlace: async (place: { name: string; category: string; imageUrl: string }) => {
    const response = await fetch(`${API_BASE_URL}/users/saved-places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(place),
    });
    
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to save place');
    }
  },

  // Remove a saved place
  removeSavedPlace: async (placeId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/saved-places/${placeId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to remove place');
    }
  }
};

// Places API calls
export const placesAPI = {
  // Get places by category
  getPlacesByCategory: async (category: string) => {
    const response = await fetch(`${API_BASE_URL}/places/category/${category}`);
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to fetch places');
    }
  },

  // Search places
  searchPlaces: async (query: string) => {
    const response = await fetch(`${API_BASE_URL}/places/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to search places');
    }
  }
};

// Chat API calls
export const chatAPI = {
  // Get chat history
  getChatHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/chat/history`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to fetch chat history');
    }
  },

  // Save a message
  saveMessage: async (message: { role: string; text: string }) => {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(message),
    });
    
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to save message');
    }
  },

  // Clear chat history
  clearChatHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/chat/history`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to clear chat history');
    }
  }
};