import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2, Brain, Clock, MapPin, CheckCircle, AlertCircle,
  Loader, ArrowRight, TrendingUp, Building2, Users, ShieldCheck,
  Zap, Eye, Database, ChevronRight
} from 'lucide-react';
import { checkHealth } from '../services/api';
import { useApp } from '../context/AppContext';

const SECTORS = [
  'Bumbogo','Gatsata','Gikomero','Gisozi','Jabana','Jali',
  'Kacyiru','Kimihurura','Kimironko','Kinyinya','Ndera',
  'Nduba','Remera','Rusororo','Rutunga'
];

// Rwanda flag stripe colors used as accents
const RW_BLUE   = '#20603D'; // actually Rwanda green — using blue for tech feel
const ACCENT    = '#00A1DE'; // Rwanda sky blue

export default function Home() {
  const { t, theme } = useApp();
  const isDark = theme === 'dark';
  const [modelStatus, setModelStatus] = useState('loading');
  const [r2, setR2] = useState(null);

  useEffect(() => {
    let cancelled = false;
    checkHealth()
      .then((d) => {
        if (!cancelled) {
          setModelStatus(d?.model_loaded ? 'online' : 'offline');
          if (d?.model_r2) setR2((d.model_r2 * 100).toFixed(1));
        }
      })
      .catch(() => { if (!cancelled) setModelStatus('offline'); });
    return () => { cancelled = true; };
  }, []);

  const StatusBadge = () => {
    if (modelStatus === 'loading') return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400">
        <Loader size={12} className="animate-spin" /> Checking model…
      </span>
    );
    if (modelStatus === 'online') return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold dark:bg-green-900/30 dark:border-green-700 dark:text-green-400">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Model Online {r2 ? `— R² ${r2}%` : ''}
      </span>
    );
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold dark:bg-red-900/30 dark:border-red-700 dark:text-red-400">
        <AlertCircle size={12} /> Model Offline
      </span>
    );
  };

  const stats = [
    { icon: ShieldCheck, label: 'Model Accuracy',    value: r2 ? `${r2}% R²` : '96.6% R²',  color: 'text-green-600' },
    { icon: MapPin,      label: 'Sectors Covered',   value: '15 Sectors',                    color: 'text-blue-600'  },
    { icon: Building2,   label: 'Property Types',    value: '4 Types',                       color: 'text-purple-600'},
    { icon: Database,    label: 'Data Source',        value: 'NISR / EICV5',                  color: 'text-orange-600'},
  ];

  const features = [
    {
      icon: BarChart2, color: 'text-blue-600', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50',
      title: 'XGBoost ML Model',
      desc: 'Trained on 2,000 Gasabo housing records. Achieves 96.6% accuracy (R²) — reliable estimates across all 15 sectors.',
    },
    {
      icon: Eye, color: 'text-green-600', bg: isDark ? 'bg-green-900/30' : 'bg-green-50',
      title: 'Explainable AI',
      desc: 'Every prediction shows exactly which factors drive the price — no black box. Powered by SHAP values with plain-language explanations.',
    },
    {
      icon: TrendingUp, color: 'text-purple-600', bg: isDark ? 'bg-purple-900/30' : 'bg-purple-50',
      title: 'Dual Currency',
      desc: 'Results in both Rwandan Francs (RWF) and US Dollars (USD) with a confidence range showing the likely market price.',
    },
    {
      icon: Clock, color: 'text-orange-600', bg: isDark ? 'bg-orange-900/30' : 'bg-orange-50',
      title: 'Prediction History',
      desc: 'Every estimate is saved and searchable. Track trends over time and export your data for further analysis.',
    },
  ];

  const steps = [
    { num: '01', icon: MapPin,    title: 'Enter Property Details',  desc: 'Select location, sector, house type, size and construction materials in 4 guided steps.' },
    { num: '02', icon: Brain,     title: 'AI Analyses 18 Features', desc: 'Our XGBoost ensemble model processes every detail — from floor area to road access.' },
    { num: '03', icon: Zap,       title: 'Instant Prediction',      desc: 'Get an estimated monthly rent in RWF and USD with a confidence interval in seconds.' },
    { num: '04', icon: BarChart2, title: 'Understand the Result',   desc: 'See which factors raised or lowered the price — with percentage impact and plain-language tips.' },
  ];

  return (
    <div className="page-bg">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className={`relative overflow-hidden border-b transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}`}>

        {/* Subtle background grid */}
        <div className={`absolute inset-0 pointer-events-none ${isDark ? 'opacity-5' : 'opacity-[0.03]'}`}
          style={{ backgroundImage: 'linear-gradient(#64748b 1px,transparent 1px),linear-gradient(90deg,#64748b 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Rwanda flag top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-[#20603D]" />
          <div className="flex-1 bg-[#FAD201]" />
          <div className="flex-1 bg-[#00A1DE]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-14 pb-16 md:pt-20 md:pb-24">
          <div className="max-w-3xl">

            {/* Status + breadcrumb */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <StatusBadge />
              <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>·</span>
              <span className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Case Study · Gasabo District, Kigali — Rwanda
              </span>
            </div>

            {/* Headline */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              House Rent Price
              <span className="block text-blue-600"> Prediction</span>
            </h1>
            <h2 className={`text-xl md:text-2xl font-semibold mb-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Using Machine Learning
            </h2>
            <p className={`text-base md:text-lg leading-relaxed max-w-2xl mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              AI-powered rent estimates for all <strong className={isDark ? 'text-white' : 'text-slate-800'}>15 sectors of Gasabo District</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link to="/predict"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 text-base">
                Get Rent Estimate <ArrowRight size={18} />
              </Link>
              <Link to="/about"
                className={`inline-flex items-center gap-2 px-7 py-3.5 font-semibold rounded-xl border transition-all duration-200 text-base ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm'}`}>
                How It Works <ChevronRight size={16} />
              </Link>
            </div>

            {/* Stats row */}
            <div className={`mt-12 pt-8 border-t grid grid-cols-2 sm:grid-cols-4 gap-6 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              {stats.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex flex-col gap-1">
                  <Icon size={18} className={color} />
                  <p className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
                  <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Why Use This System?
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Transparent, data-driven rent estimates built specifically for the Kigali housing market.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className={`card p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className={`font-bold mb-2 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className={`border-y py-16 transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50/80 border-slate-200/60'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              How It Works
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Four simple steps to get your rent estimate
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, i) => (
              <div key={step.num} className="card p-6 relative">
                {/* Connector line (desktop) */}
                {i < steps.length - 1 && (
                  <div className={`hidden lg:block absolute top-9 left-full w-5 h-px z-10 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
                )}
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    {step.num}
                  </span>
                  <step.icon size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                </div>
                <h3 className={`font-bold mb-1.5 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{step.title}</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTORS ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            All 15 Gasabo Sectors
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Full coverage — from urban Kacyiru to rural Rutunga
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {SECTORS.map((s) => (
            <Link to="/predict" key={s}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-150 ${isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500 hover:text-blue-400 hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:border-blue-400 hover:text-blue-700 hover:shadow-md'}`}>
              {s}
            </Link>
          ))}
        </div>
        <p className={`text-center text-xs mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Click any sector to start a prediction
        </p>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-blue-600 py-14">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-3">Ready to get started?</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Estimate Your Rent in Under a Minute
          </h2>
          <p className="text-blue-100 text-sm mb-8 max-w-xl mx-auto">
            Get an AI-powered rent prediction for any property in Gasabo District — with a full explanation of what drives the price.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/predict"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-base shadow-lg">
              Start Prediction <ArrowRight size={18} />
            </Link>
            <Link to="/history"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors text-base border border-blue-500">
              View History
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className={`py-8 transition-colors ${isDark ? 'bg-slate-950' : 'bg-slate-900'}`}>
        {/* Rwanda flag bottom accent */}
        <div className="flex h-0.5 mb-6">
          <div className="flex-1 bg-[#20603D]" />
          <div className="flex-1 bg-[#FAD201]" />
          <div className="flex-1 bg-[#00A1DE]" />
        </div>
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <BarChart2 size={14} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">House Rent Price Prediction</span>
          </div>
          <p className="text-slate-400 text-xs">House Rent Price Prediction · Gasabo District, Kigali</p>
          <p className="text-blue-400 text-xs font-semibold">Developed by IZABAYO Honorine</p>
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} — Case Study of Gasabo District, Kigali — Rwanda 🇷🇼</p>
        </div>
      </footer>
    </div>
  );
}
