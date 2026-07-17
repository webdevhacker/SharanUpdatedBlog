import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { FiMail, FiLock, FiEye, FiEyeOff, FiLoader, FiShield } from "react-icons/fi"
import toast from "react-hot-toast"
import api from "../utils/api"
import { useAuth } from "../context/AuthContext"

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
]

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // 2FA states
  const [show2FA, setShow2FA] = useState(false)
  const [twoFaMethod, setTwoFaMethod] = useState("")
  const [tempToken, setTempToken] = useState("")
  const [twoFaCode, setTwoFaCode] = useState("")

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"
  const quote = quotes[Math.floor(Math.random() * quotes.length)]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }
    setLoading(true)
    try {
      const res = await api.post("/auth/login", { email, password })
      if (res.data.requires2FA) {
        setShow2FA(true)
        setTwoFaMethod(res.data.method)
        setTempToken(res.data.tempToken)
        toast.success(res.data.method === "email" ? "OTP sent to your email" : "Please enter your authenticator code")
        setLoading(false)
        return
      }

      const { accessToken, refreshToken, user } = res.data
      login(accessToken, refreshToken, user)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed")
      setLoading(false)
    }
  }

  const handle2FASubmit = async (e) => {
    e.preventDefault()
    if (!twoFaCode || twoFaCode.length < 6) {
      toast.error("Please enter a valid code")
      return
    }
    setLoading(true)
    try {
      const res = await api.post("/auth/verify-2fa", { tempToken, code: twoFaCode })
      const { accessToken, refreshToken, user } = res.data
      login(accessToken, refreshToken, user)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired code")
      setLoading(false)
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
          <h2 className="text-4xl font-black mb-4">Welcome back to TechBlog</h2>
          <p className="text-indigo-200 text-lg mb-12">Continue your journey through tech insights and developer wisdom.</p>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <p className="text-white/90 italic text-lg leading-relaxed mb-4">"{quote.text}"</p>
            <p className="text-indigo-300 font-medium">— {quote.author}</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        {!show2FA ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
                <span className="text-2xl">⚡</span>
                <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">TechBlog</span>
              </Link>
              <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Sign in</h1>
              <p className="text-slate-500 dark:text-slate-400">Welcome back! Please enter your details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-11"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-11 pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-indigo-500 hover:text-indigo-600 font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-base py-3"
              >
                {loading ? (
                  <>
                    <FiLoader size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-500 hover:text-indigo-600 font-semibold">
                Create account
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <FiShield size={32} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Two-Step Verification</h1>
              <p className="text-slate-500 dark:text-slate-400">
                {twoFaMethod === "email"
                  ? "We've sent a 6-digit code to your email. Enter it below to continue."
                  : "Enter the 6-digit code from your authenticator app."}
              </p>
            </div>

            <form onSubmit={handle2FASubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono h-14"
                  autoComplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                disabled={loading || twoFaCode.length !== 6}
                className="btn-primary w-full text-base py-3"
              >
                {loading ? (
                  <>
                    <FiLoader size={18} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Sign In"
                )}
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShow2FA(false)
                    setTempToken("")
                    setTwoFaCode("")
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                >
                  Back to login
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}
