import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Shield, Info } from 'lucide-react';

export default function Settings() {
  const { threshold, setThreshold } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Security Settings</h1>
      </div>

      <div className="p-6">
        <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl flex gap-3 mb-8">
          <Shield className="w-6 h-6 shrink-0 mt-0.5 text-indigo-600" />
          <p className="text-sm">
            Trust-Tiered protection holds payments to unknown recipients that exceed your personal threshold, giving you time to cancel scams.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-1">Freeze Threshold</h2>
          <p className="text-sm text-gray-500 mb-6">Any payment to a new contact above this amount will be held for 24 hours.</p>

          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-indigo-600">₹{threshold.toLocaleString('en-IN')}</span>
          </div>

          <input 
            type="range" 
            min="1000" 
            max="10000" 
            step="500"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-4"
          />
          
          <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
            <span>₹1,000</span>
            <span>₹10,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
