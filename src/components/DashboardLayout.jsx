import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, GraduationCap, Wallet,
  BookUser, BarChart3, Settings, X, ChevronDown,
  LogOut, User, Menu, Search, Bell,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import GraduationCapArt from './GraduationCapArt'
import schoolBuilding from '../school.webp'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/student-profiles', label: 'Student Profiles', icon: GraduationCap },
  { path: '/fee-management', label: 'Fee Management', icon: Wallet },
  { path: '/teachers', label: 'Teacher Management', icon: BookUser },
  { path: '/teacher-profiles', label: 'Teacher Profiles', icon: User },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, school } = useAuth()

  const schoolLogo = school?.logo || null
  const schoolName = school?.schoolName || 'MF School'

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setProfileOpen(false)
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="page-gradient relative min-h-screen">
      {/* Decorative blur shapes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#C4B5FD]/40 blur-[90px] dark:bg-[#7C3AED]/20" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#A5B4FC]/35 blur-[110px] dark:bg-[#3B82F6]/15" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#FBCFE8]/30 blur-[100px] dark:bg-[#EC4899]/10" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-[270px] shrink-0
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          `}
        >
          <div
            className="relative flex h-full flex-col overflow-hidden text-white shadow-[18px_0_50px_-24px_rgba(76,29,149,0.55)]"
            style={{ background: 'linear-gradient(180deg, #7C3AED 0%, #5B21B6 52%, #4C1D95 100%)' }}
          >
            {/* Glossy light overlays */}
            <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-white/25 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 top-1/3 h-60 w-60 rounded-full bg-fuchsia-300/20 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#2E1A87]/50 to-transparent" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '22px 22px',
              }}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/50 via-white/10 to-white/40" />

            {/* Logo */}
            <div className="relative flex h-[96px] items-center justify-between px-6">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-white/30 to-white/5 shadow-[0_0_26px_rgba(255,255,255,0.28)] ring-1 ring-white/40 backdrop-blur">
                  <GraduationCap className="relative h-6 w-6 text-white drop-shadow-[0_2px_6px_rgba(30,27,75,0.4)]" />
                  <span className="absolute inset-0 rounded-full bg-white/10 blur-md" />
                </div>
                <div className="leading-tight">
                  <p className="text-[15px] font-extrabold tracking-[0.16em] text-white">MF SCHOOL</p>
                  <p className="mt-0.5 text-[10px] font-semibold tracking-[0.42em] text-white/70">PORTAL</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="relative flex-1 space-y-1.5 overflow-y-auto px-4 pb-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium
                      transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-white via-white to-[#EDE9FE] text-[#5B21B6] shadow-[0_12px_26px_rgba(46,26,135,0.32)]'
                        : 'text-white/80 hover:translate-x-0.5 hover:bg-white/10 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'}
                    `}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9]" />
                    )}
                    <Icon size={19} strokeWidth={isActive ? 2.4 : 2} className={isActive ? 'text-[#7C3AED]' : ''} />
                    <span className="truncate">{item.label}</span>
                    {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_0_10px_rgba(124,58,237,0.7)]" />}
                  </Link>
                )
              })}
            </nav>

            {/* 3D graduation cap illustration */}
            <div className="relative mt-4 px-5 pb-6">
              <div className="relative mx-auto flex h-40 w-full items-end justify-center overflow-hidden rounded-[24px] bg-gradient-to-b from-white/15 to-white/5 ring-1 ring-white/20">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-300/40 blur-2xl" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-xl" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#2E1A87]/40 to-transparent" />
                <GraduationCapArt className="relative h-36 w-36 animate-float-slow drop-shadow-[0_18px_22px_rgba(30,27,75,0.35)]" />
              </div>
              <p className="mt-3 text-center text-[10px] font-semibold tracking-[0.28em] text-white/55">
                LEARN · GROW · ACHIEVE
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-[#1E1B4B]/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main column */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          {/* Top header */}
          <header className="sticky top-0 z-30">
            <div
              className="relative flex items-center justify-between gap-4 overflow-hidden border-b border-white/40 px-4 py-4 backdrop-blur-xl lg:px-8 dark:border-white/5"
              style={{ background: 'var(--bg-header)' }}
            >
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED]/25 to-transparent" />

              {/* Faded school building image */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <img
                  src={schoolBuilding}
                  alt=""
                  aria-hidden="true"
                  className="absolute -right-6 -top-12 h-44 w-[520px] max-w-[55%] object-cover opacity-[0.14] dark:opacity-[0.07]"
                  style={{
                    maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)',
                  }}
                />
              </div>

              {/* Welcome */}
              <div className="relative flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/60 text-[#5B21B6] ring-1 ring-white/70 transition-all hover:bg-white/80 lg:hidden dark:bg-white/10 dark:text-white dark:ring-white/10"
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>
                <span className="text-[26px] leading-none sm:text-[30px]" role="img" aria-label="waving hand">
                  👋
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-sm font-normal text-[var(--text-secondary)]">Welcome back,</span>
                    <h1 className="text-gradient-purple truncate text-[22px] font-extrabold leading-tight sm:text-[28px]">
                      {schoolName}!
                    </h1>
                  </div>
                  <p className="mt-1 text-[12px] font-normal text-[var(--text-secondary)] sm:text-[13px]">
                    Here&apos;s what&apos;s happening at your school today.
                  </p>
                </div>
              </div>

              {/* Header actions */}
              <div className="relative flex shrink-0 items-center gap-2.5 sm:gap-3">
                <div className="glass-pill hidden items-center gap-2 rounded-full px-4 py-2.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-[#7C3AED]/30 focus-within:shadow-[0_0_0_4px_rgba(124,58,237,0.08)] md:flex">
                  <Search size={17} className="shrink-0 text-[#7C3AED] dark:text-[#C4B5FD]" />
                  <input
                    type="text"
                    placeholder="Search anything…"
                    className="w-40 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] lg:w-48"
                  />
                </div>

                <button
                  className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/60 text-[#5B21B6] ring-1 ring-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(124,58,237,0.18)] dark:bg-white/10 dark:text-white dark:ring-white/10"
                  aria-label="Notifications"
                >
                  <Bell size={19} />
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#FB7185] to-[#EF4444] text-[10px] font-bold text-white shadow-[0_4px_10px_rgba(239,68,68,0.45)] ring-2 ring-white dark:ring-[#211B45]">
                    3
                  </span>
                </button>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((open) => !open)}
                    className="glass-pill flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(124,58,237,0.18)] sm:pr-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#4C1D95] text-white shadow-inner ring-2 ring-white/50 dark:ring-white/10">
                      {schoolLogo ? (
                        <img src={schoolLogo} alt="logo" className="h-full w-full object-cover" />
                      ) : (
                        <GraduationCap size={18} />
                      )}
                    </div>
                    <div className="hidden text-left leading-tight sm:block">
                      <p className="max-w-[120px] truncate text-[13px] font-bold text-[var(--text-primary)]">
                        {schoolName}
                      </p>
                      <p className="text-[11px] font-medium text-[var(--text-secondary)]">Administrator</p>
                    </div>
                    <ChevronDown
                      size={15}
                      className={`hidden text-[var(--text-secondary)] transition-transform duration-200 sm:block ${
                        profileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {profileOpen && (
                    <div
                      className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-[var(--border-primary)] shadow-[0_18px_40px_rgba(30,27,75,0.18)] backdrop-blur-xl"
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      <button
                        onClick={() => { setProfileOpen(false); navigate('/settings') }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
                      >
                        <Settings size={16} /> Settings
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false); logout(); navigate('/login') }}
                        className="flex w-full items-center gap-2 border-t border-[var(--border-primary)] px-4 py-3 text-sm text-[var(--danger-text)] transition-colors hover:bg-[var(--bg-hover)]"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="relative flex-1 px-4 py-5 lg:px-8 lg:py-7">
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
