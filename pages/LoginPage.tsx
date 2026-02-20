import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Rocket } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
          if (authError.message.includes("Email not confirmed")) {
              throw new Error("Please verify your email address before logging in.");
          }
          throw authError;
      }

      // Check for specific admin redirect
      if (data.user?.email === 'admin@gmail.com') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50">
        <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                <div className="bg-primary-600 p-1.5 rounded-lg">
                    <Rocket className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">EDIVIC</span>
            </Link>
          <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up for free
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            
            <div className="space-y-1">
                <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                />
                 <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    Forgot password?
                    </Link>
                </div>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" className="mt-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;