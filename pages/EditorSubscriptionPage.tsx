
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Check, Zap, Crown, Rocket, ShieldCheck } from 'lucide-react';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: '199',
    icon: <Rocket className="h-6 w-6 text-blue-400" />,
    color: 'blue',
    features: [
      'Access to Job Board',
      'Portfolio Profile',
      'Standard Support',
      'Up to 5 Active Proposals'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '499',
    icon: <Zap className="h-6 w-6 text-purple-400" />,
    color: 'purple',
    popular: true,
    features: [
      'Everything in Basic',
      'Priority Job Alerts',
      'Verified Editor Badge',
      'Unlimited Proposals',
      '24/7 Priority Support'
    ]
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    price: '799',
    icon: <Crown className="h-6 w-6 text-yellow-400" />,
    color: 'yellow',
    features: [
      'Everything in Pro',
      '0% Platform Fee',
      'Elite Profile Spotlight',
      'Direct Client Matching',
      'Custom Portfolio URL'
    ]
  }
];

const EditorSubscriptionPage: React.FC = () => {
  const { user, refreshUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string, planName: string) => {
    if (!user) return;
    setLoadingPlan(planId);

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 days expiry

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          plan_name: planName,
          subscription_expiry: expiryDate.toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Optimistically update local state to pass the guard immediately
      updateUser({
        subscription_status: 'active',
        plan_name: planName,
        subscription_expiry: expiryDate.toISOString()
      });

      // Background refresh (optional, but good for consistency)
      refreshUser();
      
      navigate('/dashboard-editor');
    } catch (err) {
      console.error('Subscription error:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Activate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Editor Studio</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Choose a plan to start accepting high-paying video editing projects. 
            Join 5,000+ editors growing their careers on EDIVIC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`glass p-8 rounded-3xl border ${plan.popular ? 'border-purple-500/50 scale-105 shadow-[0_0_30px_rgba(147,51,234,0.15)]' : 'border-white/5'} flex flex-col relative`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-2xl bg-slate-800 border border-white/5`}>
                  {plan.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-slate-500 text-sm">Monthly Subscription</p>
                </div>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                <span className="text-slate-500"> /month</span>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                fullWidth 
                variant={plan.popular ? 'primary' : 'outline'}
                disabled={loadingPlan !== null || (user?.plan_name === plan.name && user?.subscription_status === 'active')}
                onClick={() => handleSubscribe(plan.id, plan.name)}
                className={plan.popular ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : ''}
              >
                {loadingPlan === plan.id ? 'Processing...' : 
                 (user?.plan_name === plan.name && user?.subscription_status === 'active') ? 'Current Plan' : 'Subscribe Now'}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-white/5 text-slate-500 text-sm">
            <ShieldCheck className="h-4 w-4" />
            Secure payments via Razorpay Test Gateway
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorSubscriptionPage;
