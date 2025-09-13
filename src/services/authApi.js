// src/services/authApi.js
// Mock user database
const mockUsers = [
  {
    id: 1,
    name: 'John Employee',
    email: 'employee@example.com',
    password: 'password123',
    employeeId: 'EMP001',
    department: 'Sales',
    position: 'Sales Representative',
    role: 'employee',
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    name: 'Sarah Manager',
    email: 'admin@example.com',
    password: 'password123',
    employeeId: 'MGR001',
    department: 'Management',
    position: 'Operations Manager',
    role: 'manager',
    createdAt: '2024-01-01'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    employeeId: 'EMP002',
    department: 'Marketing',
    position: 'Marketing Specialist',
    role: 'employee',
    createdAt: '2024-01-15'
  }
];

export const authApi = {
  login: async (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => 
          u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          resolve({
            user: userWithoutPassword,
            token: `mock-jwt-token-${user.id}`
          });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  },

  signUp: async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if email already exists
        const existingUser = mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          reject(new Error('Email already registered'));
          return;
        }

        // Check if employee ID already exists
        const existingEmployee = mockUsers.find(u => u.employeeId === userData.employeeId);
        if (existingEmployee) {
          reject(new Error('Employee ID already registered'));
          return;
        }

        // Create new user
        const newUser = {
          id: Math.max(...mockUsers.map(u => u.id)) + 1,
          name: userData.name,
          email: userData.email,
          password: userData.password,
          employeeId: userData.employeeId,
          department: userData.department || '',
          position: userData.position || '',
          role: userData.role || 'employee',
          createdAt: new Date().toISOString().split('T')[0]
        };

        // In a real app, this would be saved to a database
        mockUsers.push(newUser);

        // Remove password from response
        const { password, ...userWithoutPassword } = newUser;
        resolve({
          user: userWithoutPassword,
          token: `mock-jwt-token-${newUser.id}`
        });
      }, 1500);
    });
  },

  logout: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }
};