import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiEye, FiEyeOff, FiPlus, FiSearch } from 'react-icons/fi';
import { adminApi, blogApi } from '../../utils/api';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import { format } from 'date-fns';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await blogApi.get(`/posts?page=${page}&limit=10&search=${search}&status=${statusFilter}`);
      setPosts(res.data.data.posts);
      setTotalPages(res.data.data.pages);
    } catch (err) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await blogApi.delete(`/posts/${id}`);
      toast.success('Post deleted');
      fetchPosts();
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await blogApi.patch(`/posts/${id}/status`, { status: newStatus });
      toast.success(`Post marked as ${newStatus}`);
      fetchPosts();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    {
      header: 'Post',
      accessor: 'title',
      render: (post) => (
        <div className="flex items-center gap-4 max-w-md">
          {post.coverImage && (
            <img src={post.coverImage} alt="" className="w-16 h-10 object-cover rounded shadow-sm" />
          )}
          <div>
            <div className="font-medium text-slate-900 dark:text-white truncate">{post.title}</div>
            <div className="text-xs text-slate-500 truncate">{post.slug}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (post) => <span className="text-sm text-slate-600 dark:text-slate-400">{post.category}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (post) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          post.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
        }`}>
          {post.status.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (post) => (
        <span className="text-sm text-slate-500">
          {format(new Date(post.createdAt), 'MMM dd, yyyy')}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (post) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleToggleStatus(post._id, post.status)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-700 dark:hover:bg-indigo-900/30 rounded transition-colors"
            title={post.status === 'published' ? 'Unpublish' : 'Publish'}
          >
            {post.status === 'published' ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
          <Link 
            to={`/admin/posts/${post._id}/edit`}
            className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-900/30 rounded transition-colors"
            title="Edit"
          >
            <FiEdit2 size={16} />
          </Link>
          <button 
            onClick={() => handleDelete(post._id)}
            className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 hover:bg-red-50 dark:bg-slate-700 dark:hover:bg-red-900/30 rounded transition-colors"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-1 items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <Link 
          to="/admin/posts/new" 
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
        >
          <FiPlus /> New Post
        </Link>
      </div>

      <DataTable 
        columns={columns} 
        data={posts} 
        loading={loading} 
        emptyMessage={search ? 'No posts matched your search.' : 'No posts found.'} 
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Prev
          </button>
          <span className="px-3 py-1 text-slate-600 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList;
