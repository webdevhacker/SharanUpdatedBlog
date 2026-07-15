import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { 
  FiBold, FiItalic, FiList, FiCheckSquare, 
  FiCode, FiMinus, FiLink, FiImage
} from 'react-icons/fi';
import { adminApi } from '../../utils/api';
import toast from 'react-hot-toast';

const MenuBar = ({ editor }) => {
  const fileInputRef = React.useRef(null);
  
  if (!editor) return null;

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image too large. Maximum size is 5MB.');
    }

    const toastId = toast.loading('Uploading image...');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await adminApi.post('/blog/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const imageUrl = import.meta.env.VITE_API_URL.replace('/api', '') + res.data.data.url;
        editor.chain().focus().setImage({ src: imageUrl }).run();
        toast.success('Image added', { id: toastId });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image', { id: toastId });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const NavButton = ({ active, onClick, icon: Icon, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        active 
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
      }`}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-t-lg">
      <NavButton 
        active={editor.isActive('bold')} 
        onClick={() => editor.chain().focus().toggleBold().run()} 
        icon={FiBold} title="Bold" 
      />
      <NavButton 
        active={editor.isActive('italic')} 
        onClick={() => editor.chain().focus().toggleItalic().run()} 
        icon={FiItalic} title="Italic" 
      />
      
      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 my-auto mx-1"></div>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}
      >
        H3
      </button>

      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 my-auto mx-1"></div>
      
      <NavButton 
        active={editor.isActive('bulletList')} 
        onClick={() => editor.chain().focus().toggleBulletList().run()} 
        icon={FiList} title="Bullet List" 
      />
      <NavButton 
        active={editor.isActive('orderedList')} 
        onClick={() => editor.chain().focus().toggleOrderedList().run()} 
        icon={FiCheckSquare} title="Ordered List" 
      />
      
      <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 my-auto mx-1"></div>

      <NavButton 
        active={editor.isActive('codeBlock')} 
        onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
        icon={FiCode} title="Code Block" 
      />
      <NavButton 
        active={editor.isActive('link')} 
        onClick={toggleLink} 
        icon={FiLink} title="Link" 
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        title="Upload Image"
        className="p-2 rounded-md transition-colors text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
      >
        <FiImage size={18} />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      <NavButton 
        active={false} 
        onClick={() => editor.chain().focus().setHorizontalRule().run()} 
        icon={FiMinus} title="Horizontal Rule" 
      />
    </div>
  );
};

const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: true }),
      Placeholder.configure({ placeholder: 'Write your post content here...' })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[400px] max-w-none p-4'
      }
    }
  });

  return (
    <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="bg-white dark:bg-slate-800" />
    </div>
  );
};

export default RichTextEditor;
