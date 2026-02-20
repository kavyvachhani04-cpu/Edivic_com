import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Rocket, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (email) {
      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/#/reset-password', // Assuming hash router or specific route
        });
        if (error) throw error;
        setSubmitted(true);
      } catch (err: any) {
        setError(err.message || 'Error sending reset email');
      } finally {
        setLoading(false);
      }
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
          <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>

        {!submitted ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
            <Input
                id="email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
            />
            <Button type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            </form>
        ) : (
            <div className="mt-8 text-center">
                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm">
                    If an account exists for <strong>{email}</strong>, you will receive a reset link shortly.
                </div>
                <Button onClick={() => setSubmitted(false)} variant="outline" fullWidth>
                    Try another email
                </Button>
            </div>
        )}

        <div className="text-center mt-6">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;