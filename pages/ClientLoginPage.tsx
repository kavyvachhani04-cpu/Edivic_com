import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User } from 'lucide-react';

const ClientLoginPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect if user is already logged in
  React.useEffect(() => {
    if (user && user.role === 'client') {
      navigate('/dashboard-client');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Add timeout to signInWithPassword
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timed out')), 5000)
      );

      const { data, error: authError } = await Promise.race([signInPromise, timeoutPromise]) as any;

      if (authError) throw authError;

      // Check role to prevent cross-role login
      const role = data.user?.user_metadata?.role;
      if (role === 'editor') {
        await supabase.auth.signOut();
        setError('This email is registered as an Editor. Please sign in on the Editor Login page.');
        setLoading(false);
        return;
      }

      if (data.session) {
        // Race refreshUser with a timeout to prevent hanging
        const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
        await Promise.race([refreshUser(data.session), timeout]);
        
        navigate('/dashboard-client');
      } else {
        throw new Error('No session created');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message?.includes('rate limit') || err.message?.includes('security purposes') || err.status === 429) {
        setError('Too many attempts. Please wait a minute before trying again.');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass p-10 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>
        
        <div className="text-center relative z-10">
          <div className="mx-auto h-12 w-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 border border-slate-700">
             <User className="h-6 w-6 text-primary-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Client Login</h2>
          <p className="mt-2 text-sm text-slate-400">
            Welcome back to EDIVIC.
          </p>
        </div>
        
        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" fullWidth size="lg" className="mt-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <p className="text-center text-sm text-slate-500">
            No account yet?{' '}
            <Link to="/signup-client" className="font-medium text-primary-400 hover:text-primary-300">
              Sign up as Client
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ClientLoginPage;