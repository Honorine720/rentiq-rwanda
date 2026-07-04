import { useState, useEffect } from 'react';
import { getPredictionHistory, formatRWF, formatDate, getPriceTier } from '../services/api';
import { History as HistoryIcon, MapPin, BedDouble, Maximize2, RefreshCw, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function History() {
  const { t, theme } = useApp();
  const isDark = theme === 'dark';
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setLoading(true); setError(null);
    try {
      const data = await getPredictionHistory({ limit: 50 });
      setHistory(data.predictions || []);
    } catch (err) { setError(err.userMessage || 'Failed to load history'); }
    finally { setLoading(false); }
  };

  const tierColors = {
    Affordable: isDark ? 'bg-green-900/40 text-green-400 border-green-700' : 'bg-green-50 text-green-700 border-green-200',
    'Mid-Range': isDark ? 'bg-amber-900/40 text-amber-400 border-amber-700' : 'bg-amber-50 text-amber-700 border-amber-200',
    Premium: isDark ? 'bg-purple-900/40 text-purple-400 border-purple-700' : 'bg-purple-50 text-purple-700 border-purple-200',
  };

  if (loading) return (
    <div className="page-bg flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading...</p>
    </div>
  );

  if (error) return (
    <div className="page-bg">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="card p-8 text-center">
          <p className={`font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{error}</p>
          <button onClick={loadHistory} className="btn-secondary text-sm"><RefreshCw size={15} /> {t('hist_refresh')}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-bg">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <HistoryIcon size={22} className="text-blue-600" />{t('hist_title')}
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {history.length} {t('hist_sub')}
            </p>
          </div>
          <button onClick={loadHistory} className="btn-secondary text-sm"><RefreshCw size={15} />{t('hist_refresh')}</button>
        </div>

        {history.length === 0 ? (
          <div className="card p-16 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <BarChart2 size={24} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
            </div>
            <h3 className={`font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('hist_empty_title')}</h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{t('hist_empty_sub')}</p>
            <Link to="/predict" className="btn-primary text-sm">{t('hist_make')}</Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className={`hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-semibold uppercase tracking-wide ${isDark ? 'bg-slate-700 border-slate-600 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <div className="col-span-3">{t('hist_location')}</div>
              <div className="col-span-2">{t('hist_property')}</div>
              <div className="col-span-2">{t('hist_rent')}</div>
              <div className="col-span-2">{t('hist_tier')}</div>
              <div className="col-span-3">{t('hist_date')}</div>
            </div>
            <div className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
              {history.map((pred) => {
                const tier = getPriceTier(pred.predicted_rent_rwf);
                return (
                  <div key={pred.id} className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                    <div className="md:col-span-3 flex items-center gap-2">
                      <MapPin size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                      <span className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{pred.sector}, {pred.district}</span>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                      <span className={`flex items-center gap-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}><BedDouble size={13} />{pred.num_bedrooms}</span>
                      <span className={`flex items-center gap-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}><Maximize2 size={13} />{pred.floor_area_sqm}m²</span>
                    </div>
                    <div className="md:col-span-2">
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatRWF(pred.predicted_rent_rwf)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${tierColors[tier.tier]}`}>{tier.tier}</span>
                    </div>
                    <div className="md:col-span-3">
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{formatDate(pred.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
