'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, Sun, Moon, ChevronDown, LogOut } from 'lucide-react';
import { LoginModal } from '@/components/auth/login-modal';
import { useAuth } from '@/hooks/use-auth';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleDashboardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const dashboardPaths = ['/dashboard', '/admin/dashboard', '/employees/dashboard'];
    if (dashboardPaths.includes(pathname)) {
      e.preventDefault();
      setIsProfileMenuOpen(false);
      setMobileMenuOpen(false);
    }
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout, role } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDarkState = !isDarkMode;
    setIsDarkMode(nextDarkState);

    if (nextDarkState) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Submit Video', href: '#upload' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Download App', href: '#download' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-900 bg-white/85 dark:bg-black/85 backdrop-blur-md transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-2.5 transition-transform hover:scale-102">
            <img src="/synex_logo.png" alt="Synex Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Synex<span className="text-zinc-500">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isAuthenticated && (
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          )}

          {/* Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Toggle Theme"
              id="theme-toggle-btn"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-zinc-900" />}
            </button>

            {isAuthenticated && user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm group"
                  id="user-profile-menu-btn"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold overflow-hidden ring-2 ring-zinc-300 dark:ring-zinc-700 group-hover:ring-amber-500 transition-all">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name || 'User'} className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      (user.name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <span>{user.name || 'User'}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180 text-zinc-900 dark:text-white' : ''}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* Profile Card Header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold shadow-md">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name || 'User'} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          (user.name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{user.name || 'User'}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email || 'Creator Account'}</span>
                        <span className="mt-1.5 inline-flex w-fit items-center rounded-md bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                          {role}
                        </span>
                      </div>
                    </div>


                    {/* Dedicated Logout Action Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center justify-between gap-2 rounded-xl bg-red-50/80 dark:bg-red-950/30 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/70 border border-red-200/50 dark:border-red-900/30 transition-all group/btn"
                        id="user-profile-logout-btn"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="h-4 w-4 transition-transform group-hover/btn:-translate-x-0.5" />
                          <span>Log Out</span>
                        </span>
                        <span className="text-[10px] opacity-75 font-normal">End Session</span>
                      </button>
                    </div>
                  </div> 
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="rounded-full bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 shadow-md transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:shadow-lg"
                id="navbar-login-modal-btn"
              >
                Login
              </button>
            )}

            {isAuthenticated && (
              <Link
                href="/dashboard"
                onClick={handleDashboardClick}
                className="group flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 shadow-md transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:shadow-lg"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>

          {/* Mobile menu trigger & Theme toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Toggle Theme Mobile"
              id="theme-toggle-mobile-btn"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-zinc-900" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Toggle mobile menu"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black px-4 py-6 md:hidden">
            <div className="flex flex-col gap-4">
              {!isAuthenticated &&
                navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 text-base font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                  >
                    {link.name}
                  </a>
                ))}
              <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-900">
                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/dashboard"
                      onClick={(e) => {
                        handleDashboardClick(e);
                        if (!e.defaultPrevented) setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-3 text-sm font-semibold text-zinc-900 dark:text-white"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name || 'User'} className="h-7 w-7 rounded-full object-cover" />
                        ) : (
                          (user.name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span>{user.name || 'User'}</span>
                        <span className="text-xs font-normal text-zinc-500">{user.email || 'Creator'}</span>
                      </div>
                    </Link>
                    {(role === 'admin' || role === 'employee') && (
                      <Link
                        href={role === 'admin' ? '/admin/dashboard' : '/employees/dashboard'}
                        onClick={(e) => {
                          handleDashboardClick(e);
                          if (!e.defaultPrevented) setMobileMenuOpen(false);
                        }}
                        className="w-full text-center rounded-xl bg-purple-100 dark:bg-purple-950/60 p-2.5 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                      >
                        {role === 'admin' ? 'Admin Portal' : 'Staff Portal'}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center justify-center gap-2 w-full text-center rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/80 transition-colors"
                      id="mobile-profile-logout-btn"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                    className="w-full text-center rounded-full bg-zinc-900 dark:bg-white py-2.5 text-sm font-semibold text-white dark:text-zinc-900 shadow-md transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:shadow-lg"
                    id="mobile-login-modal-btn"
                  >
                    Login
                  </button>
                )}

              </div>
            </div>
          </div>
        )}
      </header>

      {/* Login Popup Component */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
