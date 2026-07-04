/**
 * Home.jsx — Landing page for RentIQ Rwanda
 * Cartoon brutalist design with Rwanda flag accents
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkHealth } from '../services/api';

// Hero background decorative blocks
function BgBlocks() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Yellow block */}
      <div className="absolute top-8 left-6 w-16 h-16 bg-[#F9A825] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-6 opacity-40" />
      {/* Blue block */}
      <div className="absolute top-20 right-10 w-24 h-16 bg-[#0095DA] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3 opacity-40" />
      {/* Green block */}
      <div className="absolute bottom-12 left-12 w-20 h-20 bg-[#2E7D32] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-12 opacity-40" />
      {/* Small yellow */}
      <div className="absolute bottom-20 right-8 w-12 h-12 bg-[#F9A825] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-6 opacity-40" />
      {/* Extra blue */}
      <div className="absolute top-40 left-1/2 w-10 h-14 bg-[#0095DA] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[15deg] opacity-40" />
      {/* Extra green corner */}
      <div className="absolute top-1 right-1/4 w-14 h-10 bg-[#2E7D32] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-8deg] opacity-40" />
    </div>
  );
}

export default function Home() {
  const [modelStatus, setModelStatus] = useState('loading');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    checkHealth()
      .then((data) => {
        if (!cancelled) {
          setModelStatus(data?.model_loaded ? 'online' : 'offline');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setModelStatus('offline');
        }
      });
    return () => { cancelled = true; };
  }, []);

  const statusBadge = {
    loading: { text: '⏳ Checking...', bg: 'bg-amber-100', textColor: 'text-amber-800' },
    online: { text: '🟢 Model Online', bg: 'bg-green-200', textColor: 'text-green-900' },
    offline: { text: '🔴 Model Offline', bg: 'bg-red-200', textColor: 'text-red-900' },
  }[modelStatus];

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      {/* ========== HERO SECTION ========== */}
      <section className="relative bg-white border-b-4 border-black overflow-hidden">
        <BgBlocks />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 flex flex-col items-center text-center gap-6 z-10">
          {/* Model status badge */}
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm font-black uppercase ${statusBadge.bg} ${statusBadge.textColor}`}
          >
            {statusBadge.text}
          </span>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
            RentIQ Rwanda{' '}
            <span className="inline-block" role="img" aria-label="Rwanda flag">
              🇷🇼
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl font-bold max-w-2xl text-gray-800">
            AI-Powered Rent Prediction for Gasabo District, Kigali
          </p>
          <button
            onClick={() => navigate('/predict')}
            className="mt-4 px-10 py-4 bg-[#F9A825] text-black text-xl font-black uppercase border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1"
          >
            ⚡ Predict Now
          </button>
        </div>
      </section>

      {/* ========== FEATURES GRID ========== */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-10">
          Why RentIQ? 💡
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all p-6 flex flex-col items-center text-center gap-3">
            <span className="text-5xl" role="img" aria-label="target">🎯</span>
            <h3 className="text-xl font-black">Accurate ML Predictions</h3>
            <p className="text-gray-700 font-semibold">
              Powered by XGBoost trained on Gasabo District housing data. 
              Get rent estimates you can trust.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all p-6 flex flex-col items-center text-center gap-3">
            <span className="text-5xl" role="img" aria-label="magnifying glass">🔍</span>
            <h3 className="text-xl font-black">SHAP Explanations</h3>
            <p className="text-gray-700 font-semibold">
              Understand exactly what drives each prediction. 
              Transparent, explainable AI at your fingertips.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all p-6 flex flex-col items-center text-center gap-3">
            <span className="text-5xl" role="img" aria-label="chart">📊</span>
            <h3 className="text-xl font-black">Prediction History</h3>
            <p className="text-gray-700 font-semibold">
              All your past predictions saved and searchable. 
              Export data for deeper analysis anytime.
            </p>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="bg-[#0095DA] border-y-4 border-black py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12 text-white" 
              style={{ WebkitTextStroke: '2px black' }}>
            How It Works ⚙️
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '1', emoji: '🏠', title: 'Enter property details', desc: 'Fill in district, rooms, materials & more.' },
              { num: '2', emoji: '🧠', title: 'AI analyzes features', desc: 'Our XGBoost model processes 22 key property features.' },
              { num: '3', emoji: '💰', title: 'Get price prediction', desc: 'Receive an estimated monthly rent in RWF & USD.' },
              { num: '4', emoji: '📋', title: 'Understand with explanations', desc: 'SHAP values show exactly why the model made its decision.' },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col items-center text-center gap-3 relative"
              >
                <span className="absolute -top-4 -left-4 w-10 h-10 bg-[#F9A825] border-3 border-black font-black text-lg flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  {step.num}
                </span>
                <span className="text-4xl" role="img" aria-label={step.title}>{step.emoji}</span>
                <h3 className="text-lg font-black">{step.title}</h3>
                <p className="text-sm font-semibold text-gray-700">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== DISTRICTS SUPPORTED ========== */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-10">
          Gasabo Sectors Covered 🗺️
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana',
            'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya',
            'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga',
          ].map((sector, i) => {
            const colors = ['bg-[#2E7D32]', 'bg-[#0095DA]', 'bg-[#F9A825] text-black'];
            const colorClass = colors[i % 3];
            return (
              <span
                key={sector}
                className={`px-4 py-2 font-black text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  colorClass.includes('text-black') ? colorClass : colorClass + ' text-white'
                }`}
              >
                {sector}
              </span>
            );
          })}
        </div>
        <p className="text-center mt-6 font-bold text-gray-600">
          All 15 sectors of Gasabo District, Kigali 🏙️
        </p>
      </section>

      {/* ========== CTA STRIP ========== */}
      <section className="bg-[#F9A825] border-y-4 border-black py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-4">Ready to predict your rent? 🚀</h2>
          <button
            onClick={() => navigate('/predict')}
            className="mt-2 px-8 py-3 bg-white text-black text-lg font-black uppercase border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all"
          >
            Get Started Now →
          </button>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-black border-t-4 border-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-white font-black text-sm uppercase tracking-wider">
            © {new Date().getFullYear()} RentIQ Rwanda. Built with ❤️ for Rwanda 🇷🇼
          </p>
          <p className="text-gray-400 font-semibold text-xs mt-2">
            AI-Powered | Transparent | Made in Rwanda
          </p>
        </div>
      </footer>
    </div>
  );
}