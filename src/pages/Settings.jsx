import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Shield, Info } from 'lucide-react';

export default function Settings() {
  const { threshold, setThreshold } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#07080f] text-white overflow-y-auto">
      <div className="bg-[#07080f]/90 backdrop-blur-md p-4 flex items-center gap-4 border-b border-white/[0.08] sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">Security Settings</h1>
      </div>

      <div className="p-6">
        <div className="bg-violet-500/10 border border-violet-500/20 text-violet-300 p-4 rounded-2xl flex gap-3 mb-8">
          <Shield className="w-6 h-6 shrink-0 mt-0.5 text-violet-400" />
          <p className="text-xs leading-relaxed">
            Trust-Tiered protection holds payments to unknown recipients that exceed your personal threshold, giving you time to cancel scams.
          </p>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.08]">
          <h2 className="font-bold text-white mb-1 text-base">Freeze Threshold</h2>
          <p className="text-xs text-slate-400 mb-6">Any payment to a new contact above this amount will be held for 24 hours.</p>

          <div className="text-center mb-6">
            <span className="text-5xl font-black text-violet-400 tracking-tight">₹{threshold.toLocaleString('en-IN')}</span>
          </div>

          <input 
            type="range" 
            min="1000" 
            max="10000" 
            step="500"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500 mb-4"
          />
          
          <div className="flex justify-between text-xs text-slate-500 font-medium px-1">
            <span>₹1,000</span>
            <span>₹10,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
