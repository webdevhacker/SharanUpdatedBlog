import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiMenu, FiBell, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const AdminTopbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Get simple title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('/admin/posts/new')) return 'New Post';
    if (path.includes('/admin/posts/') && path.includes('/edit')) return 'Edit Post';
    if (path.includes('/admin/posts')) return 'Posts';
    if (path.includes('/admin/users')) return 'Users';
    return 'Admin';
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
        >
          <FiMenu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
            {user?.name}
          </span>
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold overflow-hidden border border-indigo-200 dark:border-indigo-800">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          title="Sign Out"
        >
          <FiLogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
