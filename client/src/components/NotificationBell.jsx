import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBell } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { notificationApi } from '../utils/api'

const notifIcon = (type) => {
  if (type === 'login') return '🔔'
  if (type === 'password_change') return '🔑'
  if (type === 'otp_sent') return '✉️'
  if (type === 'account_verified') return '✅'
  if (type === 'security_alert') return '🛡️'
  return '🔔'
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.get('/')
      const data = res.data?.data || []
      setNotifications(data.slice(0, 10))
      setUnread(res.data?.unreadCount || data.filter((n) => !n.isRead).length)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    try {
      await notificationApi.patch('/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnread(0)
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  const handleNotificationClick = (notif) => {
    setOpen(false)
    if (notif.type === 'login') {
      navigate('/profile#sessions')
    } else if (notif.type === 'password_change') {
      navigate('/forgot-password')
    } else if (notif.type === 'security_alert') {
      navigate('/profile#security')
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
        aria-label="Notifications"
      >
        <FiBell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                  <div className="text-3xl mb-2">🔔</div>
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((notif, idx) => (
                  <motion.div
                    key={notif._id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleNotificationClick(notif)}
                    className={`px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${
                      !notif.isRead ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-lg flex-shrink-0">{notifIcon(notif.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          {notif.createdAt
                            ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                            : 'Just now'}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
