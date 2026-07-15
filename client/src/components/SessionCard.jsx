import { formatDistanceToNow, format } from 'date-fns'
import { FiTrash2 } from 'react-icons/fi'

const deviceIcon = (device) => {
  if (!device) return '💻'
  const d = device.toLowerCase()
  if (d.includes('mobile') || d.includes('phone')) return '📱'
  if (d.includes('desktop')) return '🖥️'
  return '💻'
}

export default function SessionCard({ session, onRevoke, isCurrent }) {
  return (
    <div
      className={`card p-4 flex items-start gap-4 ${
        isCurrent ? 'border-indigo-300 dark:border-indigo-700/70 bg-indigo-50/50 dark:bg-indigo-950/20' : ''
      }`}
    >
      <div className="text-3xl flex-shrink-0">{deviceIcon(session.device)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            {session.browser || 'Unknown Browser'} on {session.os || 'Unknown OS'}
          </p>
          {isCurrent && (
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full">
              This device
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
          <span>📍 {session.ip || 'Unknown IP'}</span>
          <span>
            {session.city || ''}{session.city && session.country ? ', ' : ''}{session.country || 'Unknown location'}
          </span>
          <span>
            Last active:{' '}
            {session.lastActive
              ? formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })
              : 'Unknown'}
          </span>
          <span>
            Created:{' '}
            {session.createdAt
              ? format(new Date(session.createdAt), 'MMM dd, yyyy')
              : 'Unknown'}
          </span>
        </div>
      </div>
      {!isCurrent && (
        <button
          onClick={() => onRevoke(session._id)}
          className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
          title="Revoke session"
        >
          <FiTrash2 size={16} />
        </button>
      )}
    </div>
  )
}
