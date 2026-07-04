import { Brain, Target, Zap, ShieldCheck, Database, Code2, MapPin, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SECTORS = ['Kacyiru','Kimironko','Remera','Gisozi','Kimihurura','Kinyinya','Ndera','Jabana','Jali','Bumbogo','Gatsata','Gikomero','Nduba','Rusororo','Rutunga'];

export default function About() {
  const { t, theme } = useApp();
  const isDark = theme === 'dark';

  const features = [
    { icon: Brain, color: 'text-blue-600', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50', title: t('feat2_title'), desc: t('feat2_desc') },
    { icon: Target, color: 'text-green-600', bg: isDark ? 'bg-green-900/30' : 'bg-green-50', title: 'High Accuracy', desc: t('feat1_desc') },
    { icon: Zap, color: 'text-amber-600', bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50', title: t('feat3_title'), desc: t('feat3_desc') },
    { icon: ShieldCheck, color: 'text-purple-600', bg: isDark ? 'bg-purple-900/30' : 'bg-purple-50', title: 'Rwanda-Focused', desc: 'Built specifically for Gasabo District — all 15 sectors, urban to rural.' },
  ];

  return (
    <div className="page-bg">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('about_title')}</h1>
          <p className={`max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('about_sub')}</p>
        </div>

        {/* Mission */}
        <div className="card p-8 mb-6">
          <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('about_mission_title')}</h2>
          <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t('about_mission')}</p>
        </div>

        {/* How It Works */}
        <div className="card p-8 mb-6">
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('about_how_title')}</h2>
          <div className="space-y-6">
            {[
              { icon: Database, color: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600', title: t('about_data_title'), desc: t('about_data') },
              { icon: Brain, color: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600', title: t('about_ml_title'), desc: t('about_ml') },
              { icon: BarChart2, color: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600', title: t('about_shap_title'), desc: t('about_shap') },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex gap-5">
                <div className={`w-11 h-11 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {features.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="card p-6">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={color} />
              </div>
              <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="card p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Code2 size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('about_tech_title')}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { label: 'Backend', color: 'text-blue-600', dot: 'bg-blue-400', items: ['Python 3.12','FastAPI (REST API)','XGBoost (ML Model)','SHAP (Explainability)','SQLAlchemy + Neon PostgreSQL'] },
              { label: 'Frontend', color: 'text-green-600', dot: 'bg-green-400', items: ['React 18','Vite (Build Tool)','TailwindCSS (Styling)','React Router (Navigation)','Axios (HTTP Client)'] },
            ].map(({ label, color, dot, items }) => (
              <div key={label}>
                <h3 className={`text-sm font-bold uppercase tracking-wide mb-3 ${color}`}>{label}</h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Sectors */}
        <div className="card p-8">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('about_sectors_title')}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((s) => (
              <span key={s} className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>{s}</span>
            ))}
          </div>
          <p className={`text-xs mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('about_sectors_note')}</p>
        </div>

      </div>
    </div>
  );
}
