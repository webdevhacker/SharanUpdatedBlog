import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiImage, FiUploadCloud } from 'react-icons/fi';
import { adminApi, blogApi, categoryApi } from '../../utils/api';
import { toast } from 'react-hot-toast';
import RichTextEditor from '../../components/admin/RichTextEditor';

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [post, setPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    category: '',
    tags: '', // comma separated string for input
    status: 'draft'
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.get('/');
        const fetchedCategories = res.data?.data || [];
        setCategories(fetchedCategories);
        if (!isEditing && fetchedCategories.length > 0) {
          setPost(prev => ({ ...prev, category: fetchedCategories[0].name }));
        }
      } catch (err) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();

    if (isEditing) {
      const fetchPost = async () => {
        try {
          const res = await blogApi.get(`/posts/${id}`);
          const data = res.data.data;
          setPost({
            ...data,
            tags: data.tags ? data.tags.join(', ') : ''
          });
        } catch (err) {
          toast.error('Failed to load post');
          navigate('/admin/posts');
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, navigate, isEditing]);

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File too large. Maximum size is 5MB.');
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadingCover(true);
    try {
      const res = await adminApi.post('/blog/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        // Assume API returns /uploads/blog/...
        // We might need to prepend base URL if not already done, or just store the path
        const imageUrl = import.meta.env.VITE_API_URL.replace('/api', '') + res.data.data.url;
        setPost({ ...post, coverImage: imageUrl });
        toast.success('Cover image uploaded');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!post.title || !post.content) {
      return toast.error('Title and content are required');
    }

    setSaving(true);
    try {
      const postData = {
        ...post,
        tags: post.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (isEditing) {
        await blogApi.put(`/posts/${id}`, postData);
        toast.success('Post updated successfully');
      } else {
        await blogApi.post('/posts', postData);
        toast.success('Post created successfully');
      }
      navigate('/admin/posts');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/posts')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <FiX /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            <FiSave /> {saving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
              <input
                type="text"
                value={post.title}
                onChange={e => setPost({...post, title: e.target.value})}
                placeholder="Enter post title"
                className="w-full px-4 py-2 text-lg border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content</label>
              <RichTextEditor 
                content={post.content} 
                onChange={content => setPost({...post, content})} 
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
              <select
                value={post.status}
                onChange={e => setPost({...post, status: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
              <select
                value={post.category}
                onChange={e => setPost({...post, category: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {categories.length > 0 ? categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                )) : (
                  <option value={post.category}>{post.category}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tags</label>
              <input
                type="text"
                value={post.tags}
                onChange={e => setPost({...post, tags: e.target.value})}
                placeholder="react, tutorial, frontend"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-slate-500 mt-1">Comma separated</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Excerpt</label>
              <textarea
                value={post.excerpt}
                onChange={e => setPost({...post, excerpt: e.target.value})}
                rows={3}
                placeholder="Brief summary of the post..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cover Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploadingCover
                      ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-indigo-500'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingCover ? (
                      <div className="animate-spin w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full mb-2"></div>
                    ) : (
                      <FiUploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    )}
                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG or WEBP (MAX. 5MB)</p>
                  </div>
                </label>
              </div>

              {/* URL fallback (optional, but good for existing external images) */}
              <div className="mt-3 relative">
                 <FiImage className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input
                   type="url"
                   value={post.coverImage}
                   onChange={e => setPost({...post, coverImage: e.target.value})}
                   placeholder="Or enter image URL"
                   className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                 />
              </div>

              {post.coverImage && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative group">
                  <img src={post.coverImage} alt="Cover preview" className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => setPost({...post, coverImage: ''})}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    title="Remove image"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
