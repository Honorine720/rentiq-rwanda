import { useState } from 'react';
import { Link } from 'react-router-dom';
import PredictionForm from '../components/PredictionForm';
import { formatRWF, formatUSD, getPriceTier } from '../services/api';
import { TrendingUp, TrendingDown, Info, RotateCcw, Home, MapPin, Zap, Shield, Layers, LogIn, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Maps raw feature names to friendly labels, icons, and category
const FEATURE_META = {
  // Location
  distance_to_cbd_km:  { label: 'Distance from City Centre', icon: MapPin,  category: 'Location',  tip: 'Closer to the city centre = higher rent' },
  is_near_cbd:         { label: 'Near City Centre',           icon: MapPin,  category: 'Location',  tip: 'Being within 4 km of CBD adds significant value' },
  sector:              { label: 'Neighbourhood (Sector)',     icon: MapPin,  category: 'Location',  tip: 'The sector is one of the strongest price drivers' },
  urban_rural:         { label: 'Urban / Rural Setting',      icon: MapPin,  category: 'Location',  tip: 'Urban properties command much higher rents' },
  // Size
  floor_area_sqm:      { label: 'Floor Area (sqm)',           icon: Home,    category: 'Size',      tip: 'Larger homes cost more — every sqm adds value' },
  num_bedrooms:        { label: 'Number of Bedrooms',         icon: Home,    category: 'Size',      tip: 'More bedrooms = higher rent' },
  num_rooms_total:     { label: 'Total Rooms',                icon: Home,    category: 'Size',      tip: 'More rooms generally means a larger, pricier home' },
  area_per_bedroom:    { label: 'Space per Bedroom',          icon: Home,    category: 'Size',      tip: 'Spacious bedrooms indicate a higher-quality home' },
  rooms_per_bedroom:   { label: 'Rooms per Bedroom',          icon: Home,    category: 'Size',      tip: 'More living space relative to bedrooms' },
  // Utilities
  has_electricity:     { label: 'Electricity',                icon: Zap,     category: 'Utilities', tip: 'Electricity is a major price driver in Kigali' },
  has_piped_water:     { label: 'Piped Water',                icon: Zap,     category: 'Utilities', tip: 'Running water significantly increases rent' },
  has_indoor_toilet:   { label: 'Indoor Toilet',              icon: Zap,     category: 'Utilities', tip: 'Indoor sanitation adds comfort and value' },
  has_kitchen:         { label: 'Kitchen',                    icon: Zap,     category: 'Utilities', tip: 'A dedicated kitchen adds convenience' },
  has_parking:         { label: 'Parking Space',              icon: Zap,     category: 'Utilities', tip: 'Parking is a premium feature in urban areas' },
  utility_score:       { label: 'Overall Utilities Score',    icon: Zap,     category: 'Utilities', tip: 'Combined score of all utility features' },
  // Construction
  wall_material:       { label: 'Wall Material',              icon: Layers,  category: 'Build Quality', tip: 'Concrete/brick walls command higher rents' },
  floor_material:      { label: 'Floor Material',             icon: Layers,  category: 'Build Quality', tip: 'Tiled floors indicate a higher-quality home' },
  roof_material:       { label: 'Roof Material',              icon: Layers,  category: 'Build Quality', tip: 'Concrete/tile roofs add durability and value' },
  material_quality:    { label: 'Overall Build Quality',      icon: Layers,  category: 'Build Quality', tip: 'Combined score of wall, floor and roof quality' },
  house_type:          { label: 'House Type',                 icon: Home,    category: 'Build Quality', tip: 'Villas and apartments differ greatly in price' },
  compound_type:       { label: 'Compound Type',              icon: Home,    category: 'Build Quality', tip: 'Gated communities command a premium' },
  // Security
  has_fence:           { label: 'Perimeter Wall / Fence',     icon: Shield,  category: 'Security',  tip: 'A fence adds privacy and security value' },
  has_security_guard:  { label: 'Security Guard',             icon: Shield,  category: 'Security',  tip: 'On-site security is a premium feature' },
  has_lightning_rod:   { label: 'Lightning Rod',              icon: Shield,  category: 'Security',  tip: 'Indicates a well-maintained, quality property' },
  has_water_tank:      { label: 'Water Storage Tank',         icon: Shield,  category: 'Security',  tip: 'Backup water supply adds reliability' },
  has_backup_generator:{ label: 'Backup Generator',           icon: Shield,  category: 'Security',  tip: 'Power backup is a high-end feature' },
  road_access:         { label: 'Road Access',                icon: MapPin,  category: 'Location',  tip: 'Tarmac road access increases property value' },
  // Furnishing
  is_furnished:        { label: 'Fully Furnished',            icon: Home,    category: 'Furnishing', tip: 'Fully furnished homes command 30-80% higher rent' },
  has_sofa:            { label: 'Sofa / Sitting Set',         icon: Home,    category: 'Furnishing', tip: 'Sofa set included in rent' },
  has_beds_mattresses: { label: 'Beds with Mattresses',       icon: Home,    category: 'Furnishing', tip: 'Beds and mattresses provided' },
  has_wardrobe:        { label: 'Wardrobe(s)',                icon: Home,    category: 'Furnishing', tip: 'Wardrobe storage included' },
  has_dining_set:      { label: 'Dining Table & Chairs',      icon: Home,    category: 'Furnishing', tip: 'Dining set included in rent' },
  has_tv:              { label: 'Television (TV)',            icon: Zap,     category: 'Furnishing', tip: 'TV included adds significant value' },
  has_fridge:          { label: 'Refrigerator / Fridge',      icon: Zap,     category: 'Furnishing', tip: 'Fridge included is a strong price driver' },
  has_washing_machine: { label: 'Washing Machine',            icon: Zap,     category: 'Furnishing', tip: 'Washing machine is a premium appliance' },
  has_air_conditioning:{ label: 'Air Conditioning (AC)',      icon: Zap,     category: 'Furnishing', tip: 'AC is a luxury feature in Kigali' },
  has_internet_wifi:   { label: 'Internet / WiFi',            icon: Zap,     category: 'Furnishing', tip: 'WiFi included is increasingly expected' },
};

const getFeatureMeta = (feature) => {
  if (FEATURE_META[feature]) return FEATURE_META[feature];
  // Handle one-hot encoded names like "sector_Kacyiru", "house_type_villa"
  const knownPrefixes = Object.keys(FEATURE_META);
  for (const prefix of knownPrefixes) {
    if (feature.startsWith(prefix + '_')) {
      const value = feature.slice(prefix.length + 1).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const base = FEATURE_META[prefix];
      return { ...base, label: `${base.label}: ${value}` };
    }
  }
  // Fallback
  const label = feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return { label, icon: Info, category: 'Other', tip: '' };
};

const CATEGORY_COLORS = {
  Location:     { bar: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700',   icon: 'text-blue-500' },
  Size:         { bar: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700', icon: 'text-violet-500' },
  Utilities:    { bar: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700',  icon: 'text-amber-500' },
  'Build Quality': { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-500' },
  Security:     { bar: 'bg-rose-500',   badge: 'bg-rose-100 text-rose-700',    icon: 'text-rose-500' },
  Furnishing:   { bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-500' },
  Other:        { bar: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-600',  icon: 'text-slate-400' },
};

export default function Predict() {
  const { t, theme, auth } = useApp();
  const isDark = theme === 'dark';
  const [prediction, setPrediction] = useState(null);

  // Auth guard
  if (!auth) {
    return (
      <div className="page-bg">
        <div className="max-w-lg mx-auto px-6 py-24 flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
            isDark ? 'bg-slate-700' : 'bg-blue-50'
          }`}>
            <LogIn size={32} className="text-blue-500" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Sign in to predict rent
          </h2>
          <p className={`text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            You need an account to use the rent prediction tool. It's free and takes less than a minute.
          </p>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-semibold transition-colors
                bg-blue-600 text-white hover:bg-blue-700"
            >
              <LogIn size={16} /> Sign In
            </Link>
            <Link
              to="/register"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                isDark
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UserPlus size={16} /> Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Price Factors — redesigned */}
          <div className="card p-6 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={20} className="text-blue-600" />
              <h2 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>What's Driving This Price?</h2>
            </div>
            <p className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Each bar shows how much a feature <span className="font-semibold text-green-500">raises</span> or <span className="font-semibold text-red-400">lowers</span> the predicted rent compared to an average property.
            </p>

            <div className="space-y-3">
              {prediction.shap_explanations?.map((exp, idx) => {
                const meta = getFeatureMeta(exp.feature);
                const colors = CATEGORY_COLORS[meta.category] || CATEGORY_COLORS.Other;
                const Icon = meta.icon;
                const isPos = exp.direction === 'positive';
                const totalImpact = prediction.shap_explanations.reduce((s, e) => s + Math.abs(e.impact), 0);
                const pct = totalImpact > 0 ? Math.round((Math.abs(exp.impact) / totalImpact) * 100) : 0;
                const maxImpact = Math.max(...prediction.shap_explanations.map(e => Math.abs(e.impact)));
                const barWidth = Math.round((Math.abs(exp.impact) / maxImpact) * 100);

                return (
                  <div key={idx} className={`rounded-xl p-3 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      {/* Rank */}
                      <span className={`text-xs font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-500 shadow-sm'}`}>
                        {idx + 1}
                      </span>
                      {/* Icon */}
                      <Icon size={15} className={`flex-shrink-0 ${colors.icon}`} />
                      {/* Label */}
                      <span className={`text-sm font-semibold flex-1 min-w-0 truncate ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        {meta.label}
                      </span>
                      {/* Category badge */}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:block ${colors.badge}`}>
                        {meta.category}
                      </span>
                      {/* Direction + % */}
                      <div className={`flex items-center gap-1 flex-shrink-0 font-bold text-sm ${isPos ? 'text-green-500' : 'text-red-400'}`}>
                        {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {pct}%
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className={`h-2 rounded-full overflow-hidden ml-8 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isPos ? colors.bar : 'bg-red-400'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    {/* Plain-language tip */}
                    {meta.tip && (
                      <p className={`text-xs mt-1.5 ml-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isPos ? '↑' : '↓'} {meta.tip}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className={`mt-4 pt-4 border-t flex flex-wrap gap-3 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              {Object.entries(CATEGORY_COLORS).filter(([k]) => k !== 'Other').map(([cat, c]) => (
                <span key={cat} className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>{cat}</span>
              ))}
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
