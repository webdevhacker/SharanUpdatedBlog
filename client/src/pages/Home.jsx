import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiZap } from 'react-icons/fi'
import api from '../utils/api'
import BlogCard from '../components/BlogCard'
import toast from 'react-hot-toast'

const categories = [
  { name: 'Technology', emoji: '💻' },
  { name: 'Programming', emoji: '👨‍💻' },
  { name: 'Web Dev', emoji: '🌐' },
  { name: 'AI/ML', emoji: '🤖' },
  { name: 'DevOps', emoji: '⚙️' },
  { name: 'Tutorial', emoji: '📚' },
  { name: 'Career', emoji: '🚀' },
]

const containerV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemV = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/blog/posts?page=1&limit=7')
        const data = res.data?.data?.posts || res.data?.posts || []
        setPosts(data)
      } catch {
        toast.error('Failed to load posts')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const featuredPost = posts[0]
  const latestPosts = posts.slice(1, 7)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-sm font-medium mb-8">
              <FiZap size={14} /> Fresh insights for modern developers
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                TechBlog
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Deep dives into technology, programming patterns, and the tools shaping the future of software development.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/blog" className="btn-primary text-base px-8 py-3">
                Read Blog <FiArrowRight size={18} />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent" />
      </section>

      {/* Featured Post */}
      {!loading && featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Featured Post</h2>
            </div>
            <BlogCard post={featuredPost} featured />
          </motion.div>
        </section>
      )}

      {/* Latest Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex items-center gap-3 mb-8">
          <div className="w-8 h-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Latest Articles</h2>
          <Link to="/blog" className="ml-auto text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1">
            View all <FiArrowRight size={14} />
          </Link>
        </motion.div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-80 animate-pulse">
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : latestPosts.length > 0 ? (
          <motion.div variants={containerV} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <motion.div key={post._id || post.slug} variants={itemV}>
                <BlogCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500">
            <div className="text-5xl mb-4">📭</div>
            <p>No posts yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-slate-100 dark:bg-slate-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8 text-center">Explore by Topic</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <motion.div key={cat.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={`/blog?category=${encodeURIComponent(cat.name)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 font-medium text-sm hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <span>{cat.emoji}</span> {cat.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600 rounded-3xl p-10 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-pattern opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Start reading today</h2>
              <p className="text-indigo-100 mb-8 text-lg">Join thousands of developers exploring the latest in tech.</p>
              <Link to="/blog" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg">
                Browse All Articles <FiArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}