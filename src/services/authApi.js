// src/services/authApi.js
export const authApi = {
  login: async (credentials) => {
    // Simulate API call with validation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Basic validation
        if (!credentials.email || !credentials.password) {
          reject(new Error('Email and password are required'));
          return;
        }

        // Mock successful login
        if (credentials.email === 'admin@example.com' && credentials.password === 'password123') {
          resolve({ 
            user: { 
              id: 1, 
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'manager'
            }, 
            token: 'mock-jwt-token-12345' 
          });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 1000); // Simulate network delay
    });
  },

  signUp: async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          user: { 
            id: Date.now(), 
            name: userData.name,
            email: userData.email,
            role: 'employee'
          }, 
          token: 'mock-jwt-token-' + Date.now() 
        });
      }, 1000);
    });
  },
};