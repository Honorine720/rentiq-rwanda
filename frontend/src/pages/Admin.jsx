import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, BarChart2, History, Download,
  Trash2, ToggleLeft, ToggleRight, RefreshCw, TrendingUp,
  Home, AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  adminGetStats, adminGetUsers, adminToggleUser, adminDeleteUser,
  adminExportCSV, getPredictionHistory, formatRWF, formatDate, getPriceTier
} from '../services/api';

const TABS = [
  { key: 'overview', label: 'Overview', icon: BarChart2 },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'history', label: 'All Predictions', icon: History },
  { key: 'reports', label: 'Reports', icon: TrendingUp },
];

export default function Admin() {
  const { theme, auth } = useApp();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  // Guard
  if (!auth || auth.role !== 'admin') {
    return (
      <div className="page-bg">
        <div className="max-w-lg mx-auto px-6 py-24 flex flex-col items-center text-center">
          <AlertTriangle size={48} className="text-amber-500 mb-4" />
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin Access Only</h2>
          <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>You don't have permission to view this page.</p>
          <Link to="/" className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700">Go Home</Link>
        </div>
      </div>
    );
  }

  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const tabBtn = (key) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
      tab === key
        ? 'bg-blue-600 text-white'
        : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="page-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin Dashboard</h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Welcome, {auth.full_name}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl mb-6 flex-wrap ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} className={tabBtn(key)}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab isDark={isDark} card={card} />}
        {tab === 'users' && <UsersTab isDark={isDark} card={card} />}
        {tab === 'history' && <HistoryTab isDark={isDark} card={card} />}
        {tab === 'reports' && <ReportsTab isDark={isDark} card={card} />}
      </div>
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────
function OverviewTab({ isDark, card }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <p className="text-red-500 text-sm">Failed to load stats.</p>;

  const statCards = [
    { label: 'Total Predictions', value: stats.total_predictions, icon: BarChart2, color: 'text-blue-500' },
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-green-500' },
    { label: 'Active Users', value: stats.active_users, icon: Users, color: 'text-emerald-500' },
    { label: 'Predictions (24h)', value: stats.predictions_last_24h, icon: TrendingUp, color: 'text-amber-500' },
    { label: 'Avg Rent (RWF)', value: formatRWF(stats.average_rent_rwf), icon: Home, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl border p-4 ${card}`}>
            <Icon size={20} className={`mb-2 ${color}`} />
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By District */}
        <div className={`rounded-xl border p-5 ${card}`}>
          <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Predictions by District</h3>
          {Object.entries(stats.by_district || {}).length === 0
            ? <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No data yet</p>
            : Object.entries(stats.by_district).map(([d, c]) => (
              <div key={d} className="flex items-center gap-3 mb-2">
                <span className={`text-sm flex-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{d}</span>
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (c / stats.total_predictions) * 100)}%` }} />
                </div>
                <span className={`text-xs font-bold w-6 text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{c}</span>
              </div>
            ))}
        </div>

        {/* By House Type */}
        <div className={`rounded-xl border p-5 ${card}`}>
          <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Predictions by House Type</h3>
          {Object.entries(stats.by_house_type || {}).length === 0
            ? <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No data yet</p>
            : Object.entries(stats.by_house_type).map(([t, c]) => (
              <div key={t} className="flex items-center gap-3 mb-2">
                <span className={`text-sm flex-1 capitalize ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.replace('_', ' ')}</span>
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, (c / stats.total_predictions) * 100)}%` }} />
                </div>
                <span className={`text-xs font-bold w-6 text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{c}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── Users ─────────────────────────────────────────────────────────────────────
function UsersTab({ isDark, card }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adminGetUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (id) => {
    setActionId(id);
    try { const u = await adminToggleUser(id); setUsers(prev => prev.map(x => x.id === id ? { ...x, is_active: u.is_active } : x)); }
    catch (e) { alert(e.response?.data?.detail || 'Failed'); }
    finally { setActionId(null); }
  };

  const remove = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setActionId(id);
    try { await adminDeleteUser(id); setUsers(prev => prev.filter(x => x.id !== id)); }
    catch (e) { alert(e.response?.data?.detail || 'Failed'); }
    finally { setActionId(null); }
  };

  if (loading) return <Spinner />;

  return (
    <div className={`rounded-xl border overflow-hidden ${card}`}>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{users.length} Users</h3>
        <button onClick={load} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
          <RefreshCw size={15} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
        </button>
      </div>
      <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
        {users.map(u => (
          <div key={u.id} className={`flex items-center gap-4 px-5 py-3 ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {u.full_name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{u.full_name}</p>
              <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{u.email}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
              u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}>{u.role}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
              u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>{u.is_active ? 'Active' : 'Inactive'}</span>
            {u.role !== 'admin' && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggle(u.id)} disabled={actionId === u.id}
                  title={u.is_active ? 'Deactivate' : 'Activate'}
                  className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-100'}`}>
                  {u.is_active
                    ? <ToggleRight size={18} className="text-green-500" />
                    : <ToggleLeft size={18} className="text-slate-400" />}
                </button>
                <button onClick={() => remove(u.id, u.full_name)} disabled={actionId === u.id}
                  title="Delete user"
                  className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/40' : 'hover:bg-red-50'}`}>
                  <Trash2 size={15} className="text-red-500" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── History ───────────────────────────────────────────────────────────────────
function HistoryTab({ isDark, card }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getPredictionHistory({ limit: 100 }).then(d => setHistory(d.predictions || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const tierColors = {
    Affordable: isDark ? 'bg-green-900/40 text-green-400' : 'bg-green-50 text-green-700',
    'Mid-Range': isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-50 text-amber-700',
    Premium: isDark ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-50 text-purple-700',
  };

  if (loading) return <Spinner />;

  return (
    <div className={`rounded-xl border overflow-hidden ${card}`}>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{history.length} Predictions</h3>
        <button onClick={load} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
          <RefreshCw size={15} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
        </button>
      </div>
      {history.length === 0
        ? <p className={`text-sm text-center py-12 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No predictions yet.</p>
        : (
          <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
            {history.map(p => {
              const tier = getPriceTier(p.predicted_rent_rwf);
              return (
                <div key={p.id} className={`flex flex-wrap items-center gap-3 px-5 py-3 text-sm ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                  <span className={`font-semibold flex-1 min-w-0 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.sector}, {p.district}</span>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{p.num_bedrooms} bed · {p.floor_area_sqm}m²</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatRWF(p.predicted_rent_rwf)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tierColors[tier.tier]}`}>{tier.tier}</span>
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{formatDate(p.created_at)}</span>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────
function ReportsTab({ isDark, card }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    adminGetStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const blob = await adminExportCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'rentiq_predictions.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert('Export failed'); }
    finally { setDownloading(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      {/* Export */}
      <div className={`rounded-xl border p-5 ${card}`}>
        <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Export Data</h3>
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Download all prediction records as a CSV file for external analysis or model retraining.
        </p>
        <button onClick={handleExport} disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-60">
          <Download size={16} /> {downloading ? 'Downloading…' : 'Download CSV'}
        </button>
      </div>

      {/* Monthly Trend */}
      {stats?.monthly_trend?.length > 0 && (
        <div className={`rounded-xl border p-5 ${card}`}>
          <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Monthly Prediction Trend</h3>
          <div className="space-y-3">
            {stats.monthly_trend.map(({ month, count, avg_rent }) => (
              <div key={month} className="flex items-center gap-4">
                <span className={`text-xs font-mono w-16 flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{month}</span>
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (count / (Math.max(...stats.monthly_trend.map(m => m.count)) || 1)) * 100)}%` }} />
                </div>
                <span className={`text-xs font-bold w-6 text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{count}</span>
                <span className={`text-xs w-28 text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatRWF(avg_rent)} avg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {stats && (
        <div className={`rounded-xl border p-5 ${card}`}>
          <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Summary Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Predictions', value: stats.total_predictions },
              { label: 'Average Rent', value: formatRWF(stats.average_rent_rwf) },
              { label: 'Total Users', value: stats.total_users },
              { label: 'Active Users', value: stats.active_users },
              { label: 'Predictions (24h)', value: stats.predictions_last_24h },
            ].map(({ label, value }) => (
              <div key={label} className={`rounded-lg p-3 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
