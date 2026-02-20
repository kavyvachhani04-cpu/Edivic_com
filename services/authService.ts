import { User, LoginResponse } from '../types';

const USERS_KEY = 'nexus_users';
const CURRENT_USER_KEY = 'nexus_current_user';

// Initialize default admin if not exists
const initAdmin = () => {
  const users = getUsers();
  const adminExists = users.some(u => u.email === 'admin');
  if (!adminExists) {
    const adminUser: User = {
      id: 'admin-001',
      name: 'System Admin',
      email: 'admin',
      passwordHash: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    users.push(adminUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export const getUsers = (): User[] => {
  const usersStr = localStorage.getItem(USERS_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
};

export const saveUser = (user: User): boolean => {
  const users = getUsers();
  if (users.some(u => u.email === user.email)) {
    return false; // User exists
  }
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
};

export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const newUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
};

export const loginUser = (email: string, password: string): LoginResponse => {
  // Ensure admin exists
  initAdmin();

  const users = getUsers();
  const user = users.find(u => u.email === email && u.passwordHash === password);

  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true, user };
  }

  return { success: false, message: 'Invalid email or password' };
};

export const logoutUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const updateUserProfile = (userId: string, updates: Partial<User>): User | null => {
  let users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return null;

  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Update session if it's the current user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  }
  
  return updatedUser;
};

// Initialize on load
initAdmin();