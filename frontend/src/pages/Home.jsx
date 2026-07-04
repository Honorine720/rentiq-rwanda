import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Brain, Clock, MapPin, CheckCircle, AlertCircle, Loader, ArrowRight, TrendingUp, Building2, Users, ShieldCheck } from 'lucide-react';
import { checkHealth } from '../services/api';
import { useApp } from '../context/AppContext';

const SECTORS = ['Bumbogo','Gatsata','Gikomero','Gisozi','Jabana','Jali','Kacyiru','Kimihurura','Kimironko','Kinyinya','Ndera','Nduba','Remera','Rusororo','Rutunga'];

export default function Home() {
  const { t, theme } = useApp();
  const isDark = theme === 'dark';
  const [modelStatus, setModelStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    checkHealth()
      .then((d) => { if (!cancelled) setModelStatus(d?.model_loaded ? 'online' : 'offline'); })
      .catch(() => { if (!cancelled) setModelStatus('offline'); });
    return () => { cancelled = true; };
  }, []);

  const features = [
    { icon: BarChart2, title: t('feat1_title'), desc: t('feat1_desc'), color: 'text-blue-600', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50' },
    { icon: Brain, title: t('feat2_title'), desc: t('feat2_desc'), color: 'text-green-600', bg: isDark ? 'bg-green-900/30' : 'bg-green-50' },
    { icon: TrendingUp, title: t('feat3_title'), desc: t('feat3_desc'), color: 'text-purple-600', bg: isDark ? 'bg-purple-900/30' : 'bg-purple-50' },
    { icon: Clock, title: t('feat4_title'), desc: t('feat4_desc'), color: 'text-orange-600', bg: isDark ? 'bg-orange-900/30' : 'bg-orange-50' },
  ];

  const steps = [
    { num: '01', title: t('step1_title'), desc: t('step1_desc') },
    { num: '02', title: t('step2_title'), desc: t('step2_desc') },
    { num: '03', title: t('step3_title'), desc: t('step3_desc') },
    { num: '04', title: t('step4_title'), desc: t('step4_desc') },
  ];

  const StatusBadge = () => {
    if (modelStatus === 'loading') return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400">
        <Loader size={12} className="animate-spin" />{t('status_checking')}
      </span>
    );
    if (modelStatus === 'online') return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold dark:bg-green-900/30 dark:border-green-700 dark:text-green-400">
        <CheckCircle size={12} />{t('status_online')}
      </span>
    );
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold dark:bg-red-900/30 dark:border-red-700 dark:text-red-400">
        <AlertCircle size={12} />{t('status_offline')}
      </span>
    );
  };

  return (
    <div className="page-bg">

      {/* HERO */}
      <section className={`border-b transition-colors ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="mb-4"><StatusBadge /></div>
            <p className={`text-sm font-semibold uppercase tracking-widest mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {t('hero_case')}
            </p>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('hero_title')}
            </h1>
            <h2 className={`text-2xl md:text-3xl font-bold mb-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {t('hero_subtitle')}
            </h2>
            <p className={`text-lg mb-8 leading-relaxed max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t('hero_desc')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/predict" className="btn-primary text-base px-8 py-3.5">
                {t('hero_cta')} <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn-secondary text-base px-8 py-3.5">
                {t('hero_how')}
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-8">
              {[
                { icon: ShieldCheck, label: t('stat_accuracy'), value: '94.8% R²' },
                { icon: MapPin, label: t('stat_sectors'), value: '15 Sectors' },
                { icon: Building2, label: t('stat_types'), value: '4 Types' },
                { icon: Users, label: t('stat_source'), value: 'NISR / EICV5' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <Icon size={18} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('features_title')}</h2>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t('features_sub')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="card p-6 hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={`border-y py-16 transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('how_title')}</h2>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t('how_sub')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="card p-6 h-full">
                <span className={`text-3xl font-extrabold leading-none block mb-3 ${isDark ? 'text-blue-800' : 'text-blue-100'}`}>{step.num}</span>
                <h3 className={`font-bold mb-2 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{step.title}</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('sectors_title')}</h2>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t('sectors_sub')}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          {SECTORS.map((s) => (
            <span key={s} className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500 hover:text-blue-400' : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700'}`}>
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">{t('cta_title')}</h2>
          <p className="text-blue-100 mb-8">{t('cta_sub')}</p>
          <Link to="/predict" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors text-base">
            {t('cta_btn')} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-8 transition-colors ${isDark ? 'bg-slate-950' : 'bg-slate-900'}`}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
              <BarChart2 size={14} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">House Rent Price Prediction</span>
          </div>
          <p className="text-slate-400 text-xs">{t('footer_built')}</p>
          <p className="text-blue-400 text-xs font-semibold">{t('footer_dev')}</p>
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} — Case Study of Gasabo District, Kigali</p>
        </div>
      </footer>
    </div>
  );
}
