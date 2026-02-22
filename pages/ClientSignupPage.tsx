import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User } from 'lucide-react';

const ClientSignupPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create the user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, role: 'client' },
        },
      });

      if (authError) throw authError;

      if (data.session) {
        await refreshUser(data.session);
        navigate('/dashboard-client');
      } else {
        // Session is null, meaning email confirmation is required
        // Check if user is actually new or just unconfirmed
        if (data.user && data.user.identities && data.user.identities.length === 0) {
             setError('This email is already registered. Please log in.');
        } else {
             setError('Account created! Please check your email to confirm your account before logging in.');
        }
        setLoading(false); 
        return; 
      }

    } catch (err: any) {
      console.error('Signup error:', err);
      // Handle different error formats
      const message = err.message || err.error_description || (typeof err === 'string' ? err : 'Unknown error');
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('rate limit') || lowerMessage.includes('security purposes') || err.status === 429) {
        if (lowerMessage.includes('email rate limit exceeded')) {
             setError('Email rate limit exceeded. Please wait a few minutes before trying again.');
        } else {
             setError('Too many signup attempts. Please wait 60 seconds before trying again, or use a different email address.');
        }
      } else if (lowerMessage.includes('already registered') || lowerMessage.includes('unique constraint')) {
        setError('This email is already registered. Please log in.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass p-10 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Decorative ambient light */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>

        <div className="text-center relative z-10">
          <div className="mx-auto h-12 w-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 border border-slate-700">
             <User className="h-6 w-6 text-primary-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Client Signup</h2>
          <p className="mt-2 text-sm text-slate-400">
            Hire the best editors for your projects.
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
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" fullWidth size="lg" className="mt-4" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Client Account'}
          </Button>
          
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login-client" className="font-medium text-primary-400 hover:text-primary-300">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ClientSignupPage;