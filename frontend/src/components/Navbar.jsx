import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, BarChart2, History, Info, Menu, X, MapPin } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/predict', label: 'Predict Rent', icon: BarChart2 },
  { to: '/history', label: 'History', icon: History },
  { to: '/about', label: 'About', icon: Info },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <BarChart2 size={20} className="text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-slate-900 text-base">RentIQ</span>
              <span className="font-bold text-blue-600 text-base"> Rwanda</span>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <MapPin size={10} />
                Gasabo District, Kigali
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

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 flex flex-col gap-1 border-t border-slate-100">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={linkClasses}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
