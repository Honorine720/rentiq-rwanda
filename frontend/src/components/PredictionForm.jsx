import { useState } from 'react';
import { MapPin, Home, Hammer, Sparkles, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
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
  { id: 1, label: 'Location', icon: MapPin, emoji: '📍' },
  { id: 2, label: 'Property', icon: Home, emoji: '🏠' },
  { id: 3, label: 'Construction', icon: Hammer, emoji: '🔨' },
  { id: 4, label: 'Amenities', icon: Sparkles, emoji: '✨' },
];

const INITIAL_DATA = {
  district: '',
  sector: '',
  urban_rural: '',
  distance_to_cbd_km: '',
  is_near_cbd: false,
  house_type: '',
  num_bedrooms: 1,
  num_rooms_total: 2,
  floor_area_sqm: 30,
  wall_material: '',
  floor_material: '',
  roof_material: '',
  has_electricity: false,
  has_piped_water: false,
  has_indoor_toilet: false,
  has_kitchen: false,
  has_parking: false,
  road_access: '',
};

const STEP_FIELDS = {
  1: ['district', 'sector', 'urban_rural', 'distance_to_cbd_km'],
  2: ['house_type', 'num_bedrooms', 'num_rooms_total', 'floor_area_sqm'],
  3: ['wall_material', 'floor_material', 'roof_material'],
  4: ['has_electricity', 'has_piped_water', 'has_indoor_toilet', 'has_kitchen', 'has_parking', 'road_access'],
};

export default function PredictionForm({ onPredictionComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateStep = (step) => {
    const fields = STEP_FIELDS[step];
    const stepData = {};
    fields.forEach((f) => {
      stepData[f] = formData[f];
    });

    const result = validatePropertyData({ ...formData });
    const stepErrors = {};
    fields.forEach((field) => {
      if (result.errors[field]) {
        stepErrors[field] = result.errors[field];
      }
    });
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

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
      if (onPredictionComplete) {
        onPredictionComplete(result);
      }
    } catch (err) {
      setSubmitError(err.userMessage || 'Prediction failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldErrorStyle = 'border-red-500 border-2 bg-red-50';
  const inputBase =
    'w-full px-4 py-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white text-black font-bold focus:outline-none focus:ring-2 focus:ring-[#0095DA] transition-all';
  const labelBase = 'block font-black text-sm uppercase tracking-wide text-black mb-1';
  const checkboxBase = 'w-5 h-5 border-2 border-black accent-[#2E7D32]';

  // ── Step Progress ──────────────────────────────────────
  const ProgressBar = () => (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isDone = currentStep > step.id;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div
              className={`flex flex-col items-center gap-1 ${
                isActive ? 'scale-110' : ''
              } transition-transform`}
            >
              <div
                className={`w-12 h-12 flex items-center justify-center border-3 border-black font-black text-lg ${
                  isDone
                    ? 'bg-[#2E7D32] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : isActive
                    ? 'bg-[#F9A825] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-gray-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {isDone ? (
                  <span className="text-white text-xl font-black">✓</span>
                ) : (
                  <Icon size={20} />
                )}
              </div>
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  isActive ? 'text-black' : 'text-gray-400'
                }`}
              >
                {step.emoji} {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 h-1 mx-2 rounded-full bg-gray-300 relative overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    isDone ? 'bg-[#2E7D32] w-full' : isActive ? 'bg-[#F9A825] w-1/2' : 'w-0'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Step 1: Location ────────────────────────────────────
  const Step1 = () => (
    <div className="space-y-5">
      <h2 className="text-2xl font-black text-black border-b-2 border-black pb-2">
        📍 Location Details
      </h2>

      <div>
        <label className={labelBase} htmlFor="district">District *</label>
        <select
          id="district"
          name="district"
          value={formData.district}
          onChange={handleChange}
          className={`${inputBase} ${errors.district ? fieldErrorStyle : ''}`}
        >
          <option value="">-- Select District --</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {errors.district && (
          <p className="text-red-600 font-black text-xs mt-1 uppercase">{errors.district}</p>
        )}
      </div>

      <div>
        <label className={labelBase} htmlFor="sector">Sector *</label>
        <select
          id="sector"
          name="sector"
          value={formData.sector}
          onChange={handleChange}
          className={`${inputBase} ${errors.sector ? fieldErrorStyle : ''}`}
        >
          <option value="">-- Select Sector --</option>
          {GASABO_SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {errors.sector && (
          <p className="text-red-600 font-black text-xs mt-1 uppercase">{errors.sector}</p>
        )}
      </div>

      <div>
        <label className={labelBase} htmlFor="urban_rural">Urban / Rural *</label>
        <select
          id="urban_rural"
          name="urban_rural"
          value={formData.urban_rural}
          onChange={handleChange}
          className={`${inputBase} ${errors.urban_rural ? fieldErrorStyle : ''}`}
        >
          <option value="">-- Select --</option>
          {URBAN_RURAL.map((u) => (
            <option key={u} value={u}>{u.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
          ))}
        </select>
        {errors.urban_rural && (
          <p className="text-red-600 font-black text-xs mt-1 uppercase">{errors.urban_rural}</p>
        )}
      </div>

      <div>
        <label className={labelBase} htmlFor="distance_to_cbd_km">
          Distance to Kigali CBD (km) *
        </label>
        <input
          id="distance_to_cbd_km"
          name="distance_to_cbd_km"
          type="number"
          step="0.1"
          min="0.1"
          max="100"
          placeholder="e.g. 4.5"
          value={formData.distance_to_cbd_km}
          onChange={handleChange}
          className={`${inputBase} ${errors.distance_to_cbd_km ? fieldErrorStyle : ''}`}
        />
        {errors.distance_to_cbd_km && (
          <p className="text-red-600 font-black text-xs mt-1 uppercase">{errors.distance_to_cbd_km}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_near_cbd"
          name="is_near_cbd"
          type="checkbox"
          checked={formData.is_near_cbd}
          onChange={handleChange}
          className={checkboxBase}
        />
        <label htmlFor="is_near_cbd" className="font-black text-sm uppercase text-black">
          Near Kigali CBD 🏙️
        </label>
      </div>
    </div>
  );

  // ── Step 2: Property Details ────────────────────────────
  const Step2 = () => (
    <div className="space-y-5">
      <h2 className="text-2xl font-black text-black border-b-2 border-black pb-2">
        🏠 Property Details
      </h2>

      <div>
        <label className={labelBase} htmlFor="house_type">House Type *</label>
        <select
          id="house_type"
          name="house_type"
          value={formData.house_type}
          onChange={handleChange}
          className={`${inputBase} ${errors.house_type ? fieldErrorStyle : ''}`}
        >
          <option value="">-- Select House Type --</option>
          {HOUSE_TYPES.map((h) => (
            <option key={h} value={h}>{h.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
          ))}
        </select>
        {errors.house_type && (
          <p className="text-red-600 font-black text-xs mt-1 uppercase">{errors.house_type}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelBase} htmlFor="num_bedrooms">Bedrooms *</label>
          <input
            id="num_bedrooms"
            name="num_bedrooms"
            type="number"
            min="1"
            max="10"
            value={formData.num_bedrooms}
            onChange={handleChange}
            className={`${inputBase} ${errors.num_bedrooms ? fieldErrorStyle : ''}`}
          />
          {errors.num_bedrooms && (
            <p className="text-red-600 font-black text-xs mt-1 uppercase">{errors.num_bedrooms}</p>
          )}
        </div>

        <div>
          <label className={labelBase} htmlFor="num_rooms_total">Total Rooms *</label>
          <input
            id="num_rooms_total"
            name="num_rooms_total"
            type="number"
            min="2"
            max="20"
            value={formData.num_rooms_total}
            onChange={handleChange}
            className={`${inputBase} ${errors.num_rooms_total ? fieldErrorStyle : ''}`}
          />
          {errors.num_rooms_total && (
            <p className="text-red-600 font-black text-xs mt-1 uppercase">{errors.num_rooms_total}</p>
          )}
        </div>
      </div>

      <div>
        <label className={labelBase} htmlFor="floor_area_sqm">
          Floor Area (sqm) *
        </label>
        <input
          id="floor_area_sqm"
          name="floor_area_sqm"
          type="number"
          min="10"
          max="500"
          step="1"
          value={formData.floor_area_sqm}
          onChange={handleChange}
          className={`${inputBase} ${errors.floor_area_sqm ? fieldErrorStyle : ''}`}
        />
        {errors.floor_area_sqm && (
          <p className="text-red-600 font-black text-xs mt-1 uppercase">{errors.floor_area_sqm}</p>
        )}
      </div>
    </div>
  );

  // ── Step 3: Construction ─────────────────────────────────
  const Step3 = () => (
    <div className="space-y-5">
      <h2 className="text-2xl font-black text-black border-b-2 border-black pb-2">
        🔨 Construction Materials
      </h2>

      <div>
        <label className={labelBase} htmlFor="wall_material">Wall Material *</label>
        <select
          id="wall_material"
          name="wall_material"
          value={formData.wall_material}
          onChange={handleChange}
          className={`${inputBase} ${errors.wall_material ? fieldErrorStyle : ''}`}
        >
          <option value="">-- Select Wall Material --</option>
          {WALL_MATERIALS.map((m) => (
            <option key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
          ))}
        </select>
        {errors.wall_material && (
          <p className="text-red-600 font-black text-xs mt-1 uppercase">{errors.wall_material}</p>
        )}
      </div>

      <div>
        <label className={labelBase} htmlFor="floor_material">Floor Material *</label>
        <select
          id="floor_material"
          name="floor_material"
          value={formData.floor_material}
          onChange={handleChange}
          className={`${inputBase} ${errors.floor_material ? fieldErrorStyle : ''}`}
        >
          <option value="">-- Select Floor Material --</option>
          {FLOOR_MATERIALS.map((m) => (
            <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
          ))}
        </select>
        {errors.floor_material && (
          <p className="text-red-600 font-black text-xs mt-1 uppercase">{errors.floor_material}</p>
        )}
      </div>

      <div>
        <label className={labelBase} htmlFor="roof_material">Roof Material *</label>
        <select
          id="roof_material"
          name="roof_material"
          value={formData.roof_material}
          onChange={handleChange}
          className={`${inputBase} ${errors.roof_material ? fieldErrorStyle : ''}`}
        >
          <option value="">-- Select Roof Material --</option>
          {ROOF_MATERIALS.map((m) => (
            <option key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
          ))}
        </select>
        {errors.roof_material && (
          <p className="text-red-600 font-black text-xs mt-1 uppercase">{errors.roof_material}</p>
        )}
      </div>
    </div>
  );

  // ── Step 4: Amenities ────────────────────────────────────
  const Step4 = () => (
    <div className="space-y-5">
      <h2 className="text-2xl font-black text-black border-b-2 border-black pb-2">
        ✨ Amenities & Access
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {[
          { name: 'has_electricity', label: 'Electricity ⚡' },
          { name: 'has_piped_water', label: 'Piped Water 🚰' },
          { name: 'has_indoor_toilet', label: 'Indoor Toilet 🚽' },
          { name: 'has_kitchen', label: 'Kitchen 🍳' },
          { name: 'has_parking', label: 'Parking 🚗' },
        ].map(({ name, label }) => (
          <div key={name} className="flex items-center gap-3">
            <input
              id={name}
              name={name}
              type="checkbox"
              checked={formData[name]}
              onChange={handleChange}
              className={checkboxBase}
            />
            <label htmlFor={name} className="font-black text-sm uppercase text-black cursor-pointer">
              {label}
            </label>
          </div>
        ))}
      </div>

      <div>
        <label className={labelBase} htmlFor="road_access">Road Access *</label>
        <select
          id="road_access"
          name="road_access"
          value={formData.road_access}
          onChange={handleChange}
          className={`${inputBase} ${errors.road_access ? fieldErrorStyle : ''}`}
        >
          <option value="">-- Select Road Type --</option>
          {ROAD_ACCESS.map((r) => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
        {errors.road_access && (
          <p className="text-red-600 font-black text-xs mt-1 uppercase">{errors.road_access}</p>
        )}
      </div>
    </div>
  );

  const stepContent = {
    1: <Step1 />,
    2: <Step2 />,
    3: <Step3 />,
    4: <Step4 />,
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-[#FAF9F6] border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
      <ProgressBar />

      <div className="min-h-[400px]">{stepContent[currentStep]}</div>

      {/* Submit Error */}
      {submitError && (
        <div className="mt-4 p-3 border-2 border-red-500 bg-red-100 text-red-800 font-black text-sm uppercase">
          {submitError}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t-2 border-black">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`flex items-center gap-1 px-5 py-3 font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
            currentStep === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-black hover:bg-[#F9A825] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]'
          }`}
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1 px-5 py-3 font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-[#0095DA] text-white hover:bg-[#007bb0] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
          >
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 font-black uppercase text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-[#2E7D32] text-white hover:bg-[#1b5e20] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Predicting...
              </>
            ) : (
              <>
                <Zap size={18} />
                Predict Rent
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}