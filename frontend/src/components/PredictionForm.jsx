import { useState } from 'react';
import { MapPin, Home, Wrench, Zap, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { predictRent, validatePropertyData } from '../services/api';
import { useApp } from '../context/AppContext';

const DISTRICTS = ['Gasabo'];
const GASABO_SECTORS = ['Bumbogo','Gatsata','Gikomero','Gisozi','Jabana','Jali','Kacyiru','Kimihurura','Kimironko','Kinyinya','Ndera','Nduba','Remera','Rusororo','Rutunga'];
const HOUSE_TYPES = ['standalone','apartment','shared_compound','villa'];
const WALL_MATERIALS = ['brick','mud_brick','concrete','wood','mixed'];
const FLOOR_MATERIALS = ['cement','tiles','earth','wood'];
const ROOF_MATERIALS = ['iron_sheet','tiles','grass','concrete'];
const URBAN_RURAL = ['urban','peri_urban','rural'];
const ROAD_ACCESS = ['tarmac','murram','footpath'];
const STEP_FIELDS = { 1: ['district','sector','urban_rural','distance_to_cbd_km'], 2: ['house_type','num_bedrooms','num_rooms_total','floor_area_sqm'], 3: ['wall_material','floor_material','roof_material'], 4: ['road_access'] };
const INITIAL_DATA = { district:'',sector:'',urban_rural:'',distance_to_cbd_km:'',is_near_cbd:false,house_type:'',num_bedrooms:1,num_rooms_total:1,floor_area_sqm:30,wall_material:'',floor_material:'',roof_material:'',has_electricity:false,has_piped_water:false,has_indoor_toilet:false,has_kitchen:false,has_parking:false,road_access:'' };
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
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
  };

  const validateStep = (step) => {
    const result = validatePropertyData({ ...formData });
    const stepErrors = {};
    STEP_FIELDS[step].forEach((f) => { if (result.errors[f]) stepErrors[f] = result.errors[f]; });
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => { if (validateStep(currentStep)) setCurrentStep((p) => Math.min(p + 1, 4)); };
  const handleBack = () => { setErrors({}); setCurrentStep((p) => Math.max(p - 1, 1)); };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true); setSubmitError('');
    try {
      const bedrooms = parseInt(formData.num_bedrooms, 10) || 1;
      const rooms = parseInt(formData.num_rooms_total, 10) || bedrooms + 1;
      const payload = {
        ...formData,
        district: formData.district || 'Gasabo',
        distance_to_cbd_km: parseFloat(formData.distance_to_cbd_km) || 5.0,
        num_bedrooms: bedrooms,
        num_rooms_total: Math.max(rooms, bedrooms),
        floor_area_sqm: parseFloat(formData.floor_area_sqm) || 30.0,
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
                <label className="label">{t('f_distance')}</label>
                <input type="number" name="distance_to_cbd_km" step="0.1" min="0.1" max="100" placeholder="e.g. 4.5" value={formData.distance_to_cbd_km} onChange={handleChange} className={inputCls('distance_to_cbd_km')} />
                {errors.distance_to_cbd_km && <p className="text-red-500 text-xs mt-1">{errors.distance_to_cbd_km}</p>}
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" name="is_near_cbd" checked={formData.is_near_cbd} onChange={handleChange} className={checkCls} />
              <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('f_near_cbd')}</span>
            </label>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('prop_title')}</h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('prop_sub')}</p>
            </div>
            <SelectField name="house_type" labelKey="f_house_type" options={HOUSE_TYPES} />
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
              {[['has_electricity','f_electricity'],['has_piped_water','f_water'],['has_indoor_toilet','f_toilet'],['has_kitchen','f_kitchen'],['has_parking','f_parking']].map(([name,lk])=>(
                <label key={name} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="checkbox" name={name} checked={formData[name]} onChange={handleChange} className={checkCls} />
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t(lk)}</span>
                </label>
              ))}
            </div>
            <SelectField name="road_access" labelKey="f_road" options={ROAD_ACCESS} />
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
        <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('form_step')} {currentStep} {t('form_of')} 4</span>
        {currentStep < 4 ? (
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
