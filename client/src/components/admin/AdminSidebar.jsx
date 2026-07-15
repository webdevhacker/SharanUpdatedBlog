import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiGrid, FiFileText, FiUsers, FiChevronLeft, FiChevronRight, FiTag } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AdminSidebar = ({ collapsed, onToggle }) => {
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: FiGrid },
    { name: 'Posts', path: '/admin/posts', icon: FiFileText },
    { name: 'Categories', path: '/admin/categories', icon: FiTag },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
  ];

  return (
    <div className={`flex flex-col h-full bg-slate-900 text-slate-300 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-xl text-white tracking-tight">
            TechBlog <span className="text-indigo-500">Admin</span>
          </motion.div>
        )}
        <button 
          onClick={onToggle}
          className={`p-2 rounded-lg hover:bg-slate-800 transition-colors ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
              ${isActive 
                ? 'bg-indigo-600 text-white' 
                : 'hover:bg-slate-800 hover:text-white'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? item.name : ''}
          >
            <item.icon size={20} className={collapsed ? 'min-w-[20px]' : ''} />
            {!collapsed && <span className="font-medium">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom links */}
      <div className="p-4 border-t border-slate-800">
        <NavLink
          to="/"
          className={`flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? "Back to Site" : ""}
        >
          <FiHome size={20} />
          {!collapsed && <span className="font-medium">Back to Site</span>}
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;
