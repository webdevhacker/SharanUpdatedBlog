import React from 'react';
import { toast } from 'react-hot-toast';
import { FiAlertTriangle } from 'react-icons/fi';

export const confirmDialog = (message, onConfirm) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white dark:bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex flex-col p-5 border border-slate-200 dark:border-slate-800`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-full">
          <FiAlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1 pt-1">
          <p className="text-base font-bold text-slate-900 dark:text-white">
            Confirmation Required
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
      <div className="flex gap-3 mt-6 justify-end">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
        >
          Confirm Action
        </button>
      </div>
    </div>
  ), {
    duration: Infinity,
    position: 'top-center'
  });
};
