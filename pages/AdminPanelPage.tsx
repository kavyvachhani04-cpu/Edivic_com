import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trash2, Shield, LogOut, Search, AlertCircle, Users, MessageSquare, Mail, Settings, Key } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const AdminPanelPage: React.FC = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState<'users' | 'inquiries' | 'settings'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
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
        navigate('/dashboard');
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

  if (authLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-indigo-400" />
              <span className="font-bold text-lg tracking-tight">Admin Console</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400 hidden sm:inline">System Admin</span>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-slate-800 transition-colors"
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
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Overview of system activity.</p>
                </div>
                {activeTab !== 'settings' && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
                        />
                    </div>
                )}
            </div>

            <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Users className="h-4 w-4" />
                    <span>Users</span>
                </button>
                <button
                    onClick={() => setActiveTab('inquiries')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'inquiries' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <MessageSquare className="h-4 w-4" />
                    <span>Inquiries</span>
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                </button>
            </div>
        </div>

        {fetchError && (
             <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-medium">Database Config Missing</h3>
                    <p className="text-sm mt-1">{fetchError}</p>
                </div>
            </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'users' ? (
                // USERS TABLE
                <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {loadingData ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading users...</td></tr>
                    ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                {(u.name || u.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">{u.name || 'Unknown'}</div>
                                <div className="text-sm text-slate-500">{u.email}</div>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                            {u.role || 'user'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {u.role !== 'admin' && (
                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
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
                <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {loadingData ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading inquiries...</td></tr>
                    ) : filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-slate-900">{inq.name}</div>
                                    <div className="text-sm text-slate-500">{inq.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <p className="text-sm text-slate-600 line-clamp-2 max-w-xs sm:max-w-md">{inq.message}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(inq.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleDeleteInquiry(inq.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
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
            ) : (
                // SETTINGS TAB
                <div className="p-8 max-w-2xl">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Key className="h-5 w-5 text-indigo-500" />
                        Change Admin Password
                    </h2>
                    
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                        {passwordMessage && (
                            <div className={`p-4 rounded-lg text-sm ${passwordMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
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
                        
                        <Button type="submit" disabled={updatingPassword}>
                            {updatingPassword ? 'Updating...' : 'Update Password'}
                        </Button>
                    </form>
                </div>
            )}
          </div>
          
          {activeTab !== 'settings' && (
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-sm text-slate-500">
                Showing {activeTab === 'users' ? filteredUsers.length : filteredInquiries.length} results
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanelPage;