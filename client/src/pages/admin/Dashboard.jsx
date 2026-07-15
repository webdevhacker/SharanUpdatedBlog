import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiEdit3, FiCheckCircle, FiUsers, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { adminApi } from '../../utils/api';
import { toast } from 'react-hot-toast';
import StatsCard from '../../components/admin/StatsCard';
import DataTable from '../../components/admin/DataTable';
import VerifiedBadge from '../../components/VerifiedBadge';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.get('/stats');
        setStats(res.data.data);
      } catch (err) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl mt-8"></div>
      </div>
    );
  }

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
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
      header: 'Joined',
      accessor: 'createdAt',
      render: (user) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Primary Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard title="Total Posts" value={stats?.totalPosts || 0} icon={FiFileText} color="indigo" />
        <StatsCard title="Published" value={stats?.publishedPosts || 0} icon={FiCheckCircle} color="green" />
        <StatsCard title="Drafts" value={stats?.draftPosts || 0} icon={FiEdit3} color="amber" />
        <StatsCard title="Total Users" value={stats?.totalUsers || 0} icon={FiUsers} color="blue" />
      </motion.div>

      {/* Secondary Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        <StatsCard title="Verified Users" value={stats?.verifiedUsers || 0} icon={FiShield} color="green" />
        <StatsCard title="Banned Users" value={stats?.bannedUsers || 0} icon={FiAlertTriangle} color="red" />
      </motion.div>

      {/* Recent Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Users</h2>
        </div>
        <DataTable 
          columns={columns} 
          data={stats?.recentUsers || []} 
          emptyMessage="No recent users found."
        />
      </motion.div>
    </div>
  );
};

export default Dashboard;
