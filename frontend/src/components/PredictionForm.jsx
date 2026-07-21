import { useState } from 'react';
import { MapPin, Home, Wrench, Zap, Sofa, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { predictRent, validatePropertyData } from '../services/api';
import { useApp } from '../context/AppContext';

const DISTRICTS = ['Gasabo'];
const GASABO_SECTORS = ['Bumbogo','Gatsata','Gikomero','Gisozi','Jabana','Jali','Kacyiru','Kimihurura','Kimironko','Kinyinya','Ndera','Nduba','Remera','Rusororo','Rutunga'];
const HOUSE_TYPES = ['standalone','apartment','shared_compound','villa'];
const COMPOUND_TYPES = ['standalone_fenced','standalone_open','gated_community','apartment_block','ghetto'];

// Single unified arrangement picker — sets both house_type + compound_type internally
// This removes the confusion of two overlapping dropdowns
const PROPERTY_ARRANGEMENTS = [
  {
    value: 'villa_gated',
    label: '🏰 Villa in Gated Estate',
    desc: 'Luxury standalone house inside a secured estate with shared gate & guard',
    house_type: 'villa',
    compound_type: 'gated_community',
  },
  {
    value: 'standalone_fenced',
    label: '🏠 Standalone House with Fence',
    desc: 'Single house on its own plot, surrounded by a perimeter wall or fence',
    house_type: 'standalone',
    compound_type: 'standalone_fenced',
  },
  {
    value: 'standalone_open',
    label: '🏡 Standalone House, No Fence',
    desc: 'Single house on its own plot, open — no perimeter wall',
    house_type: 'standalone',
    compound_type: 'standalone_open',
  },
  {
    value: 'apartment',
    label: '🏢 Apartment / Flat',
    desc: 'Unit inside a multi-storey building shared with other tenants',
    house_type: 'apartment',
    compound_type: 'apartment_block',
  },
  {
    value: 'shared_compound',
    label: '🏘️ Shared Compound (Multiple Houses)',
    desc: 'Several separate houses sharing one plot/yard — common in peri-urban areas',
    house_type: 'shared_compound',
    compound_type: 'standalone_open',
  },
  {
    value: 'ghetto',
    label: '🏚️ Ghetto / Ibikingi (Cramped Units)',
    desc: 'Many small rooms/units packed on one plot, shared facilities — lowest cost',
    house_type: 'shared_compound',
    compound_type: 'ghetto',
  },
];
const WALL_MATERIALS = ['brick','mud_brick','concrete','wood','mixed'];
const FLOOR_MATERIALS = ['cement','tiles','earth','wood'];
const ROOF_MATERIALS = ['iron_sheet','tiles','grass','concrete'];
const URBAN_RURAL = ['urban','peri_urban','rural'];
const ROAD_ACCESS = ['tarmac','murram','footpath'];

// Location zones — client-friendly labels that map to distance_to_cbd_km + is_near_cbd
const LOCATION_ZONES = [
  { label: 'Very Close to City Centre (0–2 km)',   km: 1.0,  near: 1, hint: 'e.g. Kacyiru, Kimihurura' },
  { label: 'Close to City Centre (2–5 km)',         km: 3.5,  near: 1, hint: 'e.g. Remera, Gisozi' },
  { label: 'Moderate Distance (5–10 km)',           km: 7.5,  near: 0, hint: 'e.g. Kimironko, Kinyinya' },
  { label: 'Far from City Centre (10–18 km)',       km: 13.0, near: 0, hint: 'e.g. Ndera, Jabana, Bumbogo' },
  { label: 'Very Far / Rural Area (18+ km)',        km: 22.0, near: 0, hint: 'e.g. Rutunga, Nduba, Rusororo' },
];

const STEP_FIELDS = { 1: ['district','sector','urban_rural','location_zone'], 2: ['property_arrangement','num_bedrooms','num_rooms_total','floor_area_sqm'], 3: ['wall_material','floor_material','roof_material'], 4: ['road_access'], 5: [] };
const INITIAL_DATA = { district:'',sector:'',urban_rural:'',location_zone:'',distance_to_cbd_km:5.0,is_near_cbd:0,property_arrangement:'',house_type:'',compound_type:'',num_bedrooms:1,num_rooms_total:1,floor_area_sqm:30,wall_material:'',floor_material:'',roof_material:'',has_electricity:false,has_piped_water:false,has_indoor_toilet:false,has_kitchen:false,has_parking:false,has_fence:false,has_lightning_rod:false,has_security_guard:false,has_water_tank:false,has_backup_generator:false,road_access:'',is_furnished:false,has_sofa:false,has_beds_mattresses:false,has_wardrobe:false,has_dining_set:false,has_tv:false,has_fridge:false,has_washing_machine:false,has_air_conditioning:false,has_internet_wifi:false,rental_type:'monthly',num_days:30 };
const fmt = (s) => s.replace(/_/g,' ').replace(/\b\w/g,(c)=>c.toUpperCase());

export default function PredictionForm({ onPredictionComplete }) {
  const { t, theme } = useApp();
  const isDark = theme === 'dark';
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const steps = [
    { id: 1, label: t('step_location'), icon: MapPin },
    { id: 2, label: t('step_property'), icon: Home },
    { id: 3, label: t('step_construction'), icon: Wrench },
    { id: 4, label: t('step_amenities'), icon: Zap },
    { id: 5, label: 'Furnishing', icon: Sofa },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'location_zone') {
      const zone = LOCATION_ZONES.find((z) => z.label === value);
      setFormData((p) => ({
        ...p,
        location_zone: value,
        distance_to_cbd_km: zone ? zone.km : 5.0,
        is_near_cbd: zone ? zone.near : 0,
      }));
    } else if (name === 'property_arrangement') {
      const arr = PROPERTY_ARRANGEMENTS.find((a) => a.value === value);
      setFormData((p) => ({
        ...p,
        property_arrangement: value,
        house_type: arr ? arr.house_type : '',
        compound_type: arr ? arr.compound_type : '',
      }));
    } else if (name === 'rental_type') {
      setFormData((p) => ({
        ...p,
        rental_type: value,
        num_days: value === 'monthly' ? 30 : value === 'weekly' ? 7 : 1,
      }));
    } else {
      setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    }
    if (errors[name]) setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
  };

  const validateStep = (step) => {
    const result = validatePropertyData({ ...formData });
    const stepErrors = {};
    STEP_FIELDS[step].forEach((f) => { if (result.errors[f]) stepErrors[f] = result.errors[f]; });
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => { if (validateStep(currentStep)) setCurrentStep((p) => Math.min(p + 1, 5)); };
  const handleBack = () => { setErrors({}); setCurrentStep((p) => Math.max(p - 1, 1)); };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true); setSubmitError('');
    try {
      const payload = {
        ...formData,
        district: formData.district || 'Gasabo',
        distance_to_cbd_km: formData.distance_to_cbd_km || 5.0,
        num_bedrooms: parseInt(formData.num_bedrooms, 10) || 1,
        num_rooms_total: Math.max(parseInt(formData.num_rooms_total, 10) || 2, parseInt(formData.num_bedrooms, 10) || 1),
        floor_area_sqm: parseFloat(formData.floor_area_sqm) || 30.0,
        is_near_cbd: formData.is_near_cbd,
        has_electricity: formData.has_electricity ? 1 : 0,
        has_piped_water: formData.has_piped_water ? 1 : 0,
        has_indoor_toilet: formData.has_indoor_toilet ? 1 : 0,
        has_kitchen: formData.has_kitchen ? 1 : 0,
        has_parking: formData.has_parking ? 1 : 0,
        has_fence: formData.has_fence ? 1 : 0,
        has_lightning_rod: formData.has_lightning_rod ? 1 : 0,
        has_security_guard: formData.has_security_guard ? 1 : 0,
        has_water_tank: formData.has_water_tank ? 1 : 0,
        has_backup_generator: formData.has_backup_generator ? 1 : 0,
        compound_type: formData.compound_type || 'standalone_open',
        house_type: formData.house_type || 'standalone',
        is_furnished: formData.is_furnished ? 1 : 0,
        has_sofa: formData.has_sofa ? 1 : 0,
        has_beds_mattresses: formData.has_beds_mattresses ? 1 : 0,
        has_wardrobe: formData.has_wardrobe ? 1 : 0,
        has_dining_set: formData.has_dining_set ? 1 : 0,
        has_tv: formData.has_tv ? 1 : 0,
        has_fridge: formData.has_fridge ? 1 : 0,
        has_washing_machine: formData.has_washing_machine ? 1 : 0,
        has_air_conditioning: formData.has_air_conditioning ? 1 : 0,
        has_internet_wifi: formData.has_internet_wifi ? 1 : 0,
        rental_type: formData.rental_type || 'monthly',
        num_days: parseInt(formData.num_days, 10) || 30,
      };
      // Remove UI-only fields before sending to API
      delete payload.location_zone;
      delete payload.property_arrangement;
      const result = await predictRent(payload);
      if (onPredictionComplete) onPredictionComplete(result);
    } catch (err) {
      setSubmitError(err.userMessage || 'Prediction failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  const inputCls = (field) => `input-field ${errors[field] ? 'border-red-400 bg-red-50 dark:bg-red-900/20 focus:ring-red-400 focus:border-red-400' : ''}`;
  const checkCls = 'w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600';

  const SelectField = ({ name, labelKey, options }) => (
    <div>
      <label className="label">{t(labelKey)}</label>
      <select name={name} value={formData[name]} onChange={handleChange} className={inputCls(name)}>
        <option value="">{t('f_select')} {t(labelKey).toLowerCase()}</option>
        {options.map((o) => <option key={o} value={o}>{fmt(o)}</option>)}
      </select>
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Progress */}
      <div className="flex items-center mb-8">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400'}`}>
                  {isDone ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <Icon size={18} />}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${isActive ? 'text-blue-600' : isDone ? 'text-green-600' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>{step.label}</span>
              </div>
              {idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${isDone ? 'bg-green-400' : isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div className="card p-6 md:p-8 min-h-[380px]">

        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('loc_title')}</h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('loc_sub')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectField name="district" labelKey="f_district" options={DISTRICTS} />
              <SelectField name="sector" labelKey="f_sector" options={GASABO_SECTORS} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectField name="urban_rural" labelKey="f_area_class" options={URBAN_RURAL} />
              <div>
                <label className="label">Location / Distance from City Centre</label>
                <select name="location_zone" value={formData.location_zone} onChange={handleChange} className={inputCls('location_zone')}>
                  <option value="">-- Select location zone --</option>
                  {LOCATION_ZONES.map((z) => (
                    <option key={z.label} value={z.label}>{z.label}</option>
                  ))}
                </select>
                {formData.location_zone && (
                  <p className="text-xs mt-1 text-blue-600 dark:text-blue-400 font-medium">
                    📍 {LOCATION_ZONES.find(z => z.label === formData.location_zone)?.hint}
                  </p>
                )}
                {errors.location_zone && <p className="text-red-500 text-xs mt-1">{errors.location_zone}</p>}
              </div>
            </div>
            {formData.location_zone && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                formData.is_near_cbd
                  ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                  : 'bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
              }`}>
                <span>{formData.is_near_cbd ? '✅' : '📍'}</span>
                <span>{formData.is_near_cbd ? 'Near city centre — higher rent area' : 'Away from city centre — moderate/lower rent area'}</span>
              </div>
            )}

            {/* Rental Type */}
            <div>
              <label className="label">📅 How long do you need the house?</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'monthly', label: '🏠 Monthly Rental', desc: 'Standard long-term rental — pay per month' },
                  { value: 'weekly',  label: '🗓️ Weekly / Short-Term Stay', desc: 'Stay for 1–4 weeks — business trips, relocation, training' },
                  { value: 'daily',   label: '🌙 Daily / Temporary Stay', desc: 'Stay for 1–6 days — transit, events, short visits' },
                ].map((opt) => (
                  <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.rental_type === opt.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                      : isDark ? 'border-slate-700 hover:border-slate-500 hover:bg-slate-700/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}>
                    <input type="radio" name="rental_type" value={opt.value}
                      checked={formData.rental_type === opt.value}
                      onChange={handleChange}
                      className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{opt.label}</p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Days / Weeks picker */}
            {formData.rental_type !== 'monthly' && (
              <div>
                <label className="label">
                  {formData.rental_type === 'daily' ? 'How many days? (1–6)' : 'How many weeks? (1–4)'}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(formData.rental_type === 'daily' ? [1,2,3,4,5,6] : [7,14,21,28]).map((d) => (
                    <button key={d} type="button"
                      onClick={() => setFormData(p => ({ ...p, num_days: d }))}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                        formData.num_days === d
                          ? 'bg-blue-600 text-white border-blue-600'
                          : isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}>
                      {formData.rental_type === 'daily' ? `${d} day${d > 1 ? 's' : ''}` : `${d/7} week${d > 7 ? 's' : ''}`}
                    </button>
                  ))}
                </div>
                <p className={`text-xs mt-2 font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  ⚠️ Short-stay pricing includes a premium over the standard monthly rate.
                  {formData.rental_type === 'daily' ? ' Daily rate ≈ monthly ÷ 30 × 2.2' : ' Weekly rate ≈ monthly ÷ 30 × 1.6 per night'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('prop_title')}</h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('prop_sub')}</p>
            </div>

            {/* Unified property arrangement picker */}
            <div>
              <label className="label">How is this property arranged?</label>
              <div className="grid grid-cols-1 gap-2">
                {PROPERTY_ARRANGEMENTS.map((arr) => (
                  <label
                    key={arr.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.property_arrangement === arr.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                        : isDark ? 'border-slate-700 hover:border-slate-500 hover:bg-slate-700/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="property_arrangement"
                      value={arr.value}
                      checked={formData.property_arrangement === arr.value}
                      onChange={handleChange}
                      className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{arr.label}</p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{arr.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.property_arrangement && <p className="text-red-500 text-xs mt-1">{errors.property_arrangement}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[['num_bedrooms','f_bedrooms',1,10],['num_rooms_total','f_total_rooms',1,20],['floor_area_sqm','f_floor_area',10,500]].map(([name,lk,min,max])=>(
                <div key={name}>
                  <label className="label">{t(lk)}</label>
                  <input type="number" name={name} min={min} max={max} value={formData[name]} onChange={handleChange} className={inputCls(name)} />
                  {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('const_title')}</h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('const_sub')}</p>
            </div>
            <SelectField name="wall_material" labelKey="f_wall" options={WALL_MATERIALS} />
            <SelectField name="floor_material" labelKey="f_floor" options={FLOOR_MATERIALS} />
            <SelectField name="roof_material" labelKey="f_roof" options={ROOF_MATERIALS} />
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('amen_title')}</h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('amen_sub')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['has_electricity','f_electricity'],
                ['has_piped_water','f_water'],
                ['has_indoor_toilet','f_toilet'],
                ['has_kitchen','f_kitchen'],
                ['has_parking','f_parking'],
                ['has_fence','Has Fence / Wall Around Property'],
                ['has_lightning_rod','Has Lightning Rod (Thunder Fighter)'],
                ['has_security_guard','Has Security Guard'],
                ['has_water_tank','Has Water Storage Tank'],
                ['has_backup_generator','Has Backup Generator'],
              ].map(([name, lkOrLabel]) => (
                <label key={name} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="checkbox" name={name} checked={formData[name]} onChange={handleChange} className={checkCls} />
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {lkOrLabel.startsWith('f_') ? t(lkOrLabel) : lkOrLabel}
                  </span>
                </label>
              ))}
            </div>
            <SelectField name="road_access" labelKey="f_road" options={ROAD_ACCESS} />
          </div>
        )}

        {/* Step 5 — Furnishing */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Furnishing & Equipment</h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Select all items <span className="font-semibold">included in the rent</span>. Furnished houses command significantly higher prices in Gasabo.
              </p>
            </div>

            {/* Fully Furnished master toggle */}
            {(() => {
              const anyIndividual = [
                formData.has_sofa, formData.has_beds_mattresses, formData.has_wardrobe,
                formData.has_dining_set, formData.has_tv, formData.has_fridge,
                formData.has_washing_machine, formData.has_air_conditioning, formData.has_internet_wifi,
              ].some(Boolean);
              const fullyDisabled = anyIndividual;
              const individualsDisabled = !!formData.is_furnished;
              return (
                <>
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                    fullyDisabled
                      ? 'opacity-40 cursor-not-allowed ' + (isDark ? 'border-slate-700' : 'border-slate-200')
                      : 'cursor-pointer ' + (formData.is_furnished
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                          : isDark ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300')
                  }`}>
                    <input type="checkbox" name="is_furnished" checked={formData.is_furnished}
                      disabled={fullyDisabled}
                      onChange={handleChange}
                      className="mt-0.5 w-4 h-4 text-amber-500 border-slate-300 focus:ring-amber-500 flex-shrink-0" />
                    <div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>🛋️ Fully Furnished</p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {fullyDisabled
                          ? '⚠️ Deselect individual items first to enable this'
                          : 'All furniture and appliances included — sofa, beds, wardrobe, dining set, TV, fridge, etc.'}
                      </p>
                    </div>
                  </label>

                  <div className={`transition-opacity ${individualsDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                      individualsDisabled
                        ? isDark ? 'text-slate-600' : 'text-slate-300'
                        : isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {individualsDisabled ? '🔒 Individual items disabled (Fully Furnished selected)' : 'Or select individual items:'}
                    </p>

                    {/* Furniture */}
                    <div className="mb-4">
                      <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>🪑 Furniture</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ['has_sofa',            '🛋️ Sofa / Sitting Room Set'],
                          ['has_beds_mattresses', '🛏️ Beds with Mattresses'],
                          ['has_wardrobe',        '🚪 Wardrobe(s)'],
                          ['has_dining_set',      '🍽️ Dining Table & Chairs'],
                        ].map(([name, label]) => (
                          <label key={name} className={`flex items-center gap-2.5 p-3 rounded-lg border transition-colors ${
                            individualsDisabled
                              ? isDark ? 'border-slate-700 cursor-not-allowed' : 'border-slate-200 cursor-not-allowed'
                              : formData[name]
                                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 cursor-pointer'
                                : isDark ? 'border-slate-700 hover:bg-slate-700 cursor-pointer' : 'border-slate-200 hover:bg-slate-50 cursor-pointer'
                          }`}>
                            <input type="checkbox" name={name} checked={formData[name]}
                              disabled={individualsDisabled}
                              onChange={handleChange}
                              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 flex-shrink-0" />
                            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Electronics & Appliances */}
                    <div>
                      <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>📺 Electronics & Appliances</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ['has_tv',               '📺 Television (TV)'],
                          ['has_fridge',           '🧊 Refrigerator / Fridge'],
                          ['has_washing_machine',  '🫧 Washing Machine'],
                          ['has_air_conditioning', '❄️ Air Conditioning (AC)'],
                          ['has_internet_wifi',    '📶 Internet / WiFi'],
                        ].map(([name, label]) => (
                          <label key={name} className={`flex items-center gap-2.5 p-3 rounded-lg border transition-colors ${
                            individualsDisabled
                              ? isDark ? 'border-slate-700 cursor-not-allowed' : 'border-slate-200 cursor-not-allowed'
                              : formData[name]
                                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 cursor-pointer'
                                : isDark ? 'border-slate-700 hover:bg-slate-700 cursor-pointer' : 'border-slate-200 hover:bg-slate-50 cursor-pointer'
                          }`}>
                            <input type="checkbox" name={name} checked={formData[name]}
                              disabled={individualsDisabled}
                              onChange={handleChange}
                              className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 flex-shrink-0" />
                            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {(formData.is_furnished || formData.has_sofa || formData.has_tv || formData.has_fridge || formData.has_air_conditioning || formData.has_internet_wifi) && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                isDark ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
              }`}>
                <span>✅</span>
                <span>{formData.is_furnished ? 'Fully furnished — expect significantly higher rent' : `${[formData.has_sofa,formData.has_beds_mattresses,formData.has_wardrobe,formData.has_dining_set,formData.has_tv,formData.has_fridge,formData.has_washing_machine,formData.has_air_conditioning,formData.has_internet_wifi].filter(Boolean).length} item(s) selected — rent adjusted accordingly`}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {submitError && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {submitError}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5">
        <button type="button" onClick={handleBack} disabled={currentStep === 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${currentStep === 1 ? 'text-slate-300 cursor-not-allowed dark:text-slate-600' : 'btn-secondary'}`}>
          <ChevronLeft size={16} />{t('btn_back')}
        </button>
        <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('form_step')} {currentStep} {t('form_of')} 5</span>
        {currentStep < 5 ? (
          <button type="button" onClick={handleNext} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold btn-primary">
            {t('btn_next')} <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? <><Loader size={16} className="animate-spin" />{t('btn_predicting')}</> : <><Zap size={16} />{t('btn_predict')}</>}
          </button>
        )}
      </div>
    </div>
  );
}
