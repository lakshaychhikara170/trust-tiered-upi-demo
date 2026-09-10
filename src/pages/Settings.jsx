import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Shield, Sun, Moon } from 'lucide-react';

export default function Settings() {
  const { threshold, setThreshold, theme, toggleTheme } = useAppContext();
  const navigate = useNavigate();
  const isLight = theme === 'light';

  return (
    <div className={`flex flex-col h-full overflow-y-auto transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#07080f] text-white'
    }`}>
      <div className={`p-4 flex items-center justify-between border-b sticky top-0 z-10 backdrop-blur-md ${
        isLight ? 'bg-white/90 border-slate-200' : 'bg-[#07080f]/90 border-white/[0.08]'
      }`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className={`p-2 -ml-2 rounded-full transition-colors ${
              isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Security &amp; App Settings</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Theme Settings Card */}
        <div className={`p-6 rounded-3xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/[0.04] border-white/[0.08]'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className={`font-bold text-base mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>App Appearance</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Current theme: <span className="font-semibold capitalize text-violet-500">{theme} Mode</span></p>
            </div>
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all active:scale-95 shadow-sm ${
                isLight
                  ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                  : 'bg-white/[0.08] border-white/15 text-amber-400 hover:bg-white/15'
              }`}
            >
              {isLight ? (
                <>
                  <Moon className="w-4 h-4" /> Dark Mode
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" /> Light Mode
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Info Card */}
        <div className={`p-4 rounded-2xl flex gap-3 border ${
          isLight ? 'bg-violet-50 border-violet-200 text-violet-900' : 'bg-violet-500/10 border-violet-500/20 text-violet-300'
        }`}>
          <Shield className="w-6 h-6 shrink-0 mt-0.5 text-violet-500" />
          <p className="text-xs leading-relaxed">
            Trust-Tiered protection holds payments to unknown recipients that exceed your personal threshold, giving you time to cancel scams.
          </p>
        </div>

        {/* Freeze Threshold Slider */}
        <div className={`p-6 rounded-3xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/[0.04] border-white/[0.08]'
        }`}>
          <h2 className={`font-bold mb-1 text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Freeze Threshold</h2>
          <p className={`text-xs mb-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Any payment to a new contact above this amount will be held for 24 hours.</p>

          <div className="text-center mb-6">
            <span className="text-5xl font-black text-violet-500 tracking-tight">₹{threshold.toLocaleString('en-IN')}</span>
          </div>

          <input 
            type="range" 
            min="1000" 
            max="10000" 
            step="500"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-violet-500 mb-4 ${
              isLight ? 'bg-slate-200' : 'bg-white/10'
            }`}
          />
          
          <div className={`flex justify-between text-xs font-medium px-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>₹1,000</span>
            <span>₹10,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
