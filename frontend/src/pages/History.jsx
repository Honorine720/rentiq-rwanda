import { useState, useEffect } from 'react';
import { getPredictionHistory, formatRWF, formatDate, getPriceTier } from '../services/api';
import { History as HistoryIcon, MapPin, BedDouble, Maximize2, RefreshCw, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPredictionHistory({ limit: 50 });
      setHistory(data.predictions || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const tierColors = {
    Affordable: 'bg-green-50 text-green-700 border-green-200',
    'Mid-Range': 'bg-amber-50 text-amber-700 border-amber-200',
    Premium: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500 font-medium">Loading prediction history...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="card p-8 text-center">
        <p className="text-slate-700 font-semibold mb-4">{error}</p>
        <button onClick={loadHistory} className="btn-secondary text-sm">
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HistoryIcon size={22} className="text-blue-600" />
            Prediction History
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {history.length} prediction{history.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <button onClick={loadHistory} className="btn-secondary text-sm">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {history.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <BarChart2 size={24} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-700 mb-2">No predictions yet</h3>
          <p className="text-sm text-slate-500 mb-6">Make your first prediction to see it here</p>
          <Link to="/predict" className="btn-primary text-sm">
            Make a Prediction
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <div className="col-span-3">Location</div>
            <div className="col-span-2">Property</div>
            <div className="col-span-2">Predicted Rent</div>
            <div className="col-span-2">Tier</div>
            <div className="col-span-3">Date</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {history.map((pred) => {
              const tier = getPriceTier(pred.predicted_rent_rwf);
              return (
                <div key={pred.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="md:col-span-3 flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-800">
                      {pred.sector}, {pred.district}
                    </span>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <BedDouble size={13} className="text-slate-400" />
                      {pred.num_bedrooms} bed
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 size={13} className="text-slate-400" />
                      {pred.floor_area_sqm}m²
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-bold text-slate-900">{formatRWF(pred.predicted_rent_rwf)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${tierColors[tier.tier]}`}>
                      {tier.tier}
                    </span>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs text-slate-500">{formatDate(pred.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
