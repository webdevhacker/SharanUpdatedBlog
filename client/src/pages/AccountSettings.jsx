import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiUser, FiLock, FiMonitor, FiCamera, FiCheck, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { profileApi, sessionApi, notificationApi } from '../utils/api';
import SessionCard from '../components/SessionCard';
import VerifiedBadge from '../components/VerifiedBadge';

const AccountSettings = () => {
  const { user, loadUser, logout } = useAuth();
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    return ['profile', 'security', 'sessions'].includes(hash) ? hash : 'profile';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['profile', 'security', 'sessions'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);  
  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    website: user?.website || '',
    twitter: user?.twitter || '',
    github: user?.github || '',
    linkedin: user?.linkedin || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef(null);

  // Security state
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    if (activeTab === 'security') fetchNotifications();
    if (activeTab === 'sessions') fetchSessions();
  }, [activeTab]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await sessionApi.get('/');
      setSessions(res.data.data);
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.get('/');
      // Just show security related ones in Danger Zone
      const securityNotifs = res.data.data.filter(n => ['login', 'password_change'].includes(n.type)).slice(0, 5);
      setNotifications(securityNotifs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await profileApi.put('/', profile);
      toast.success('Profile updated successfully');
      loadUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      toast.loading('Uploading avatar...', { id: 'avatar' });
      await profileApi.post('/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Avatar updated!', { id: 'avatar' });
      loadUser();
    } catch (err) {
      toast.error('Failed to upload avatar', { id: 'avatar' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    
    setSavingPassword(true);
    try {
      await profileApi.put('/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRevokeSession = async (id) => {
    try {
      await sessionApi.delete(`/${id}`);
      setSessions(sessions.filter(s => s._id !== id));
      toast.success('Session revoked');
    } catch (err) {
      toast.error('Failed to revoke session');
    }
  };

  const handleRevokeAll = async () => {
    if (!window.confirm('Are you sure you want to sign out of all other devices?')) return;
    try {
      await sessionApi.delete('/');
      fetchSessions();
      toast.success('Signed out of all other devices');
    } catch (err) {
      toast.error('Failed to revoke sessions');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'sessions', label: 'Sessions', icon: FiMonitor },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8 pt-24 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Manage your profile, security preferences, and active sessions.</p>
      </motion.div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  window.location.hash = tab.id;
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-6 sm:p-8">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Avatar upload */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-700">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiCamera className="w-6 h-6" />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">Profile Photo</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Recommended 256x256px. Max size 2MB.</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                  >
                    Change photo
                  </button>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                    <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email (Read Only)</label>
                    <div className="mt-1 relative flex items-center">
                      <input type="email" value={user?.email || ''} readOnly className="block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-slate-500 dark:text-slate-400 sm:text-sm cursor-not-allowed" />
                      {user?.isVerified && <div className="absolute right-3"><VerifiedBadge size="sm" /></div>}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                  <textarea rows={3} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors" placeholder="Tell us about yourself..." />
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Max 300 characters.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Website</label>
                    <input type="url" value={profile.website} onChange={e => setProfile({...profile, website: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Twitter Handle</label>
                    <input type="text" value={profile.twitter} onChange={e => setProfile({...profile, twitter: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors" placeholder="@username" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">GitHub Username</label>
                    <input type="text" value={profile.github} onChange={e => setProfile({...profile, github: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors" placeholder="username" />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button type="submit" disabled={savingProfile} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors">
                    {savingProfile ? 'Saving...' : <><FiCheck /> Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Change Password</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Ensure your account is using a long, random password to stay secure.</p>
                </div>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                    <input type="password" required value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                    <input type="password" required value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                    <input type="password" required value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors" />
                  </div>
                  <button type="submit" disabled={savingPassword} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors">
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="text-lg font-medium text-red-600 dark:text-red-400 border-b border-slate-200 dark:border-slate-700 pb-2">Danger Zone</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Recent security events on your account.</p>
                </div>
                
                {notifications.length > 0 ? (
                  <ul className="divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    {notifications.map((notif) => (
                      <li key={notif._id} className="p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{notif.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                          </div>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">No recent security events.</p>
                )}
              </div>

            </motion.div>
          )}

          {/* SESSIONS TAB */}
          {activeTab === 'sessions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">Active Sessions</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">These devices are currently signed in to your account.</p>
                </div>
                {sessions.length > 1 && (
                  <button 
                    onClick={handleRevokeAll}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 text-red-600 border border-red-200 dark:border-red-900/50 px-4 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                  >
                    <FiLogOut /> Sign out all other devices
                  </button>
                )}
              </div>

              {loadingSessions ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                  ))}
                </div>
              ) : sessions.length > 0 ? (
                <div className="grid gap-4">
                  {sessions.map(session => (
                    <SessionCard 
                      key={session._id} 
                      session={session} 
                      isCurrent={session.isCurrent} 
                      onRevoke={() => handleRevokeSession(session._id)} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No active sessions found.</p>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
