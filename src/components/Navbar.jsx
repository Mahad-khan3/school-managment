import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, ChevronDown, Settings, LogOut, User, Sun, Moon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export function LandingNavbar() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <header className="sticky top-0 z-50" style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-primary)', backdropFilter: 'blur(12px)', transition: 'background 0.3s, border-color 0.3s' }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <a href="#about" className="hover:text-[var(--accent)] transition-colors duration-200">About Us</a>
          <a href="#how-it-works" className="hover:text-[var(--accent)] transition-colors duration-200">System Portal</a>
        </nav>

        <Link to="/" className="flex items-center gap-2 mx-auto md:mx-0">
          <div className="w-36 h-14">
            <img src="/logo.png" alt="SchoolCRM Logo" className="w-full h-full object-contain" />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-xl transition-colors duration-200"
            style={{ color: isDark ? '#FBBF24' : '#7C3AED' }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/login"
            className="text-[var(--text-primary)] px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-[var(--accent)]/20"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
            Login
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function Navbar({ onMenuClick }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { logout, school } = useAuth()

  const schoolLogo = school?.logo ? school.logo : null

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6"
      style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-primary)', backdropFilter: 'blur(12px)' }}>
      <button onClick={onMenuClick} className="lg:hidden" style={{ color: 'var(--text-primary)' }}>
        <Menu size={22} />
      </button>

      <div className="hidden lg:block text-sm" style={{ color: 'var(--text-secondary)' }}>
        Welcome, <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{school?.schoolName || 'Your School'}</span>
      </div>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-colors duration-200"
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
            {schoolLogo ? <img src={schoolLogo} alt="logo" className="w-full h-full object-cover" /> : <User size={16} className="text-[var(--text-primary)]" />}
          </div>
          <span className="hidden sm:block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{school?.schoolName || 'School'}</span>
          <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden z-50"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            <button
              onClick={() => { setOpen(false); navigate('/settings') }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors duration-150"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Settings size={16} /> Settings
            </button>
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--danger-text)] transition-colors duration-150"
              style={{ borderTop: '1px solid var(--border-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
