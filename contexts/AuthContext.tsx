
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  isAdmin: false,
  refreshUser: async () => {} 
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchExtendedProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status, plan_name, subscription_expiry')
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

    const profile = await fetchExtendedProfile(sbUser.id);

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

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const mappedUser = await mapSupabaseUser(session.user);
        setUser(mappedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
    <AuthContext.Provider value={{ user, loading, isAdmin, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
