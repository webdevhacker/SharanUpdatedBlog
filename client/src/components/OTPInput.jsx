import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function OTPInput({ length = 6, value, onChange }) {
  const inputs = useRef([])

  const valueArr = value ? value.split('') : []

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) return
    const char = val[val.length - 1]
    const newVal = valueArr.slice()
    newVal[idx] = char
    const filled = newVal.join('').slice(0, length)
    onChange(filled)
    if (idx < length - 1) {
      inputs.current[idx + 1]?.focus()
    }
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newVal = valueArr.slice()
      if (newVal[idx]) {
        newVal[idx] = ''
        onChange(newVal.join(''))
      } else if (idx > 0) {
        newVal[idx - 1] = ''
        onChange(newVal.join(''))
        inputs.current[idx - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      inputs.current[idx + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted)
    const lastIdx = Math.min(pasted.length, length - 1)
    inputs.current[lastIdx]?.focus()
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length }, (_, idx) => (
        <motion.input
          key={idx}
          ref={(el) => (inputs.current[idx] = el)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.07 }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={valueArr[idx] || ''}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-2xl font-bold bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 select-none"
        />
      ))}
    </div>
  )
}
