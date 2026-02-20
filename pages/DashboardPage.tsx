import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart as BarChartIcon, 
  Settings, 
  LogOut, 
  User as UserIcon, 
  Home, 
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

// Dummy data for chart
const data = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 750 },
];

const DashboardPage: React.FC = () => {
  const { user, loading, refreshUser } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const navigate = useNavigate();

  // Profile Update State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setSuccessMsg('');
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: name }
      });
      // Updating email usually requires a confirmation process in Supabase, so we focus on metadata for now
      
      if (error) throw error;
      
      await refreshUser(); // Update local context
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  const SidebarItem = ({ icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
        active 
          ? 'bg-primary-50 text-primary-700 font-medium' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
             <div className="bg-primary-600 p-1.5 rounded-lg mr-2">
                 <BarChartIcon className="h-5 w-5 text-white" />
             </div>
             <span className="text-xl font-bold text-slate-900">EDIVIC</span>
          </div>
          
          <div className="flex-1 px-4 py-6 space-y-1">
            <SidebarItem 
              icon={<Home className="h-5 w-5" />} 
              label="Overview" 
              active={activeTab === 'overview'} 
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
            />
            <SidebarItem 
              icon={<Settings className="h-5 w-5" />} 
              label="Settings" 
              active={activeTab === 'settings'} 
              onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
            />
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center p-2 mb-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
            </div>
            <Button 
                variant="outline" 
                fullWidth 
                onClick={handleLogout}
                className="justify-start text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button 
            className="lg:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 max-w-xl mx-4 lg:mx-0 hidden sm:block">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-slate-400 hover:text-slate-600 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name}!</h1>
                <p className="text-slate-500 mt-1">Here's what's happening with your projects today.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: '$45,231', change: '+20.1%', trend: 'up' },
                    { label: 'Active Users', value: '2,338', change: '+15.2%', trend: 'up' },
                    { label: 'Bounce Rate', value: '42.3%', change: '-5.1%', trend: 'down' }, // down is good here, but color logic simplistic
                    { label: 'Active Sessions', value: '1,234', change: '+12.5%', trend: 'up' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <div className="flex items-baseline mt-2">
                            <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                            <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">User Activity</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
             <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-900">Profile Settings</h2>
                    <p className="text-sm text-slate-500">Update your personal information</p>
                </div>
                <div className="p-6">
                    {successMsg && (
                        <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
                            {successMsg}
                        </div>
                    )}
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <Input 
                            label="Full Name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            disabled={updateLoading}
                        />
                        <Input 
                            label="Email Address" 
                            type="email" 
                            value={email} 
                            disabled={true} 
                            className="bg-slate-100 cursor-not-allowed"
                        />
                         <p className="text-xs text-slate-500">Email cannot be changed directly.</p>
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={updateLoading}>
                                {updateLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;