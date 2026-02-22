import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trash2, Shield, LogOut, Search, AlertCircle, Users, MessageSquare, Mail, Settings, Key, Briefcase, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const AdminPanelPage: React.FC = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState<'users' | 'inquiries' | 'settings' | 'projects'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState('');
  
  // Settings State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/admin/login');
      } else if (!isAdmin) {
        navigate('/');
      } else {
        fetchData();
      }
    }
  }, [user, authLoading, isAdmin, navigate, activeTab]);

  const fetchData = async () => {
    if (activeTab === 'settings') return;
    
    setLoadingData(true);
    setFetchError('');
    try {
      if (activeTab === 'users') {
          // Fetch Users
          const { data, error } = await supabase.from('profiles').select('*');
          
          if (error) {
            if (error.code === '42P01') {
                setFetchError("Table 'profiles' not found.");
            } else {
                throw error;
            }
          } else {
            setUsers(data || []);
          }
      } else if (activeTab === 'inquiries') {
          // Fetch Inquiries
          const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
             if (error.code === '42P01') {
                setFetchError("Table 'inquiries' not found. Please run the SQL script.");
             } else {
                throw error;
             }
          } else {
             setInquiries(data || []);
          }
      } else if (activeTab === 'projects') {
          // Fetch Projects
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
             if (error.code === '42P01') {
                setFetchError("Table 'projects' not found.");
             } else {
                throw error;
             }
          } else {
             setProjects(data || []);
          }
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setFetchError(error.message || 'Failed to fetch data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
       try {
           const { error } = await supabase.from('profiles').delete().eq('id', userId);
           if (error) throw error;
           fetchData();
       } catch (error: any) {
           alert('Error: ' + error.message);
       }
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (window.confirm('Delete this inquiry?')) {
        try {
            const { error } = await supabase.from('inquiries').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
        try {
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    }
  }

  const handleApproveProject = async (id: string) => {
    try {
        const { error } = await supabase
            .from('projects')
            .update({ status: 'open' })
            .eq('id', id);
        if (error) throw error;
        fetchData();
    } catch (error: any) {
        alert('Error: ' + error.message);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        setPasswordMessage('Passwords do not match');
        return;
    }
    if (newPassword.length < 6) {
        setPasswordMessage('Password must be at least 6 characters');
        return;
    }

    setUpdatingPassword(true);
    setPasswordMessage('');

    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setPasswordMessage('Password updated successfully');
        setNewPassword('');
        setConfirmPassword('');
    } catch (error: any) {
        setPasswordMessage('Error: ' + error.message);
    } finally {
        setUpdatingPassword(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInquiries = inquiries.filter(i => 
    (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.message || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter(p => 
    (p.project_title || p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.project_description || p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-gold">Loading...</div>;

  return (
    <div className="min-h-screen bg-black selection:bg-gold selection:text-black">
      <nav className="bg-surface border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-gold" />
              <span className="font-bold text-lg tracking-tight text-white font-display">Admin Console</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400 hidden sm:inline">System Admin</span>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header & Tabs */}
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white font-display">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Overview of system activity.</p>
                </div>
                {activeTab !== 'settings' && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold w-full sm:w-64"
                        />
                    </div>
                )}
            </div>

            <div className="flex space-x-1 bg-surface p-1 rounded-lg w-fit border border-white/10">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'users' ? 'bg-gold text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Users className="h-4 w-4" />
                    <span>Users</span>
                </button>
                <button
                    onClick={() => setActiveTab('inquiries')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'inquiries' ? 'bg-gold text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <MessageSquare className="h-4 w-4" />
                    <span>Inquiries</span>
                </button>
                <button
                    onClick={() => setActiveTab('projects')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'projects' ? 'bg-gold text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Briefcase className="h-4 w-4" />
                    <span>Projects</span>
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'settings' ? 'bg-gold text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                </button>
            </div>
        </div>

        {fetchError && (
             <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-medium">Database Config Missing</h3>
                    <p className="text-sm mt-1">{fetchError}</p>
                </div>
            </div>
        )}

        <div className="bg-surface rounded-xl shadow-sm border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'users' ? (
                // USERS TABLE
                <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-white/10">
                    {loadingData ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading users...</td></tr>
                    ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-gold font-bold shrink-0 border border-white/10">
                                {(u.name || u.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-white">{u.name || 'Unknown'}</div>
                                <div className="text-sm text-slate-500">{u.email}</div>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                            {u.role || 'user'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {u.role !== 'admin' && (
                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                            )}
                        </td>
                        </tr>
                    ))
                    ) : (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No users found.</td></tr>
                    )}
                </tbody>
                </table>
            ) : activeTab === 'inquiries' ? (
                // INQUIRIES TABLE
                <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-white/10">
                    {loadingData ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading inquiries...</td></tr>
                    ) : filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-gold font-bold shrink-0 border border-white/10">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-white">{inq.name}</div>
                                    <div className="text-sm text-slate-500">{inq.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <p className="text-sm text-slate-400 line-clamp-2 max-w-xs sm:max-w-md">{inq.message}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(inq.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleDeleteInquiry(inq.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </td>
                        </tr>
                    ))
                    ) : (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No inquiries found.</td></tr>
                    )}
                </tbody>
                </table>
            ) : activeTab === 'projects' ? (
                // PROJECTS TABLE
                <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-white/10">
                    {loadingData ? (
                        <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading projects...</td></tr>
                    ) : filteredProjects.length > 0 ? (
                    filteredProjects.map((p) => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-gold font-bold shrink-0 border border-white/10">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-white">{p.project_title || p.title}</div>
                                    <div className="text-sm text-slate-500 line-clamp-1 max-w-xs">{p.project_description || p.description}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {p.client_name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {p.budget}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                p.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                p.status === 'assigned' || p.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                p.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                                {p.status.replace('_', ' ')}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                                {p.status === 'pending' && (
                                    <button onClick={() => handleApproveProject(p.id)} className="text-green-400 hover:bg-green-500/10 p-2 rounded transition-colors" title="Approve">
                                        <CheckCircle className="h-4 w-4" />
                                    </button>
                                )}
                                <button onClick={() => handleDeleteProject(p.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors" title="Delete">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </td>
                        </tr>
                    ))
                    ) : (
                        <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No projects found.</td></tr>
                    )}
                </tbody>
                </table>
            ) : (
                // SETTINGS TAB
                <div className="p-8 max-w-2xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-display">
                        <Key className="h-5 w-5 text-gold" />
                        Change Admin Password
                    </h2>
                    
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                        {passwordMessage && (
                            <div className={`p-4 rounded-lg text-sm ${passwordMessage.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                {passwordMessage}
                            </div>
                        )}
                        
                        <Input
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                        
                        <Input
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                        />
                        
                        <Button type="submit" disabled={updatingPassword} className="bg-gold hover:bg-gold-dark text-black border-none font-bold">
                            {updatingPassword ? 'Updating...' : 'Update Password'}
                        </Button>
                    </form>
                </div>
            )}
          </div>
          
          {activeTab !== 'settings' && (
            <div className="bg-surface px-6 py-3 border-t border-white/10 text-sm text-slate-500">
                Showing {
                    activeTab === 'users' ? filteredUsers.length : 
                    activeTab === 'inquiries' ? filteredInquiries.length :
                    filteredProjects.length
                } results
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanelPage;