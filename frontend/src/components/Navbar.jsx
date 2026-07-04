import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, TrendingUp, Clock, Info, Menu, X } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/predict', label: 'Predict', icon: TrendingUp },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/about', label: 'About', icon: Info },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 font-black text-sm uppercase tracking-wide transition-all ${
      isActive
        ? 'bg-green-600 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
        : 'text-black hover:bg-[#F9A825] hover:border-2 hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-[#FAF9F6] border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-black text-2xl tracking-tight text-black hover:scale-105 transition-transform"
          >
            <span className="w-8 h-8 border-3 border-black flex items-center justify-center bg-[#0095DA] text-white text-sm font-black rounded-sm">
              R
            </span>
            <span>
              Rent<span className="text-[#F9A825]">IQ</span>{' '}
              <span className="text-[#2E7D32]">Rwanda</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClasses}>
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-[#F9A825] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2 border-t-2 border-black pt-3">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={linkClasses}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}