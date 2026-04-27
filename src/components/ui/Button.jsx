import { forwardRef } from 'react'
import { buttonBase, buttonVariants } from './buttonVariants.js'

const extraVariants = {
  outline:
    'border border-slate-300 bg-transparent text-slate-800 hover:bg-slate-100 focus-visible:ring-slate-300/50 active:scale-[0.98]',
  ghost:
    'border border-white/20 bg-transparent text-white hover:bg-white/10 focus-visible:ring-white/30',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-400/40 active:scale-[0.98]',
}

export const Button = forwardRef(function Button(
  { children, type = 'button', variant = 'primary', className = '', ...props },
  ref,
) {
  const v =
    buttonVariants[variant] ??
    extraVariants[variant] ??
    buttonVariants.primary
  return (
    <button
      ref={ref}
      type={type}
      className={`${buttonBase} ${v} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
})
