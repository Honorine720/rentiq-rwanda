import { useState, useEffect } from 'react';
import { getPredictionHistory, formatRWF, formatDate, getPriceTier } from '../services/api';
import { Clock, Trash2, Download, MapPin } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [selectedDistrict]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPredictionHistory({
        limit: 50,
        district: selectedDistrict,
      });
      setHistory(data.predictions || []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-block w-16 h-16 border-4 border-black border-t-[#F9A825] rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-xl uppercase">Loading History...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-red-100 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
          <p className="text-2xl font-black text-red-800 mb-3">❌ Error</p>
          <p className="font-bold text-red-600">{error}</p>
          <button
            onClick={loadHistory}
            className="mt-4 px-6 py-3 bg-white border-2 border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-3 flex items-center justify-center gap-3">
          <Clock size={40} />
          Prediction History
        </h1>
        <p className="text-lg font-bold text-gray-600">
          Review all your past rent predictions
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <label className="font-black text-sm uppercase">Filter by District:</label>
          <select
            value={selectedDistrict || ''}
            onChange={(e) => setSelectedDistrict(e.target.value || null)}
            className="px-4 py-2 border-2 border-black font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <option value="">All Districts</option>
            <option value="Gasabo">Gasabo</option>
          </select>
        </div>
        <p className="font-bold text-gray-600">
          {history.length} prediction{history.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
          <p className="text-2xl font-black mb-2">📭 No Predictions Yet</p>
          <p className="font-bold text-gray-600 mb-4">
            Make your first prediction to see it here
          </p>
          <a
            href="/predict"
            className="inline-block px-6 py-3 bg-[#F9A825] border-2 border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Make Prediction →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((pred) => {
            const priceTier = getPriceTier(pred.predicted_rent_rwf);
            return (
              <div
                key={pred.id}
                className="bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 border-2 border-black text-xs font-black uppercase ${priceTier.bgColor} ${priceTier.textColor}`}>
                        {priceTier.tier}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-bold text-gray-600">
                        <MapPin size={14} />
                        {pred.district}, {pred.sector}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-black mb-1">
                      {formatRWF(pred.predicted_rent_rwf)}
                    </p>
                    <div className="flex gap-4 text-sm font-bold text-gray-600">
                      <span>🛏️ {pred.num_bedrooms} bed</span>
                      <span>📐 {pred.floor_area_sqm} sqm</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      {formatDate(pred.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
