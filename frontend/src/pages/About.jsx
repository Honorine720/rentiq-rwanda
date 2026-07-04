import { Brain, Target, Zap, ShieldCheck, Database, Code2, MapPin, BarChart2 } from 'lucide-react';

const SECTORS = [
  'Kacyiru', 'Kimironko', 'Remera', 'Gisozi', 'Kimihurura',
  'Kinyinya', 'Ndera', 'Jabana', 'Jali', 'Bumbogo',
  'Gatsata', 'Gikomero', 'Nduba', 'Rusororo', 'Rutunga',
];

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">About RentIQ Rwanda</h1>
        <p className="text-slate-500 max-w-2xl">
          An AI-powered rent prediction system built specifically for Gasabo District, Kigali —
          Rwanda's most urbanised district with 15 diverse sectors.
        </p>
      </div>

      {/* Mission */}
      <div className="card p-8 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Mission</h2>
        <p className="text-slate-600 leading-relaxed">
          To provide transparent, accurate, and accessible house rent predictions for Rwanda using
          explainable AI. We help tenants, landlords, and property developers make informed decisions
          with data-driven insights calibrated to real Rwanda housing market conditions.
        </p>
      </div>

      {/* How It Works */}
      <div className="card p-8 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">How It Works</h2>
        <div className="space-y-6">
          {[
            {
              num: '01', icon: Database, color: 'bg-blue-50 text-blue-600',
              title: 'Data Collection',
              desc: 'Housing data sourced from EICV5 government surveys and NISR statistics, calibrated to real Rwanda housing market patterns across all 15 sectors of Gasabo District.',
            },
            {
              num: '02', icon: Brain, color: 'bg-purple-50 text-purple-600',
              title: 'Machine Learning',
              desc: 'An XGBoost ensemble model trained on 18 property features achieves R² = 0.948 accuracy through cross-validation and hyperparameter tuning.',
            },
            {
              num: '03', icon: BarChart2, color: 'bg-green-50 text-green-600',
              title: 'SHAP Explanations',
              desc: 'Every prediction includes SHAP values showing exactly which features influenced the price and by how much — complete transparency, no black box.',
            },
          ].map(({ num, icon: Icon, color, title, desc }) => (
            <div key={num} className="flex gap-5">
              <div className={`w-11 h-11 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {[
          { icon: Brain, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Explainable AI', desc: 'SHAP values reveal the reasoning behind every prediction — not just a number.' },
          { icon: Target, color: 'text-green-600', bg: 'bg-green-50', title: 'High Accuracy', desc: 'XGBoost model achieves 94.8% R² score through rigorous training and validation.' },
          { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', title: 'Instant Results', desc: 'Get rent estimates in both RWF and USD with confidence intervals in seconds.' },
          { icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', title: 'Rwanda-Focused', desc: 'Built specifically for Gasabo District — all 15 sectors, urban to rural.' },
        ].map(({ icon: Icon, color, bg, title, desc }) => (
          <div key={title} className="card p-6">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-600">{desc}</p>
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <div className="card p-8 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Code2 size={20} className="text-slate-600" />
          <h2 className="text-xl font-bold text-slate-900">Technology Stack</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Backend</h3>
            <ul className="space-y-2">
              {['Python 3.12', 'FastAPI (REST API)', 'XGBoost (ML Model)', 'SHAP (Explainability)', 'SQLAlchemy + Neon PostgreSQL'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-green-600 uppercase tracking-wide mb-3">Frontend</h3>
            <ul className="space-y-2">
              {['React 18', 'Vite (Build Tool)', 'TailwindCSS (Styling)', 'React Router (Navigation)', 'Axios (HTTP Client)'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Sectors */}
      <div className="card p-8">
        <div className="flex items-center gap-2 mb-5">
          <MapPin size={20} className="text-slate-600" />
          <h2 className="text-xl font-bold text-slate-900">Gasabo District — All 15 Sectors</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {SECTORS.map((sector) => (
            <span key={sector} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">
              {sector}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Coverage spans urban (Kacyiru, Remera), peri-urban (Kimironko, Gisozi), and rural (Rutunga, Nduba) areas.
        </p>
      </div>
    </div>
  );
}
