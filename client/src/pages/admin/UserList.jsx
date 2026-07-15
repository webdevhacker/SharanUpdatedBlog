import React, { useState, useEffect } from 'react';
import { FiSearch, FiShield, FiTrash2, FiUser, FiUserCheck, FiUserX } from 'react-icons/fi';
import { adminApi } from '../../utils/api';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import VerifiedBadge from '../../components/VerifiedBadge';
import { format } from 'date-fns';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/users?page=${page}&limit=10&search=${search}&role=${roleFilter}`);
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.pages);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, roleFilter]);

  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to make this user an ${newRole}?`)) return;

    try {
      await adminApi.patch(`/users/${id}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleBanToggle = async (id, isBanned) => {
    const action = isBanned ? 'Unban' : 'Ban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await adminApi.patch(`/users/${id}/ban`, { isBanned: !isBanned });
      toast.success(`User ${isBanned ? 'unbanned' : 'banned'} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action.toLowerCase()} user`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('WARNING: This will permanently delete the user AND all their posts. Are you absolutely sure?')) return;
    
    try {
      await adminApi.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-300 dark:border-slate-600">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex justify-center items-center font-bold text-slate-500">
                {user.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
              {user.name}
              {user.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <div className="text-sm text-slate-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (user) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
        }`}>
          {user.role}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'isBanned',
      render: (user) => (
        user.isBanned 
          ? <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Banned</span>
          : <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>
      )
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      render: (user) => (
        <span className="text-sm text-slate-500">
          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (user) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleRoleChange(user._id, user.role)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-700 dark:hover:bg-indigo-900/30 rounded transition-colors"
            title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
          >
            <FiShield size={16} />
          </button>
          <button 
            onClick={() => handleBanToggle(user._id, user.isBanned)}
            className={`p-1.5 rounded transition-colors ${
              user.isBanned 
                ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40'
                : 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20 dark:hover:bg-amber-900/40'
            }`}
            title={user.isBanned ? 'Unban User' : 'Ban User'}
          >
            {user.isBanned ? <FiUserCheck size={16} /> : <FiUserX size={16} />}
          </button>
          <button 
            onClick={() => handleDelete(user._id)}
            className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 hover:bg-red-50 dark:bg-slate-700 dark:hover:bg-red-900/30 rounded transition-colors"
            title="Delete User"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-1 items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        loading={loading} 
        emptyMessage={search ? 'No users matched your search.' : 'No users found.'} 
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Prev
          </button>
          <span className="px-3 py-1 text-slate-600 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserList;
