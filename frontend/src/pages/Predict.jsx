import { useState } from 'react';
import PredictionForm from '../components/PredictionForm';
import { formatRWF, formatUSD, getPriceTier } from '../services/api';
import { BarChart2, Info, RotateCcw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Predict() {
  const { t, theme } = useApp();
  const isDark = theme === 'dark';
  const [prediction, setPrediction] = useState(null);

  const tierColors = {
    Affordable: isDark ? 'bg-green-900/40 text-green-400 border-green-700' : 'bg-green-50 text-green-700 border-green-200',
    'Mid-Range': isDark ? 'bg-amber-900/40 text-amber-400 border-amber-700' : 'bg-amber-50 text-amber-700 border-amber-200',
    Premium: isDark ? 'bg-purple-900/40 text-purple-400 border-purple-700' : 'bg-purple-50 text-purple-700 border-purple-200',
  };

  if (prediction) {
    const priceTier = getPriceTier(prediction.predicted_rent_rwf);
    return (
      <div className="page-bg">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('result_title')}</h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('result_sub')}</p>
            </div>
            <button onClick={() => setPrediction(null)} className="btn-secondary text-sm gap-2">
              <RotateCcw size={15} />{t('btn_new')}
            </button>
          </div>

          {/* Main Price Card */}
          <div className="card p-8 mb-5">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-wide mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('result_monthly')}</p>
                <p className={`text-5xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatRWF(prediction.predicted_rent_rwf)}</p>
                <p className={`text-xl font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatUSD(prediction.predicted_rent_usd)} / month</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide ${tierColors[priceTier.tier]}`}>
                {priceTier.tier}
              </span>
            </div>
            <div className={`rounded-lg p-4 flex items-start gap-3 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <Info size={16} className={`mt-0.5 flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t('result_confidence')}</p>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {formatRWF(prediction.confidence_range.low)} — {formatRWF(prediction.confidence_range.high)}
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('result_confidence_note')}</p>
              </div>
            </div>
          </div>

          {/* SHAP */}
          <div className="card p-6 mb-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={20} className="text-blue-600" />
              <h2 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('result_factors')}</h2>
              <span className={`ml-auto text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>SHAP Values</span>
            </div>
            <div className="space-y-3">
              {prediction.shap_explanations?.map((exp, idx) => {
                const isPos = exp.direction === 'positive';
                const maxImpact = Math.max(...prediction.shap_explanations.map((e) => Math.abs(e.impact)));
                const barWidth = Math.round((Math.abs(exp.impact) / maxImpact) * 100);
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <span className={`text-xs font-bold w-4 text-right flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                          {exp.feature.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                        <div className={`flex items-center gap-1 text-xs font-bold flex-shrink-0 ml-2 ${isPos ? 'text-green-500' : 'text-red-500'}`}>
                          {isPos ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                          {formatRWF(Math.abs(exp.impact))}
                        </div>
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <div className={`h-full rounded-full ${isPos ? 'bg-green-400' : 'bg-red-400'}`} style={{ width: `${barWidth}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Info */}
          <div className="card p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: t('result_model'), value: prediction.model_used },
                { label: t('result_accuracy'), value: `${(prediction.r2_score * 100).toFixed(1)}%` },
                { label: t('result_id'), value: `${prediction.prediction_id?.slice(0, 12)}...` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
                  <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('predict_title')}</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('predict_sub')}</p>
        </div>
        <PredictionForm onPredictionComplete={setPrediction} />
      </div>
    </div>
  );
}
