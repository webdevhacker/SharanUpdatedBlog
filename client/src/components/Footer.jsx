import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 border-t border-slate-800/50">
      {/* Decorative Top Gradient Line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center space-y-10">
          
          {/* Brand Identity */}
          <div className="flex flex-col items-center justify-center">
            <Link to="/" className="flex items-center gap-2 mb-4 group transition-transform duration-300 hover:scale-105">
              <span className="text-3xl">⚡</span>
              <span className="text-2xl font-extrabold gradient-text tracking-tight">
                SHARAN KUMAR
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-md text-center leading-relaxed">
              Insights for modern developers. Deep dives into technology, programming, and the future of software.
            </p>
          </div>

          {/* Core Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-8 bg-slate-800/30 backdrop-blur-sm px-8 py-3 rounded-full border border-slate-700/50 shadow-inner">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white hover:text-primary-400 transition-colors duration-200">
              Home
            </Link>
            <Link to="/blog" className="text-sm font-medium text-slate-300 hover:text-white hover:text-primary-400 transition-colors duration-200">
              Blog
            </Link>
            <a 
              href="https://isharankumar.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm font-medium text-slate-300 hover:text-white hover:text-primary-400 transition-colors duration-200"
            >
              Portfolio
            </a>
          </nav>

          {/* Bottom Bar: Copyright & Legal */}
          <div className="w-full pt-10 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
            <p className="text-sm text-slate-500 font-medium">
              © {new Date().getFullYear()} SHARAN KUMAR. Built with ❤️ for developers
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-primary-400 transition-colors duration-200">
                Privacy Policy
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  )
}
