import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Mail, MapPin, Send, Briefcase } from 'lucide-react';

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
    <div className="min-h-screen bg-black pt-20 pb-24 selection:bg-gold selection:text-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-300 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-gold mr-3"></span>
            Get in Touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 font-display">
            Contact <span className="text-gold">EDIVIC</span>
          </h1>
          <p className="text-xl text-slate-400 font-light">
            Have questions, feedback, or partnership inquiries? We would love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
                <div className="glass p-8 rounded-2xl border border-white/10 hover:border-gold/30 transition-all duration-300">
                    <h3 className="text-xl font-bold text-white mb-8 font-display">Contact Information</h3>
                    
                    <div className="space-y-8">
                        <div className="flex items-start space-x-4 group">
                            <div className="bg-white/5 p-3 rounded-lg border border-white/10 group-hover:border-gold/50 transition-colors">
                                <Mail className="h-6 w-6 text-gold" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Support Email</p>
                                <p className="text-white text-lg font-light group-hover:text-gold transition-colors">support@edivic.com</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 group">
                            <div className="bg-white/5 p-3 rounded-lg border border-white/10 group-hover:border-gold/50 transition-colors">
                                <Briefcase className="h-6 w-6 text-gold" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Business Inquiries</p>
                                <p className="text-white text-lg font-light group-hover:text-gold transition-colors">business@edivic.com</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 group">
                            <div className="bg-white/5 p-3 rounded-lg border border-white/10 group-hover:border-gold/50 transition-colors">
                                <MapPin className="h-6 w-6 text-gold" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Location</p>
                                <p className="text-white text-lg font-light">India (Global Remote Platform)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="glass p-8 rounded-2xl border border-white/10 hover:border-gold/30 transition-all duration-300">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'success' && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg text-sm">
                            Message sent successfully! We will get back to you soon.
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm">
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
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            Message
                        </label>
                        <textarea
                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            placeholder="How can we help you?"
                        />
                    </div>

                    <Button 
                        type="submit" 
                        fullWidth 
                        disabled={loading || status === 'success'}
                        className="bg-gold hover:bg-gold-dark text-black border-none font-bold"
                    >
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

export default ContactPage;