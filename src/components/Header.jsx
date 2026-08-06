import { useEffect, useRef, useState } from 'react'
import {
  BrandMark,
  CaretDown,
  ChartIcon,
  MoonIcon,
  SunIcon,
} from './icons'

export default function Header({
  email,
  theme,
  onToggleTheme,
  onManage,
  onStats,
  onSignOut,
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <header className="topbar">
      <div className="brand">
        <BrandMark /> DailyHabits
      </div>

      <div className="topbar-right" ref={menuRef}>
        <button
          className="icon-btn"
          onClick={onStats}
          title="Statistics"
          aria-label="Statistics"
        >
          <ChartIcon />
        </button>
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
        <button className="user-menu-btn" onClick={() => setOpen((o) => !o)}>
          {email} <CaretDown />
        </button>

        {open && (
          <div className="menu">
            <button
              className="menu-item"
              onClick={() => {
                setOpen(false)
                onManage()
              }}
            >
              Manage habits
            </button>
            <button
              className="menu-item"
              onClick={() => {
                setOpen(false)
                onStats()
              }}
            >
              Statistics
            </button>
            <div className="menu-sep" />
            <button className="menu-item" onClick={onSignOut}>
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
