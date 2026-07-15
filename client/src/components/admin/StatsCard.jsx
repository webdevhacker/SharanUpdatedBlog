import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  // Color maps for the icon background
  const colorMap = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  const selectedColor = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col transition-shadow hover:shadow-md"
    >
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${selectedColor}`}>
          <Icon size={24} />
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
            trend > 0 ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20' :
            trend < 0 ? 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20' :
            'text-slate-700 bg-slate-100 dark:text-slate-400 dark:bg-slate-700'
          }`}>
            {trend > 0 ? <FiTrendingUp /> : trend < 0 ? <FiTrendingDown /> : <FiMinus />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm">{title}</h3>
        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
