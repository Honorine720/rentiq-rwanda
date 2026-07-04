import { useState } from 'react';
import { MapPin, Home, Wrench, Zap, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { predictRent, validatePropertyData } from '../services/api';

const DISTRICTS = ['Gasabo'];
const GASABO_SECTORS = [
  'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana',
  'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya',
  'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga',
];
const HOUSE_TYPES = ['standalone', 'apartment', 'shared_compound', 'villa'];
const WALL_MATERIALS = ['brick', 'mud_brick', 'concrete', 'wood', 'mixed'];
const FLOOR_MATERIALS = ['cement', 'tiles', 'earth', 'wood'];
const ROOF_MATERIALS = ['iron_sheet', 'tiles', 'grass', 'concrete'];
const URBAN_RURAL = ['urban', 'peri_urban', 'rural'];
const ROAD_ACCESS = ['tarmac', 'murram', 'footpath'];

const STEPS = [
  { id: 1, label: 'Location', icon: MapPin },
  { id: 2, label: 'Property', icon: Home },
  { id: 3, label: 'Construction', icon: Wrench },
  { id: 4, label: 'Amenities', icon: Zap },
];

const STEP_FIELDS = {
  1: ['district', 'sector', 'urban_rural', 'distance_to_cbd_km'],
  2: ['house_type', 'num_bedrooms', 'num_rooms_total', 'floor_area_sqm'],
  3: ['wall_material', 'floor_material', 'roof_material'],
  4: ['road_access'],
};

const INITIAL_DATA = {
  district: '', sector: '', urban_rural: '', distance_to_cbd_km: '',
  is_near_cbd: false, house_type: '', num_bedrooms: 1, num_rooms_total: 2,
  floor_area_sqm: 30, wall_material: '', floor_material: '', roof_material: '',
  has_electricity: false, has_piped_water: false, has_indoor_toilet: false,
  has_kitchen: false, has_parking: false, road_access: '',
};

const fmt = (str) => str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function PredictionForm({ onPredictionComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validateStep = (step) => {
    const fields = STEP_FIELDS[step];
    const result = validatePropertyData({ ...formData });
    const stepErrors = {};
    fields.forEach((f) => { if (result.errors[f]) stepErrors[f] = result.errors[f]; });
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => { if (validateStep(currentStep)) setCurrentStep((p) => Math.min(p + 1, 4)); };
  const handleBack = () => { setErrors({}); setCurrentStep((p) => Math.max(p - 1, 1)); };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        ...formData,
        distance_to_cbd_km: parseFloat(formData.distance_to_cbd_km),
        num_bedrooms: parseInt(formData.num_bedrooms, 10),
        num_rooms_total: parseInt(formData.num_rooms_total, 10),
        floor_area_sqm: parseFloat(formData.floor_area_sqm),
        is_near_cbd: formData.is_near_cbd ? 1 : 0,
        has_electricity: formData.has_electricity ? 1 : 0,
        has_piped_water: formData.has_piped_water ? 1 : 0,
        has_indoor_toilet: formData.has_indoor_toilet ? 1 : 0,
        has_kitchen: formData.has_kitchen ? 1 : 0,
        has_parking: formData.has_parking ? 1 : 0,
      };
      const result = await predictRent(payload);
      if (onPredictionComplete) onPredictionComplete(result);
    } catch (err) {
      setSubmitError(err.userMessage || 'Prediction failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (field) =>
    `input-field ${errors[field] ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400' : ''}`;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Progress */}
      <div className="flex items-center mb-8">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isDone ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {isDone ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <Icon size={18} />
                  )}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors ${isDone ? 'bg-green-400' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="card p-6 md:p-8 min-h-[380px]">

        {/* Step 1: Location */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Location Details</h2>
              <p className="text-sm text-slate-500 mt-1">Select the property's location in Gasabo District</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">District</label>
                <select name="district" value={formData.district} onChange={handleChange} className={inputCls('district')}>
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
              </div>
              <div>
                <label className="label">Sector</label>
                <select name="sector" value={formData.sector} onChange={handleChange} className={inputCls('sector')}>
                  <option value="">Select sector</option>
                  {GASABO_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.sector && <p className="text-red-500 text-xs mt-1">{errors.sector}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Area Classification</label>
                <select name="urban_rural" value={formData.urban_rural} onChange={handleChange} className={inputCls('urban_rural')}>
                  <option value="">Select type</option>
                  {URBAN_RURAL.map((u) => <option key={u} value={u}>{fmt(u)}</option>)}
                </select>
                {errors.urban_rural && <p className="text-red-500 text-xs mt-1">{errors.urban_rural}</p>}
              </div>
              <div>
                <label className="label">Distance to CBD (km)</label>
                <input
                  type="number" name="distance_to_cbd_km" step="0.1" min="0.1" max="100"
                  placeholder="e.g. 4.5" value={formData.distance_to_cbd_km}
                  onChange={handleChange} className={inputCls('distance_to_cbd_km')}
                />
                {errors.distance_to_cbd_km && <p className="text-red-500 text-xs mt-1">{errors.distance_to_cbd_km}</p>}
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" name="is_near_cbd" checked={formData.is_near_cbd} onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Near Kigali CBD (within 3km)</span>
            </label>
          </div>
        )}

        {/* Step 2: Property */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Property Details</h2>
              <p className="text-sm text-slate-500 mt-1">Describe the size and type of the property</p>
            </div>
            <div>
              <label className="label">House Type</label>
              <select name="house_type" value={formData.house_type} onChange={handleChange} className={inputCls('house_type')}>
                <option value="">Select house type</option>
                {HOUSE_TYPES.map((h) => <option key={h} value={h}>{fmt(h)}</option>)}
              </select>
              {errors.house_type && <p className="text-red-500 text-xs mt-1">{errors.house_type}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Bedrooms</label>
                <input type="number" name="num_bedrooms" min="1" max="10"
                  value={formData.num_bedrooms} onChange={handleChange} className={inputCls('num_bedrooms')} />
                {errors.num_bedrooms && <p className="text-red-500 text-xs mt-1">{errors.num_bedrooms}</p>}
              </div>
              <div>
                <label className="label">Total Rooms</label>
                <input type="number" name="num_rooms_total" min="2" max="20"
                  value={formData.num_rooms_total} onChange={handleChange} className={inputCls('num_rooms_total')} />
                {errors.num_rooms_total && <p className="text-red-500 text-xs mt-1">{errors.num_rooms_total}</p>}
              </div>
              <div>
                <label className="label">Floor Area (m²)</label>
                <input type="number" name="floor_area_sqm" min="10" max="500" step="1"
                  value={formData.floor_area_sqm} onChange={handleChange} className={inputCls('floor_area_sqm')} />
                {errors.floor_area_sqm && <p className="text-red-500 text-xs mt-1">{errors.floor_area_sqm}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Construction */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Construction Materials</h2>
              <p className="text-sm text-slate-500 mt-1">Select the building materials used</p>
            </div>
            {[
              { name: 'wall_material', label: 'Wall Material', options: WALL_MATERIALS },
              { name: 'floor_material', label: 'Floor Material', options: FLOOR_MATERIALS },
              { name: 'roof_material', label: 'Roof Material', options: ROOF_MATERIALS },
            ].map(({ name, label, options }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <select name={name} value={formData[name]} onChange={handleChange} className={inputCls(name)}>
                  <option value="">Select {label.toLowerCase()}</option>
                  {options.map((o) => <option key={o} value={o}>{fmt(o)}</option>)}
                </select>
                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Amenities */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Amenities & Access</h2>
              <p className="text-sm text-slate-500 mt-1">Select available utilities and road access</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'has_electricity', label: 'Electricity' },
                { name: 'has_piped_water', label: 'Piped Water' },
                { name: 'has_indoor_toilet', label: 'Indoor Toilet' },
                { name: 'has_kitchen', label: 'Kitchen' },
                { name: 'has_parking', label: 'Parking Space' },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="checkbox" name={name} checked={formData[name]} onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="label">Road Access</label>
              <select name="road_access" value={formData.road_access} onChange={handleChange} className={inputCls('road_access')}>
                <option value="">Select road type</option>
                {ROAD_ACCESS.map((r) => <option key={r} value={r}>{fmt(r)}</option>)}
              </select>
              {errors.road_access && <p className="text-red-500 text-xs mt-1">{errors.road_access}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {submitError}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5">
        <button
          type="button" onClick={handleBack} disabled={currentStep === 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            currentStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'btn-secondary'
          }`}
        >
          <ChevronLeft size={16} /> Back
        </button>

        <span className="text-xs text-slate-400 font-medium">Step {currentStep} of 4</span>

        {currentStep < 4 ? (
          <button type="button" onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold btn-primary">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? <><Loader size={16} className="animate-spin" /> Predicting...</> : <><Zap size={16} /> Get Prediction</>}
          </button>
        )}
      </div>
    </div>
  );
}
