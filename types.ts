
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin' | 'client' | 'editor';
  createdAt: string;
  subscription_status?: 'active' | 'inactive';
  plan_name?: string;
  subscription_expiry?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export enum AnalyticsRange {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year'
}

export interface Project {
  id: string;
  client_id: string;
  editor_id?: string;
  title: string;
  description: string;
  budget: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'cancelled';
  submission_url?: string;
  created_at: string;
  rating?: number;
  feedback?: string;
  skills?: string;
  experience_level?: string;
}
