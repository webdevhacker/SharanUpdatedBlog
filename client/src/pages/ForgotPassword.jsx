import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authApi } from '../utils/api';
import OTPInput from '../components/OTPInput';
import { FiMail, FiLock, FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    
    setLoading(true);
    try {
      await authApi.post('/forgot-password', { email });
      toast.success('Reset code sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Please enter the 6-digit code');
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwords.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      await authApi.post('/reset-password', {
        email,
        otp,
        newPassword: passwords.newPassword
      });
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Link to="/" className="inline-block text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
            TechBlog ⚡
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Step {step} of 3
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200 dark:border-slate-700 overflow-hidden relative">
          
          {/* Progress bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700">
            <motion.div 
              className="h-full bg-indigo-500"
              initial={{ width: '33%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSendCode}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </div>
                
                <div className="text-center">
                  <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center gap-1">
                    <FiArrowLeft /> Back to login
                  </Link>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleVerifyCode}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    We sent a 6-digit code to <strong>{email}</strong>
                  </p>
                  <OTPInput length={6} value={otp} onChange={setOtp} />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    Verify Code
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleResetPassword}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCheckCircle className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
