import { useState } from 'react';
import { User, KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { changePassword } from '../services/api';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Profile() {
  const { theme, auth } = useApp();
  const isDark = theme === 'dark';

  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!auth) {
    return (
      <div className="page-bg">
        <div className="max-w-lg mx-auto px-6 py-24 flex flex-col items-center text-center">
          <LogIn size={40} className="text-blue-500 mb-4" />
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Sign in to view your profile</h2>
          <Link to="/login" className="mt-4 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700">Sign In</Link>
        </div>
      </div>
    );
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.new_password !== form.confirm) {
      setError('New passwords do not match'); return;
    }
    setLoading(true);
    try {
      await changePassword({ old_password: form.old_password, new_password: form.new_password });
      setSuccess('Password changed successfully!');
      setForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setError(err.userMessage || err.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const input = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400';
  const lbl = isDark ? 'text-slate-300' : 'text-slate-700';

  return (
    <div className="page-bg">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Profile Info */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <User size={28} className="text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{auth.full_name}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                auth.role === 'admin'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {auth.role === 'admin' ? '⚡ Admin' : '👤 User'}
              </span>
            </div>
          </div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Role</p>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{auth.role}</p>
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Name</p>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{auth.full_name}</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <div className="flex items-center gap-2 mb-5">
            <KeyRound size={18} className="text-blue-500" />
            <h2 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Change Password</h2>
          </div>

          {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
              <CheckCircle size={16} /> {success}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${lbl}`}>Current Password</label>
              <div className="relative">
                <input type={showOld ? 'text' : 'password'} required value={form.old_password}
                  onChange={(e) => setForm({ ...form, old_password: e.target.value })}
                  placeholder="Your current password"
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
                />
                <button type="button" onClick={() => setShowOld(p => !p)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${lbl}`}>New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} required minLength={6} value={form.new_password}
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
                />
                <button type="button" onClick={() => setShowNew(p => !p)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${lbl}`}>Confirm New Password</label>
              <input type="password" required minLength={6} value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Repeat new password"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
              />
            </div>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-60">
              {loading ? 'Saving…' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
