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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center p-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900 rounded-full cursor-pointer hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">{details.title}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <Icon className="w-10 h-10 text-indigo-600 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{details.title}</h2>
          <p className="text-sm text-gray-500 mb-6">Fast, secure, and instant.</p>
          
          <div className="w-full text-left">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{details.label}</label>
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={details.placeholder}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Demo Alert */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 text-blue-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">Hackathon Demo Notice:</span> This is a mock screen for {details.title}. In a real application, this would connect to a biller API (like BBPS).
          </div>
        </div>
      </div>

      <div className="p-5 bg-white border-t border-gray-100">
        <div className="flex justify-between items-center mb-4 text-sm">
          <span className="text-gray-500 font-medium">Available Balance</span>
          <span className="font-bold text-gray-900">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <button 
          className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
          disabled={!inputVal}
        >
          {details.btn}
        </button>
      </div>
    </div>
  );
}
