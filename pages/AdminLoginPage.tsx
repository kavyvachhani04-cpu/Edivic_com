import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Shield } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Enforce admin check by email for this demo
      if (data.user?.email === 'admin@gmail.com') {
          navigate('/admin/dashboard');
      } else {
          // If not admin, sign them out and show error
          await supabase.auth.signOut();
          setError('Access denied: You do not have administrator privileges.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-10 rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
             <Shield className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Admin Access</h2>
          <p className="mt-2 text-sm text-slate-400">
            Restricted area. Authorized personnel only.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="admin@gmail.com"
                    disabled={loading}
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    disabled={loading}
                />
            </div>
          </div>

          <Button type="submit" fullWidth className="bg-indigo-600 hover:bg-indigo-700 text-white border-none" disabled={loading}>
            {loading ? 'Authenticating...' : 'Authenticate'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;