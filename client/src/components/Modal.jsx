import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[101] overflow-y-auto flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700/50 pointer-events-auto my-8"
            >
              {/* Decorative top gradient bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 to-purple-600" />
            
            <div className="p-6 sm:p-8">
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-8">
                <img 
                  src="https://isharankumar.com/favicon.svg" 
                  alt="Logo" 
                  className="w-14 h-14 mx-auto mb-4 drop-shadow-lg" 
                />
                <h2 className="text-2xl font-black gradient-text">
                  {title}
                </h2>
              </div>

              {children}
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
