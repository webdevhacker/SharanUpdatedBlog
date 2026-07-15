import { FiCheckCircle } from 'react-icons/fi'

const sizes = {
  sm: 16,
  md: 20,
  lg: 24,
}

export default function VerifiedBadge({ size = 'sm' }) {
  return (
    <span
      title="Email Verified"
      className="inline-flex items-center text-blue-500 cursor-help"
      aria-label="Email Verified"
    >
      <FiCheckCircle size={sizes[size] || 16} />
    </span>
  )
}
