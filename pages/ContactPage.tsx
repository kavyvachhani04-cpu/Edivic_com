import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Mail, MapPin, Send } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([{ name, email, message }]);

      if (error) throw error;
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Contact error:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">Contact EDIVIC</h1>
          <p className="text-xl text-slate-400">
            Have questions, feedback, or partnership inquiries? We would love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
                <div className="glass p-8 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6">Get in Touch</h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="bg-primary-500/20 p-3 rounded-lg">
                                <Mail className="h-6 w-6 text-primary-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 uppercase tracking-wider font-bold">Email</p>
                                <p className="text-white text-lg">support@edivic.com</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-purple-500/20 p-3 rounded-lg">
                                <Briefcase className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 uppercase tracking-wider font-bold">Business Email</p>
                                <p className="text-white text-lg">business@edivic.com</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="bg-slate-700 p-3 rounded-lg">
                                <MapPin className="h-6 w-6 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 uppercase tracking-wider font-bold">Location</p>
                                <p className="text-white text-lg">India (Global Remote Platform)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="glass p-8 rounded-2xl border border-white/10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'success' && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg">
                            Message sent successfully! We will get back to you soon.
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg">
                            Failed to send message. Please try again later.
                        </div>
                    )}

                    <Input 
                        label="Full Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        placeholder="Your Name"
                    />
                    <Input 
                        label="Email Address" 
                        type="email"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        placeholder="you@example.com"
                    />
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 uppercase tracking-wider text-xs">
                            Message
                        </label>
                        <textarea
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            placeholder="How can we help you?"
                        />
                    </div>

                    <Button type="submit" fullWidth disabled={loading || status === 'success'}>
                        {loading ? 'Sending...' : 'Send Message'}
                        {!loading && <Send className="ml-2 h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

// Icon needed for component
import { Briefcase } from 'lucide-react';

export default ContactPage;