import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import { FiUser, FiLock, FiMonitor, FiCamera, FiCheck, FiLogOut, FiMail } from 'react-icons/fi';
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

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        bio: user.bio || '',
        website: user.website || '',
        twitter: user.twitter || '',
        github: user.github || '',
        linkedin: user.linkedin || ''
      });
    }
  }, [user]);

  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef(null);

  // Security state
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const [isProcessing2FA, setIsProcessing2FA] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [appCode, setAppCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');


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


  const handleToggleChange = () => {
    if (user?.twoFactorEnabled) {
      setShowDisableModal(true);
    } else {
      setShowMethodModal(true);
    }
  };

  const handleSetupApp2FA = async () => {
    try {
      setIsProcessing2FA(true);
      const res = await profileApi.post('/2fa/setup-app');
      setQrCodeUrl(res.data.data.qrCodeUrl);
      setAppSecret(res.data.data.secret);
      setShowAppModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate 2FA setup');
    } finally {
      setIsProcessing2FA(false);
    }
  };

  const handleVerifyApp2FA = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing2FA(true);
      await profileApi.post('/2fa/verify-app', { token: appCode });
      toast.success('Authenticator App enabled successfully');
      setShowAppModal(false);
      setAppCode('');
      loadUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setIsProcessing2FA(false);
    }
  };

  const handleEnableEmail2FA = async () => {
    try {
      setIsProcessing2FA(true);
      await profileApi.post('/2fa/enable-email');
      toast.success('Email 2FA enabled successfully');
      loadUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enable email 2FA');
    } finally {
      setIsProcessing2FA(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing2FA(true);
      await profileApi.delete('/2fa', { data: { password: disablePassword } });
      toast.success('2FA disabled successfully');
      setShowDisableModal(false);
      setDisablePassword('');
      loadUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setIsProcessing2FA(false);
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


              {/* 2FA Section */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mb-6">
                <div className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {user?.twoFactorEnabled 
                        ? `Enabled using ${user?.twoFactorMethod === 'app' ? 'Authenticator App' : 'Email OTP'}`
                        : 'Protect your account from unauthorized access.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={user?.twoFactorEnabled}
                    onClick={handleToggleChange}
                    disabled={isProcessing2FA}
                    className={`${
                      user?.twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${isProcessing2FA ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`${
                        user?.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
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

          {/* 2FA Method Selection Modal */}
          <Modal isOpen={showMethodModal} onClose={() => setShowMethodModal(false)} title="Choose 2FA Method">
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Select how you would like to receive your two-factor authentication codes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => { setShowMethodModal(false); handleSetupApp2FA(); }}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-5 flex flex-col items-center bg-white dark:bg-slate-800 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                    <FiMonitor size={24} />
                  </div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">Authenticator App</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Google Authenticator, Authy, etc.</p>
                </button>

                <button 
                  onClick={() => { setShowMethodModal(false); handleEnableEmail2FA(); }}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-5 flex flex-col items-center bg-white dark:bg-slate-800 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 mb-4">
                    <FiMail size={24} />
                  </div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">Email OTP</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Receive codes in your inbox.</p>
                </button>
              </div>
              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setShowMethodModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </Modal>

          {/* 2FA App Setup Modal */}
          <Modal isOpen={showAppModal} onClose={() => setShowAppModal(false)} title="Setup Authenticator App">
            <form onSubmit={handleVerifyApp2FA} className="space-y-6">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p className="mb-2">1. Install an authenticator app like Google Authenticator or Authy on your mobile device.</p>
                <p>2. Scan the QR code below with the app.</p>
              </div>
              
              <div className="flex justify-center bg-white p-4 rounded-xl border border-slate-200 dark:border-slate-700 mx-auto max-w-[250px]">
                {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 max-w-full" /> : <div className="w-48 h-48 animate-pulse bg-slate-100 rounded-lg max-w-full"></div>}
              </div>

              <div className="text-center text-xs text-slate-500 font-mono">
                Or enter this code manually:<br/>
                <span className="font-bold text-slate-800 dark:text-slate-200 select-all break-all">{appSecret}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">3. Enter the 6-digit code from the app</label>
                <input
                  type="text"
                  required
                  value={appCode}
                  onChange={(e) => setAppCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-center font-mono tracking-[0.5em] text-xl h-12"
                  placeholder="000000"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAppModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isProcessing2FA || appCode.length !== 6} className="btn-primary">
                  {isProcessing2FA ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </form>
          </Modal>

          {/* Disable 2FA Modal */}
          <Modal isOpen={showDisableModal} onClose={() => setShowDisableModal(false)} title="Disable Two-Factor Authentication">
            <form onSubmit={handleDisable2FA} className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Please enter your password to confirm you want to disable 2FA. This will make your account less secure.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowDisableModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isProcessing2FA || !disablePassword} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 font-medium transition-colors">
                  {isProcessing2FA ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </form>
          </Modal>

      </div>
    </div>
  );
};

export default AccountSettings;
