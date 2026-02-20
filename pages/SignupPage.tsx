import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Rocket } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
    }

    try {
      // 1. Create the user in Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
          },
        },
      });

      if (authError) throw authError;

      // 2. Insert into public.profiles table (Essential for Admin Panel)
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              name: name, 
              email: email, 
              role: 'user', // Default role
              created_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          // We log this but don't stop the flow, as the Auth user is already created.
          // This usually happens if the 'profiles' table doesn't exist yet.
          console.warn('Could not create public profile:', profileError.message);
        }
      }

      // 3. Handle Navigation
      if (data.session) {
        navigate('/dashboard');
      } else if (data.user) {
         // If Supabase is set to 'Confirm Email', session will be null
         setError('Account created! Please check your email to confirm your account before logging in.');
      }

    } catch (err: any) {
      setError(err.message || 'Signup failed');
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
          <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
          <p className="mt-2 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`border px-4 py-3 rounded-lg text-sm ${error.includes('created') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              id="name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
             <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" fullWidth size="lg" className="mt-2" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <p className="text-xs text-center text-slate-500 mt-4">
            By signing up, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;