import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiLoader, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../utils/api'
import OTPInput from '../components/OTPInput'

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' }
  if (score <= 2) return { score, label: 'Medium', color: 'bg-amber-500' }
  if (score <= 3) return { score, label: 'Strong', color: 'bg-emerald-500' }
  return { score, label: 'Very Strong', color: 'bg-emerald-600' }
}

export default function Register() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const navigate = useNavigate()

  const strength = getPasswordStrength(password)

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register', { name, email, password })
      toast.success('OTP sent to your email!')
      setStep(2)
      startCooldown()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const startCooldown = () => {
    setResendCooldown(60)
    const timer = setInterval(() => {
      setResendCooldown((v) => {
        if (v <= 1) { clearInterval(timer); return 0 }
        return v - 1
      })
    }, 1000)
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/verify-otp', { email, otp })
      toast.success('Email verified successfully!')
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    try {
      await api.post('/auth/register', { name, email, password })
      toast.success('New OTP sent!')
      startCooldown()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-md text-white">
          <div className="text-5xl mb-8">⚡</div>
          <h2 className="text-4xl font-black mb-4">Join TechBlog</h2>
          <p className="text-indigo-200 text-lg mb-12">Create your account and start exploring the best tech content from around the developer world.</p>
          <div className="space-y-4">
            {['Access to all articles', 'Personalized reading list', 'Join the community', 'Newsletter digest'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <FiCheckCircle size={14} />
                </div>
                <span className="text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">TechBlog</span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>{s}</div>
                {s < 2 && <div className={`w-8 h-0.5 ${step > s ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Create account</h1>
                  <p className="text-slate-500 dark:text-slate-400">Fill in your details to get started.</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="input-field pl-11" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-field pl-11" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field pl-11 pr-12" />
                      <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1,2,3,4].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${strength.score >= i ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">{strength.label}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="input-field pl-11" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
                    {loading ? <><FiLoader size={18} className="animate-spin" /> Sending OTP...</> : 'Continue'}
                  </button>
                </form>
                <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-indigo-500 hover:text-indigo-600 font-semibold">Sign in</Link>
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Verify your email</h1>
                  <p className="text-slate-500 dark:text-slate-400">Enter the 6-digit code sent to <strong className="text-slate-700 dark:text-slate-300">{email}</strong></p>
                </div>
                <form onSubmit={handleVerify} className="space-y-6">
                  <OTPInput length={6} value={otp} onChange={setOtp} />
                  <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full text-base py-3">
                    {loading ? <><FiLoader size={18} className="animate-spin" /> Verifying...</> : 'Verify Email'}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Didn't receive the code?{' '}
                    <button onClick={handleResend} disabled={resendCooldown > 0} className="text-indigo-500 hover:text-indigo-600 font-semibold disabled:opacity-50">
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheckCircle size={40} className="text-emerald-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Email verified!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Your account has been created successfully.</p>
                <Link to="/login" className="btn-primary">Sign In Now</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}