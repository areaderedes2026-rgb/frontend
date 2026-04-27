import { Link } from 'react-router-dom'
import { buttonBase, buttonVariants } from './buttonVariants.js'

export function LinkButton({
  to,
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const v = buttonVariants[variant] ?? buttonVariants.primary
  return (
    <Link
      to={to}
      className={`${buttonBase} ${v} ${className}`.trim()}
      {...props}
    >
      {children}
    </Link>
  )
}
