
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  refreshUser: (session?: any) => Promise<User | null>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  isAdmin: false,
  refreshUser: async () => {},
  updateUser: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const fetchExtendedProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status, plan_name, subscription_expiry, role')
      .eq('id', userId)
      .single();
    
    if (error) return null;
    return data;
  };

  const mapSupabaseUser = async (sbUser: SupabaseUser): Promise<User> => {
    const name = sbUser.user_metadata?.name || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User';
    const isEmailAdmin = sbUser.email === 'admin@gmail.com';
    let role = sbUser.user_metadata?.role || 'user';
    if (isEmailAdmin) role = 'admin';

    // Timeout wrapper for profile fetch
    const fetchProfileWithTimeout = async () => {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 10000));
      const fetch = fetchExtendedProfile(sbUser.id);
      return Promise.race([fetch, timeout]);
    };

    let profile: any = null;
    try {
      profile = await fetchProfileWithTimeout();
    } catch (error: any) {
      console.warn('Profile fetch warning:', error.message || error);
      // Fallback: proceed without extended profile data
    }

    if (profile?.role) {
      role = profile.role;
    }

    return {
      id: sbUser.id,
      name: name,
      email: sbUser.email || '',
      passwordHash: '', 
      role: role,
      createdAt: sbUser.created_at,
      subscription_status: profile?.subscription_status || 'inactive',
      plan_name: profile?.plan_name || 'None',
      subscription_expiry: profile?.subscription_expiry
    };
  };

  const refreshUser = async (session?: any): Promise<User | null> => {
    try {
      // Add timeout to getSession as well
      const getSessionWithTimeout = async () => {
         // Increased timeout to 5s for slower connections
         const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Session fetch timeout')), 5000));
         const fetch = supabase.auth.getSession();
         return Promise.race([fetch, timeout]);
      };

      let currentSession = session;
      
      if (!currentSession) {
        try {
            const result = await getSessionWithTimeout() as any;
            
            // Handle Refresh Token Error specifically
            if (result.error) {
                if (result.error.message?.includes('Refresh Token') || result.error.message?.includes('refresh_token_not_found')) {
                    console.warn('Refresh token invalid, clearing session.');
                    await supabase.auth.signOut();
                    setUser(null);
                    setLoading(false);
                    return null;
                }
                // For other errors, just log and continue as guest
                console.warn('Session fetch error:', result.error.message);
            }
            
            currentSession = result.data?.session;
        } catch (e) {
            console.warn('Session fetch timed out or failed, defaulting to guest.');
            currentSession = null;
        }
      }
      
      if (currentSession?.user) {
        const mappedUser = await mapSupabaseUser(currentSession.user);
        setUser(mappedUser);
        return mappedUser;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser(); // Restore initial check

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        // Clear user state immediately on sign out
        setUser(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        const mappedUser = await mapSupabaseUser(session.user);
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
