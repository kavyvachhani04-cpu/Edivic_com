import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { MonitorPlay } from 'lucide-react';

const EditorSignupPage: React.FC = () => {
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
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, role: 'editor' },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
              id: data.user.id, 
              name: name, 
              email: email, 
              role: 'editor', 
              created_at: new Date().toISOString()
            }]);

        if (profileError) console.warn('Profile creation warning:', profileError.message);
      }

      await refreshUser();
      navigate('/dashboard-editor');

    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.message?.includes('rate limit') || err.message?.includes('security purposes') || err.status === 429) {
        setError('Too many attempts. Please wait a minute before trying again.');
      } else {
        setError(err.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass p-10 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="text-center relative z-10">
          <div className="mx-auto h-12 w-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 border border-slate-700">
             <MonitorPlay className="h-6 w-6 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Editor Signup</h2>
          <p className="mt-2 text-sm text-slate-400">
            Join the elite network of video editors.
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
              placeholder="Jane Editor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
            <Input
              label="Email address"
              type="email"
              placeholder="jane@edivic.com"
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

          <Button type="submit" fullWidth size="lg" className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Editor Account'}
          </Button>
          
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login-editor" className="font-medium text-purple-400 hover:text-purple-300">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default EditorSignupPage;