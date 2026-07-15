import { Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import BlogArchive from './pages/BlogArchive'
import SinglePost from './pages/SinglePost'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import AccountSettings from './pages/AccountSettings'
import Profile from './pages/Profile'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import PostList from './pages/admin/PostList'
import PostEditor from './pages/admin/PostEditor'
import UserList from './pages/admin/UserList'
import CategoryList from './pages/admin/CategoryList'

function AdminRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4"
      >
        <div className="text-8xl font-black bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Page Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          The page you are looking for does not exist.
        </p>
        <a
          href="/"
          className="btn-primary"
        >
          Back to Home
        </a>
      </motion.div>
    </div>
  )
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public routes with Header/Footer */}
      <Route
        path="/"
        element={
          <AppLayout>
            <Home />
          </AppLayout>
        }
      />
      <Route
        path="/blog"
        element={
          <AppLayout>
            <BlogArchive />
          </AppLayout>
        }
      />
      <Route
        path="/blog/:slug"
        element={
          <AppLayout>
            <SinglePost />
          </AppLayout>
        }
      />
      <Route
        path="/login"
        element={
          <AppLayout>
            <Login />
          </AppLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AppLayout>
            <Register />
          </AppLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AppLayout>
            <ForgotPassword />
          </AppLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <AppLayout>
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          </AppLayout>
        }
      />
      <Route
        path="/me"
        element={
          <AppLayout>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </AppLayout>
        }
      />

      {/* Admin routes - no public Header/Footer */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="posts" element={<PostList />} />
        <Route path="posts/new" element={<PostEditor />} />
        <Route path="posts/:id/edit" element={<PostEditor />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="users" element={<UserList />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
