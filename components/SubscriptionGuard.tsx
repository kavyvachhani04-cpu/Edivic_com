
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';

export const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login-editor');
        return;
      }

      if (user.role === 'editor') {
        const isSubscribed = user.subscription_status === 'active';
        
        // If not subscribed and not already on the subscription page
        if (!isSubscribed && location.pathname !== '/editor/subscription') {
          navigate('/editor/subscription');
        }
        
        // If already subscribed and trying to visit subscription page
        if (isSubscribed && location.pathname === '/editor/subscription') {
          navigate('/dashboard-editor');
        }
      }
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};
