import { Brain, Target, Shield, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          About RentIQ Rwanda 🇷🇼
        </h1>
        <p className="text-xl font-bold text-gray-600 max-w-3xl mx-auto">
          AI-powered rent prediction for Gasabo District, Kigali — Rwanda's most data-rich urban district
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
        <h2 className="text-3xl font-black mb-4">🎯 Our Mission</h2>
        <p className="text-lg font-bold text-gray-700 leading-relaxed">
          To provide transparent, accurate, and accessible house rent predictions for Rwanda using 
          explainable AI technology. We help tenants, landlords, and property developers make 
          informed decisions with data-driven insights.
        </p>
      </div>

      {/* How It Works */}
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
        <h2 className="text-3xl font-black mb-6">⚙️ How It Works</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-[#F9A825] border-3 border-black flex items-center justify-center font-black text-xl flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-black text-lg mb-1">Data Collection</h3>
              <p className="font-bold text-gray-700">
                We collect data from multiple sources including EICV5 government surveys, NISR statistics, 
                and synthetic data calibrated to real Rwanda housing market patterns across all 15 sectors of Gasabo District.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-[#0095DA] border-3 border-black flex items-center justify-center font-black text-xl flex-shrink-0 text-white">
              2
            </div>
            <div>
              <h3 className="font-black text-lg mb-1">Machine Learning</h3>
              <p className="font-bold text-gray-700">
                Our XGBoost model is trained on 22 property features, achieving high accuracy through 
                cross-validation and hyperparameter tuning.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-[#2E7D32] border-3 border-black flex items-center justify-center font-black text-xl flex-shrink-0 text-white">
              3
            </div>
            <div>
              <h3 className="font-black text-lg mb-1">SHAP Explanations</h3>
              <p className="font-bold text-gray-700">
                Every prediction comes with SHAP values showing exactly which features influenced 
                the price and by how much — complete transparency.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <div className="flex items-center gap-3 mb-3">
            <Brain size={32} className="text-[#0095DA]" />
            <h3 className="text-xl font-black">Explainable AI</h3>
          </div>
          <p className="font-bold text-gray-700">
            Not just a black box. SHAP values reveal the reasoning behind every prediction.
          </p>
        </div>

        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <div className="flex items-center gap-3 mb-3">
            <Target size={32} className="text-[#F9A825]" />
            <h3 className="text-xl font-black">High Accuracy</h3>
          </div>
          <p className="font-bold text-gray-700">
            Our XGBoost model achieves strong R² scores through rigorous training and validation.
          </p>
        </div>

        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <div className="flex items-center gap-3 mb-3">
            <Zap size={32} className="text-[#2E7D32]" />
            <h3 className="text-xl font-black">Fast Predictions</h3>
          </div>
          <p className="font-bold text-gray-700">
            Get instant rent estimates in both RWF and USD with confidence ranges.
          </p>
        </div>

        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={32} className="text-[#0095DA]" />
            <h3 className="text-xl font-black">Rwanda-Focused</h3>
          </div>
          <p className="font-bold text-gray-700">
            Built specifically for Gasabo District, Kigali — covering all 15 sectors with urban, peri-urban, and rural properties.
          </p>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
        <h2 className="text-3xl font-black mb-6">🔧 Technology Stack</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-black text-lg mb-3 text-[#0095DA]">Backend</h3>
            <ul className="space-y-2 font-bold text-gray-700">
              <li>• Python 3.11</li>
              <li>• FastAPI (REST API)</li>
              <li>• XGBoost (ML Model)</li>
              <li>• SHAP (Explainability)</li>
              <li>• SQLAlchemy (Database)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-black text-lg mb-3 text-[#F9A825]">Frontend</h3>
            <ul className="space-y-2 font-bold text-gray-700">
              <li>• React 18</li>
              <li>• Vite (Build Tool)</li>
              <li>• TailwindCSS (Styling)</li>
              <li>• React Router (Navigation)</li>
              <li>• Axios (HTTP Client)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Districts Covered */}
      <div className="bg-[#F9A825] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8">
        <h2 className="text-3xl font-black mb-4">📍 Districts Covered</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
          {['Kacyiru', 'Kimironko', 'Remera', 'Gisozi', 'Kimihurura', 'Kinyinya', 'Ndera', 'Jabana', 'Jali', 'Bumbogo', 'Gatsata', 'Gikomero', 'Nduba', 'Rusororo', 'Rutunga'].map((sector) => (
            <div
              key={sector}
              className="bg-white border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 text-center font-black text-sm"
            >
              {sector}
            </div>
          ))}
        </div>
        <p className="mt-4 font-bold text-center">
          All 15 sectors of Gasabo District, Kigali 🏙️
        </p>
      </div>
    </div>
  );
}
