import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Smartphone, CreditCard, Clock, Plus, Zap, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Service() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { balance } = useAppContext();
  
  const [inputVal, setInputVal] = useState('');
  
  const getServiceDetails = () => {
    switch(type) {
      case 'recharge': return { title: 'Mobile Recharge', icon: Smartphone, label: 'Enter Mobile Number', placeholder: '+91 99999 99999', btn: 'Fetch Plans' };
      case 'dth': return { title: 'DTH Recharge', icon: CreditCard, label: 'Enter Subscriber ID', placeholder: 'e.g. 1012345678', btn: 'Confirm ID' };
      case 'electricity': return { title: 'Electricity Bill', icon: Clock, label: 'Enter Consumer Number', placeholder: 'CA Number', btn: 'Fetch Bill' };
      case 'transfer': return { title: 'Self Transfer', icon: Plus, label: 'Enter Account Number', placeholder: 'Transfer to...', btn: 'Verify Account' };
      default: return { title: 'Service', icon: Zap, label: 'Enter Details', placeholder: '...', btn: 'Proceed' };
    }
  };

  const details = getServiceDetails();
  const Icon = details.icon;

  return (
    <div className="flex flex-col h-full bg-[#07080f] text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-[#07080f]/90 backdrop-blur-md border-b border-white/[0.08] sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-full cursor-pointer hover:bg-white/[0.06] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white ml-2">{details.title}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl p-6 border border-white/[0.08] mb-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-full flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(139,92,246,0.2)]">
            <Icon className="w-10 h-10 text-violet-400 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{details.title}</h2>
          <p className="text-xs text-slate-400 mb-6">Fast, secure, and instant.</p>
          
          <div className="w-full text-left">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">{details.label}</label>
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={details.placeholder}
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl p-4 text-white font-medium focus:ring-2 focus:ring-violet-500/50 focus:outline-none placeholder-slate-600 transition-all text-sm"
            />
          </div>
        </div>

        {/* Demo Alert */}
        <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-2xl flex gap-3 text-violet-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-violet-400" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-white">Hackathon Demo Notice:</span> This is a mock screen for {details.title}. In a real application, this would connect to a biller API (like BBPS).
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-white/[0.08] bg-[#07080f]">
        <button 
          onClick={() => {
            if (!inputVal) return alert('Please enter required details');
            alert(`Demo: ${details.title} initiated for ${inputVal}`);
            navigate('/');
          }}
          disabled={!inputVal}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all"
        >
          {details.btn}
        </button>
      </div>
    </div>
  );
}
