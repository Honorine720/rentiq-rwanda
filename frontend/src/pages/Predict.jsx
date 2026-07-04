import { useState } from 'react';
import PredictionForm from '../components/PredictionForm';
import { formatRWF, formatUSD, getPriceTier } from '../services/api';
import { TrendingUp, MapPin, Home as HomeIcon, DollarSign, Info } from 'lucide-react';

export default function Predict() {
  const [prediction, setPrediction] = useState(null);

  const handlePrediction = (result) => {
    setPrediction(result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setPrediction(null);
  };

  if (prediction) {
    const priceTier = getPriceTier(prediction.predicted_rent_rwf);

    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            🎯 Your Rent Prediction
          </h1>
          <p className="text-lg font-bold text-gray-600">
            Here's what our AI model predicts for your property
          </p>
        </div>

        {/* Main Result Card */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
            <h2 className="text-2xl font-black">Predicted Monthly Rent</h2>
            <span className={`px-4 py-2 border-2 border-black font-black text-sm uppercase ${priceTier.bgColor} ${priceTier.textColor}`}>
              {priceTier.tier}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* RWF Price */}
            <div className="bg-[#F9A825] border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={24} className="font-black" />
                <span className="font-black text-sm uppercase">Rwanda Francs</span>
              </div>
              <p className="text-4xl font-black text-black">
                {formatRWF(prediction.predicted_rent_rwf)}
              </p>
              <p className="text-sm font-bold text-gray-800 mt-1">per month</p>
            </div>

            {/* USD Price */}
            <div className="bg-[#0095DA] border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={24} />
                <span className="font-black text-sm uppercase">US Dollars</span>
              </div>
              <p className="text-4xl font-black">
                {formatUSD(prediction.predicted_rent_usd)}
              </p>
              <p className="text-sm font-bold opacity-90 mt-1">per month</p>
            </div>
          </div>

          {/* Confidence Range */}
          <div className="bg-gray-100 border-2 border-black p-4">
            <div className="flex items-start gap-2">
              <Info size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-black text-sm uppercase mb-1">Confidence Range</p>
                <p className="font-bold text-gray-700">
                  {formatRWF(prediction.confidence_range.low)} - {formatRWF(prediction.confidence_range.high)}
                </p>
                <p className="text-xs font-semibold text-gray-600 mt-1">
                  The actual rent is likely to fall within this range
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SHAP Explanations */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-6">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <TrendingUp size={28} />
            What Influences This Price?
          </h2>
          <p className="text-sm font-bold text-gray-600 mb-6">
            Top factors that impact the rent prediction (SHAP values)
          </p>

          <div className="space-y-3">
            {prediction.shap_explanations?.map((exp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border-2 border-black bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-[#2E7D32] text-white font-black border-2 border-black text-sm">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-gray-800">{exp.feature}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black text-lg ${
                      exp.direction === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {exp.direction === 'positive' ? '↑' : '↓'}
                  </span>
                  <span className={`font-black ${exp.direction === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatRWF(Math.abs(exp.impact))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Info */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <h3 className="font-black text-lg mb-3">📊 Model Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-black uppercase text-gray-600">Model Used:</span>
              <p className="font-bold">{prediction.model_used}</p>
            </div>
            <div>
              <span className="font-black uppercase text-gray-600">Accuracy (R²):</span>
              <p className="font-bold">{(prediction.r2_score * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={resetForm}
            className="px-8 py-4 bg-[#0095DA] text-white font-black uppercase border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all"
          >
            ← New Prediction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-3">
          🏠 Predict House Rent
        </h1>
        <p className="text-lg font-bold text-gray-600">
          Fill in the details below to get an AI-powered rent estimate
        </p>
      </div>
      <PredictionForm onPredictionComplete={handlePrediction} />
    </div>
  );
}
