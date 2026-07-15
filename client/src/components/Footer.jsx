import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiArrowRight } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email) return
    toast.success('Thanks for subscribing!')
    setEmail('')
  }

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 border-t border-gradient-to-r from-primary-500/20 to-purple-600/20">
      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-extrabold gradient-text">
                SHARAN KUMAR
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Insights for modern developers. Deep dives into technology, programming, and the future of software.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/isharankumar"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
              >
                <FiGithub size={18} />
              </a>
              <a
                href="https://twitter.com/isharankumar"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-all duration-200"
              >
                <FiTwitter size={18} />
              </a>
              <a
                href="https://linkedin.com/in/isharankumar"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-all duration-200"
              >
                <FiLinkedin size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/blog', label: 'Blog' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {[
                { href: '#', label: 'About' },
                { href: '/rss.xml', label: 'RSS Feed' },
                { href: '#', label: 'Sitemap' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-slate-400 mb-4">
              Get the latest articles delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 btn-primary !py-2.5"
              >
                Subscribe <FiArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2026 SHARAN KUMAR. Built with ❤️ for developers
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-slate-500 hover:text-primary-400 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-primary-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
