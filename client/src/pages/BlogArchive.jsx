import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { categoryApi } from '../utils/api'
import api from '../utils/api'
import BlogCard from '../components/BlogCard'
import toast from 'react-hot-toast'

export default function BlogArchive() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([{name: 'All'}])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || 'All'

  const updateParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val && val !== 'All') p.set(key, val)
    else p.delete(key)
    if (key !== 'page') p.set('page', '1')
    setSearchParams(p)
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.get('/')
        setCategories([{name: 'All'}, ...res.data.data])
      } catch (err) {
        console.error('Failed to load categories')
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateParam('search', searchInput)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page, limit: 9 })
        if (search) params.set('search', search)
        if (category && category !== 'All') params.set('category', category)
        const res = await api.get(`/blog/posts?${params}`)
        setPosts(res.data?.data?.posts || res.data?.posts || [])
        setTotalPages(res.data?.data?.pages || 1)
      } catch {
        toast.error('Failed to load posts')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [page, search, category])

  const containerV = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }
  const itemV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">All Articles</h1>
          <p className="text-indigo-100 text-lg mb-8">Explore our collection of articles on tech, programming, and more.</p>
          <div className="relative max-w-xl mx-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl border border-transparent focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl text-base placeholder-slate-400"
            />
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => updateParam('category', cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                category === cat.name
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="card h-80 animate-pulse">
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No articles found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try a different search term or category.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${page}-${search}-${category}`}
              variants={containerV}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {posts.map((post) => (
                <motion.div key={post._id || post.slug} variants={itemV}>
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => updateParam('page', Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-all"
            >
              <FiChevronLeft size={20} />
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1
              if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                return (
                  <button
                    key={p}
                    onClick={() => updateParam('page', p)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      page === p
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                )
              }
              if (p === page - 2 || p === page + 2) {
                return <span key={p} className="text-slate-400">…</span>
              }
              return null
            })}
            <button
              onClick={() => updateParam('page', Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-all"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}