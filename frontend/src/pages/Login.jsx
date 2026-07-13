import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { loginUser } from '../services/api';
import KigaliBackground from '../components/KigaliBackground';

export default function Login() {
  const { theme, login } = useApp();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(form);
      login(data);
      navigate(data.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.userMessage || 'Login failed. Please try again.');
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
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-3">
            <LogIn size={24} className="text-white" />
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Sign In</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Welcome back to RentIQ Rwanda
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className={`text-center text-sm mt-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:underline font-medium">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
