import type { ReactNode } from 'react'
import { NavLink } from 'react-router'

const baseClass = 'flex shrink-0 cursor-pointer items-center justify-center rounded p-2 transition-colors'
const idleClass = 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
const activeClass = 'bg-brand-50 text-brand-700'

type ButtonProps = {
  label: string
  onClick: () => void
  children: ReactNode
}

/** Header'dagi chegarasiz ikonka tugmasi (hr-ui header tugmalari). */
export function HeaderButton({ label, onClick, children }: ButtonProps) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={`${baseClass} ${idleClass}`}>
      {children}
    </button>
  )
}

type LinkProps = {
  to: string
  label: string
  children: ReactNode
  className?: string
}

/** Sahifaga o'tuvchi header tugmasi; shu sahifa ochiq bo'lsa aksent rangda turadi. */
export function HeaderLink({ to, label, children, className = '' }: LinkProps) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      title={label}
      className={({ isActive }) => `${baseClass} ${isActive ? activeClass : idleClass} ${className}`}
    >
      {children}
    </NavLink>
  )
}
