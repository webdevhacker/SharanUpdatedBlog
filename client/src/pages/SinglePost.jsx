import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { FiClock, FiEye, FiArrowLeft, FiShare2, FiTwitter, FiLink } from 'react-icons/fi'
import api from '../utils/api'
import toast from 'react-hot-toast'
import VerifiedBadge from '../components/VerifiedBadge'

const categoryColors = {
  Technology: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
  Programming: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  'Web Dev': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  'AI/ML': 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  DevOps: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  Tutorial: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
}

export default function SinglePost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/blog/posts/${slug}`)
        const data = res.data?.data || res.data
        setPost(data)
        document.title = `${data.title} | TechBlog`
      } catch (err) {
        setError(err.response?.status === 404 ? 'Post not found' : 'Failed to load post')
        toast.error('Failed to load post')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
    return () => { document.title = 'TechBlog' }
  }, [slug])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />)}
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{error || 'Post not found'}</h2>
          <Link to="/blog" className="btn-primary mt-4">Back to Blog</Link>
        </div>
      </div>
    )
  }

  const catColor = categoryColors[post.category] || 'bg-slate-100 text-slate-600'
  const authorInitials = post.author?.name
    ? post.author.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Cover */}
      {post.coverImage && (
        <div className="relative h-64 md:h-96 w-full overflow-hidden">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-600 font-medium mb-8 group">
          <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}>
          {/* Category */}
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${catColor}`}>
            {post.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">{post.excerpt}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-slate-200 dark:border-slate-700 mb-8">
            <div className="flex items-center gap-2">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                  {authorInitials}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{post.author?.name || 'Anonymous'}</span>
                  {post.author?.isVerified && <VerifiedBadge size="sm" />}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Author</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 ml-auto">
              <span>{post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : ''}</span>
              <span className="flex items-center gap-1"><FiClock size={14} /> {post.readTime || 5} min read</span>
              <span className="flex items-center gap-1"><FiEye size={14} /> {post.views || 0} views</span>
            </div>
          </div>

          {/* Content */}
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-8 flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FiShare2 size={16} /> Share:
            </span>
            <button onClick={shareTwitter} className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors">
              <FiTwitter size={14} /> Twitter
            </button>
            <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              <FiLink size={14} /> Copy Link
            </button>
          </div>

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <Link to="/blog" className="btn-secondary">
              <FiArrowLeft size={16} /> Back to all articles
            </Link>
          </div>
        </motion.article>
      </div>
    </motion.div>
  )
}