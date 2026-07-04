import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2, Brain, Clock, MapPin, CheckCircle,
  AlertCircle, Loader, ArrowRight, TrendingUp,
  Building2, Users, ShieldCheck
} from 'lucide-react';
import { checkHealth } from '../services/api';

const SECTORS = [
  'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana',
  'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya',
  'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga',
];

const FEATURES = [
  {
    icon: BarChart2,
    title: 'XGBoost ML Model',
    desc: 'Trained on Gasabo District housing data with 94.8% accuracy (R² = 0.948). Reliable estimates for all 15 sectors.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Brain,
    title: 'Explainable AI (SHAP)',
    desc: 'Every prediction comes with SHAP values showing exactly which property features drive the rent price.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: TrendingUp,
    title: 'Dual Currency Output',
    desc: 'Results in both Rwandan Francs (RWF) and US Dollars (USD) with a confidence interval range.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Clock,
    title: 'Prediction History',
    desc: 'All predictions are saved and searchable. Track market trends and export data for analysis.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
];

const STEPS = [
  { num: '01', title: 'Enter Property Details', desc: 'Fill in location, size, materials and amenities across 4 simple steps.' },
  { num: '02', title: 'AI Processes Features', desc: 'Our XGBoost ensemble model analyzes 18 key property characteristics.' },
  { num: '03', title: 'Receive Prediction', desc: 'Get an estimated monthly rent in RWF and USD with a confidence range.' },
  { num: '04', title: 'Review Explanations', desc: 'SHAP values reveal the top factors influencing the predicted price.' },
];

function StatusBadge({ status }) {
  if (status === 'loading') return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
      <Loader size={12} className="animate-spin" /> Checking model status...
    </span>
  );
  if (status === 'online') return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
      <CheckCircle size={12} /> Model Online — R² 0.948
    </span>
  );
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
      <AlertCircle size={12} /> Model Offline
    </span>
  );
}

export default function Home() {
  const [modelStatus, setModelStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    checkHealth()
      .then((data) => { if (!cancelled) setModelStatus(data?.model_loaded ? 'online' : 'offline'); })
      .catch(() => { if (!cancelled) setModelStatus('offline'); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="mb-6">
              <StatusBadge status={modelStatus} />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-5">
              House Rent Prediction<br />
              <span className="text-blue-600">for Gasabo District</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl">
              AI-powered rent estimates for all 15 sectors of Gasabo District, Kigali.
              Built on real Rwanda housing data with transparent, explainable predictions.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/predict" className="btn-primary text-base px-8 py-3.5">
                Get Rent Estimate
                <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn-secondary text-base px-8 py-3.5">
                How It Works
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-12 flex flex-wrap gap-8">
              {[
                { icon: ShieldCheck, label: 'Model Accuracy', value: '94.8% R²' },
                { icon: MapPin, label: 'Sectors Covered', value: '15 Sectors' },
                { icon: Building2, label: 'Property Types', value: '4 Types' },
                { icon: Users, label: 'Data Source', value: 'NISR / EICV5' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{label}</p>
                    <p className="text-sm font-bold text-slate-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Why Use RentIQ Rwanda?</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Transparent, data-driven rent estimates built specifically for the Kigali housing market.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="card p-6 hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How It Works</h2>
            <p className="text-slate-500">Four simple steps to get your rent estimate</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div key={step.num} className="relative">
                <div className="card p-6 h-full">
                  <span className="text-3xl font-extrabold text-blue-100 leading-none block mb-3">
                    {step.num}
                  </span>
                  <h3 className="font-bold text-slate-900 mb-2 text-sm">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTORS ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">All 15 Gasabo Sectors</h2>
          <p className="text-slate-500">
            Full coverage of Gasabo District — from urban Kacyiru to rural Rutunga
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          {SECTORS.map((sector) => (
            <span
              key={sector}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {sector}
            </span>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-blue-600 py-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to estimate your rent?
          </h2>
          <p className="text-blue-100 mb-8">
            Get an AI-powered rent prediction for any property in Gasabo District in under a minute.
          </p>
          <Link to="/predict" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors text-base">
            Start Prediction
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
              <BarChart2 size={14} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">RentIQ Rwanda</span>
          </div>
          <p className="text-slate-400 text-xs text-center">
            AI-Powered Rent Prediction · Gasabo District, Kigali · Built for Rwanda
          </p>
          <p className="text-slate-500 text-xs">© {new Date().getFullYear()} RentIQ Rwanda</p>
        </div>
      </footer>
    </div>
  );
}
