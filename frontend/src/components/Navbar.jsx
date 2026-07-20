import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart2, History, Info, Menu, X, MapPin, Sun, Moon, Globe, LogIn, UserPlus, LogOut, ShieldCheck, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const LANGS = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'fr', label: 'FR', full: 'Français' },
  { code: 'rw', label: 'RW', full: 'Kinyarwanda' },
];

export default function Navbar() {
  const { theme, toggleTheme, lang, setLang, t, auth, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: t('nav_home'), icon: LayoutDashboard },
    { to: '/predict', label: t('nav_predict'), icon: BarChart2 },
    { to: '/history', label: t('nav_history'), icon: History },
    { to: '/about', label: t('nav_about'), icon: Info },
  ];

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
      isActive
        ? 'bg-green-600 text-white'
        : isDark
        ? 'text-slate-300 hover:text-white hover:bg-slate-700'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <nav className={`sticky top-0 z-50 border-b shadow-sm transition-colors duration-200 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <BarChart2 size={20} className="text-white" />
            </div>
            <div className="leading-tight min-w-0">
              <p className={`font-bold text-sm leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                House Rent Price Prediction
              </p>
              <div className={`flex items-center gap-1 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                <MapPin size={10} />
                {t('nav_subtitle')}
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClasses}>
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Controls: Lang + Theme + Auth + Mobile */}
          <div className="flex items-center gap-2">

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen((p) => !p)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Globe size={15} />
                {LANGS.find((l) => l.code === lang)?.label}
              </button>
              {langOpen && (
                <div className={`absolute right-0 mt-1 w-36 rounded-lg border shadow-lg z-50 overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                        lang === l.code
                          ? 'bg-blue-600 text-white'
                          : isDark
                          ? 'text-slate-300 hover:bg-slate-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {l.full}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'text-yellow-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth buttons */}
            {auth ? (
              <div className="hidden md:flex items-center gap-2">
                {auth.role === 'admin' && (
                  <Link to="/admin"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-amber-500 text-white hover:bg-amber-600`}>
                    <ShieldCheck size={14} /> Admin
                  </Link>
                )}
                <Link to="/profile"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}>
                  <User size={15} /> {auth.full_name.split(' ')[0]}
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}>
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LogIn size={15} /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <UserPlus size={15} /> Sign Up
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className={`md:hidden pb-4 pt-2 flex flex-col gap-1 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={linkClasses}>
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
            <div className={`border-t mt-1 pt-2 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              {auth ? (
                <>
                  {auth.role === 'admin' && (
                    <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={linkClasses}>
                      <ShieldCheck size={16} /> Admin Dashboard
                    </NavLink>
                  )}
                  <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={linkClasses}>
                    <User size={16} /> My Profile
                  </NavLink>
                  <button
                    onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold w-full ${
                      isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setMobileOpen(false)} className={linkClasses}>
                    <LogIn size={16} /> Sign In
                  </NavLink>
                  <NavLink to="/register" onClick={() => setMobileOpen(false)} className={linkClasses}>
                    <UserPlus size={16} /> Sign Up
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
