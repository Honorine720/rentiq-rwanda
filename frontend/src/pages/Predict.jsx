import { useState } from 'react';
import PredictionForm from '../components/PredictionForm';
import { formatRWF, formatUSD, getPriceTier } from '../services/api';
import { TrendingUp, TrendingDown, BarChart2, Info, RotateCcw, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Predict() {
  const [prediction, setPrediction] = useState(null);

  if (prediction) {
    const priceTier = getPriceTier(prediction.predicted_rent_rwf);
    const tierColors = {
      Affordable: 'bg-green-50 text-green-700 border-green-200',
      'Mid-Range': 'bg-amber-50 text-amber-700 border-amber-200',
      Premium: 'bg-purple-50 text-purple-700 border-purple-200',
    };

    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Rent Prediction Result</h1>
              <p className="text-slate-500 text-sm mt-1">
                Based on your property details in Gasabo District
              </p>
            </div>
            <button
              onClick={() => setPrediction(null)}
              className="btn-secondary text-sm gap-2"
            >
              <RotateCcw size={15} />
              New Prediction
            </button>
          </div>
        </div>

        {/* Main Price Card */}
        <div className="card p-8 mb-5">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Estimated Monthly Rent
              </p>
              <p className="text-5xl font-extrabold text-slate-900">
                {formatRWF(prediction.predicted_rent_rwf)}
              </p>
              <p className="text-xl font-semibold text-slate-500 mt-1">
                {formatUSD(prediction.predicted_rent_usd)} / month
              </p>
            </div>
            <span className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide ${tierColors[priceTier.tier]}`}>
              {priceTier.tier}
            </span>
          </div>

          {/* Confidence Range */}
          <div className="bg-slate-50 rounded-lg p-4 flex items-start gap-3">
            <Info size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-0.5">
                Confidence Range
              </p>
              <p className="text-sm font-bold text-slate-800">
                {formatRWF(prediction.confidence_range.low)} — {formatRWF(prediction.confidence_range.high)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                The actual market rent is likely to fall within this range
              </p>
            </div>
          </div>
        </div>

        {/* SHAP Explanations */}
        <div className="card p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={20} className="text-blue-600" />
            <h2 className="font-bold text-slate-900">Price Influencing Factors</h2>
            <span className="ml-auto text-xs text-slate-400 font-medium">SHAP Values</span>
          </div>
          <div className="space-y-3">
            {prediction.shap_explanations?.map((exp, idx) => {
              const isPos = exp.direction === 'positive';
              const maxImpact = Math.max(...prediction.shap_explanations.map(e => Math.abs(e.impact)));
              const barWidth = Math.round((Math.abs(exp.impact) / maxImpact) * 100);
              return (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 w-4 text-right flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-700 truncate">
                        {exp.feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                      <div className={`flex items-center gap-1 text-xs font-bold flex-shrink-0 ml-2 ${isPos ? 'text-green-600' : 'text-red-500'}`}>
                        {isPos ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {formatRWF(Math.abs(exp.impact))}
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isPos ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{ width: `${barWidth}%` }}
                      />
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
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Model</p>
              <p className="text-sm font-bold text-slate-800 truncate">{prediction.model_used}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Accuracy (R²)</p>
              <p className="text-sm font-bold text-slate-800">{(prediction.r2_score * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Prediction ID</p>
              <p className="text-xs font-mono text-slate-500 truncate">{prediction.prediction_id?.slice(0, 12)}...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Predict House Rent</h1>
        <p className="text-slate-500 text-sm mt-1">
          Fill in the property details below to get an AI-powered rent estimate for Gasabo District
        </p>
      </div>
      <PredictionForm onPredictionComplete={setPrediction} />
    </div>
  );
}
