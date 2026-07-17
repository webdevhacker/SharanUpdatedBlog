import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiTrash2, FiTag } from 'react-icons/fi'
import { categoryApi } from '../../utils/api'
import toast from 'react-hot-toast'
import Modal from '../../components/Modal'
import { confirmDialog } from '../../utils/confirmDialog'

export default function CategoryList() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.get('/')
      setCategories(res.data?.data || [])
    } catch (err) {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) return

    setSubmitting(true)
    try {
      await categoryApi.post('/', { name: newCategory.trim() })
      toast.success('Category created')
      setNewCategory('')
      setShowAddModal(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (id) => {
    confirmDialog('Are you sure you want to delete this category? Posts with this category will be marked as Uncategorized.', async () => {
      try {
        await categoryApi.delete(`/${id}`)
        toast.success('Category deleted')
        fetchCategories()
      } catch (err) {
        toast.error('Failed to delete category')
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FiTag className="text-indigo-500" />
          Categories
        </h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No categories found. Create one to get started!</div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {categories.map((cat) => (
              <div key={cat._id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{cat.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">/{cat.slug}</p>
                </div>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete category"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <form onSubmit={handleAdd} className="p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Add New Category</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
                      placeholder="e.g. Artificial Intelligence"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                  >
                    {submitting ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
