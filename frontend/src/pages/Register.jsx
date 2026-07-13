import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { registerUser, registerAdmin } from '../services/api';

export default function Register() {
  const { theme, login } = useApp();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [tab, setTab] = useState('user'); // 'user' | 'admin'
  const [form, setForm] = useState({ full_name: '', email: '', password: '', admin_secret: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = tab === 'admin' ? registerAdmin : registerUser;
      const payload = tab === 'admin'
        ? { full_name: form.full_name, email: form.email, password: form.password, admin_secret: form.admin_secret }
        : { full_name: form.full_name, email: form.email, password: form.password };
      const data = await fn(payload);
      login(data);
      navigate(data.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.userMessage || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const input = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400';
  const label = isDark ? 'text-slate-300' : 'text-slate-700';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className={`w-full max-w-md rounded-2xl border shadow-xl p-8 ${card}`}>
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-3">
            <UserPlus size={24} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Account</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Join RentIQ Rwanda
          </p>
        </div>

        {/* Tabs */}
        <div className={`flex rounded-lg p-1 mb-6 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
          {[
            { key: 'user', label: 'User', icon: UserPlus },
            { key: 'admin', label: 'Admin', icon: ShieldCheck },
          ].map(({ key, label: lbl, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-colors ${
                tab === key
                  ? 'bg-blue-600 text-white shadow'
                  : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={15} /> {lbl}
            </button>
          ))}
        </div>

        {tab === 'admin' && (
          <div className={`mb-5 px-4 py-3 rounded-lg text-sm border ${isDark ? 'bg-amber-900/30 border-amber-700 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            Admin registration requires a secret key provided by the system administrator.
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${label}`}>Full Name</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Your full name"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${label}`}>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${label}`}>Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {tab === 'admin' && (
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${label}`}>Admin Secret Key</label>
              <input
                type="password"
                required
                value={form.admin_secret}
                onChange={(e) => setForm({ ...form, admin_secret: e.target.value })}
                placeholder="Enter admin secret key"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Creating account…' : `Create ${tab === 'admin' ? 'Admin' : ''} Account`}
          </button>
        </form>

        <p className={`text-center text-sm mt-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
