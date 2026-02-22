import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login based on the first allowed role, or default
        if (allowedRoles.includes('admin')) navigate('/admin/login');
        else if (allowedRoles.includes('client')) navigate('/login-client');
        else if (allowedRoles.includes('editor')) navigate('/login-editor');
        else navigate('/');
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        // Redirect based on their actual role
        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'client') navigate('/dashboard-client');
        else if (user.role === 'editor') navigate('/dashboard-editor');
        else navigate('/');
      }
    }
  }, [user, loading, navigate, allowedRoles]);

  if (loading) return <LoadingScreen />;

  // If user is loaded and has allowed role, render children
  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return null; // Don't render anything while redirecting
};
