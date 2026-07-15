import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { FiClock, FiEye, FiCalendar } from 'react-icons/fi'
import { motion } from 'framer-motion'

const categoryColors = {
  Technology: 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300',
  Programming: 'bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300',
  'Web Dev': 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
  'AI/ML': 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300',
  DevOps: 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300',
  Tutorial: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
  Career: 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300',
  Other: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
}

export default function BlogCard({ post, featured = false }) {
  const catColor = categoryColors[post.category] || categoryColors.Other
  const authorInitials = post.author?.name
    ? post.author.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  if (featured) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group"
      >
        <Link to={`/blog/${post.slug}`} className="block">
          <div className="card overflow-hidden hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300">
            <div className="relative h-72 overflow-hidden">
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 via-purple-500 to-purple-600 flex items-center justify-center">
                  <span className="text-6xl opacity-30">📝</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${catColor}`}>
                {post.category}
              </span>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary-500 transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {post.author?.avatar ? (
                    <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {authorInitials}
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{post.author?.name || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <FiClock size={12} />
                    {post.readTime || 5} min
                  </span>
                  <span className="flex items-center gap-1">
                    <FiEye size={12} />
                    {post.views || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link to={`/blog/${post.slug}`} className="block h-full">
        <div className="card overflow-hidden h-full flex flex-col hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300">
          <div className="relative h-48 overflow-hidden flex-shrink-0">
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-500 via-purple-500 to-purple-600 flex items-center justify-center">
                <span className="text-4xl opacity-30">📝</span>
              </div>
            )}
            <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-semibold ${catColor}`}>
              {post.category}
            </span>
          </div>
          <div className="p-5 flex flex-col flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary-500 transition-colors line-clamp-2 flex-shrink-0">
              {post.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt={post.author.name} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {authorInitials}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                  {post.author?.name || 'Anonymous'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <FiCalendar size={11} />
                  {post.createdAt ? format(new Date(post.createdAt), 'MMM dd') : ''}
                </span>
                <span className="flex items-center gap-1">
                  <FiClock size={11} />
                  {post.readTime || 5}m
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
