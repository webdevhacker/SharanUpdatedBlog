import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiGlobe, FiTwitter, FiGithub, FiLinkedin, FiCalendar } from 'react-icons/fi';
import VerifiedBadge from '../components/VerifiedBadge';
import { format } from 'date-fns';

const Profile = () => {
  const { user, loading } = useAuth();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // In a real app, this might fetch from /api/profile/:username if viewing others
    // For now, it just shows the logged-in user's profile
    if (user) setProfileData(user);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-full mb-4"></div>
          <div className="w-48 h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <p className="text-slate-500 dark:text-slate-400">Profile not found. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700"
        >
          {/* Cover gradient */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600"></div>
          
          <div className="px-6 sm:px-10 pb-8">
            {/* Avatar */}
            <div className="relative flex justify-between items-end -mt-16 sm:-mt-20 mb-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-lg">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt={profileData.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-slate-400">
                    {profileData.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profileData.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                }`}>
                  {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {profileData.name}
                {profileData.isVerified && <VerifiedBadge size="lg" />}
              </h1>
              
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  <span>Member since {format(new Date(profileData.createdAt || Date.now()), 'MMMM yyyy')}</span>
                </div>
              </div>

              {profileData.bio && (
                <p className="mt-6 text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                  {profileData.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="mt-8 flex flex-wrap gap-4">
                {profileData.website && (
                  <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                    <FiGlobe className="w-5 h-5" />
                    <span>Website</span>
                  </a>
                )}
                {profileData.twitter && (
                  <a href={`https://twitter.com/${profileData.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                    <FiTwitter className="w-5 h-5" />
                    <span>Twitter</span>
                  </a>
                )}
                {profileData.github && (
                  <a href={`https://github.com/${profileData.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                    <FiGithub className="w-5 h-5" />
                    <span>GitHub</span>
                  </a>
                )}
                {profileData.linkedin && (
                  <a href={`https://linkedin.com/in/${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                    <FiLinkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;
