import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { SUSPICIOUS_ACCOUNT_HISTORY } from '../utils/mockData';
import { AlertCircle, Search, UserX, Phone, CheckCircle2, ChevronRight, Ban, ShieldCheck, Check, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { transactions, updateTransactionStatus, setBalance } = useAppContext();
  const navigate = useNavigate();
  const underReviewTxns = transactions.filter(t => t.status === 'Under Review' || t.status === 'Held');
  
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [accountStatus, setAccountStatus] = useState(SUSPICIOUS_ACCOUNT_HISTORY.status);
  const [toastMessage, setToastMessage] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('idle');

  React.useEffect(() => {
    if (selectedTxn) {
      setAiAnalysis('idle');
      const t1 = setTimeout(() => setAiAnalysis('analyzing'), 1000);
      const t2 = setTimeout(() => setAiAnalysis('complete'), 3500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [selectedTxn]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleContact = () => {
    showToast('Mock: Dialing account holder at +91 98765 43210...');
  };

  const handleFreeze = () => {
    setAccountStatus('Frozen');
    if (selectedTxn) {
      updateTransactionStatus(selectedTxn.id, 'Cancelled');
    }
    showToast('Fraud Confirmed. Account frozen and pending transactions cancelled.');
    setTimeout(() => setSelectedTxn(null), 2000);
  };

  const handleApprove = () => {
    if (selectedTxn) {
      updateTransactionStatus(selectedTxn.id, 'Completed');
      setBalance(prev => prev - selectedTxn.amount);
    }
    showToast('Safe Payment. Funds released to the recipient.');
    setTimeout(() => setSelectedTxn(null), 2000);
  };

  if (selectedTxn) {
    return (
      <div className="flex flex-col h-screen bg-[#07080f] max-w-4xl mx-auto w-full text-white relative">
        <div className="bg-[#0f1024] text-white p-4 flex items-center justify-between border-b border-white/[0.08]">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelectedTxn(null); setAiAnalysis('idle'); }} className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">← Back to Queue</button>
            <h1 className="font-bold border-l pl-4 border-white/10 text-base">Case #{selectedTxn.id.substring(4,10)}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider hidden sm:block">High Priority</span>
            
            <div className="relative flex items-center gap-2">
              {aiAnalysis === 'analyzing' && <span className="text-emerald-400 text-xs font-mono animate-pulse">Scanning...</span>}
              {aiAnalysis === 'complete' && <span className="text-red-400 text-xs font-mono font-bold">98.7% Fraud</span>}
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center relative cursor-help ${aiAnalysis === 'analyzing' ? 'bg-indigo-500/20' : aiAnalysis === 'complete' ? 'bg-red-500/20' : 'bg-white/[0.06]'}`}>
                {aiAnalysis === 'analyzing' && <div className="absolute inset-0 border-2 border-t-emerald-400 border-transparent rounded-full animate-spin"></div>}
                <Activity className={`w-5 h-5 ${aiAnalysis === 'analyzing' ? 'text-emerald-400' : aiAnalysis === 'complete' ? 'text-red-400' : 'text-slate-500'}`} />
              </div>

              {aiAnalysis === 'complete' && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-[#0d1117] border border-gray-700/50 rounded-2xl shadow-2xl p-4 text-left z-50 animate-in slide-in-from-top-2">
                   <div className="font-mono text-xs space-y-1">
                     <div className="text-slate-400">&gt; AI Scan complete.</div>
                     <div className="text-red-400 font-bold">&gt; VELOCITY ANOMALY DETECTED</div>
                     <div className="text-red-400">&gt; AGE: &lt; 24 HOURS</div>
                     <div className="mt-2 p-2 bg-red-950/70 border border-red-800/60 rounded-xl text-red-300 font-bold text-center">
                       FRAUD PROBABILITY: 98.7%
                     </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
          <div className="bg-white/[0.04] p-6 rounded-2xl border border-white/[0.08] backdrop-blur-xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="text-red-400 w-5 h-5" /> 
              Reported Transaction
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Amount:</span> <span className="font-black text-lg text-white">₹{selectedTxn.amount}</span></div>
              <div><span className="text-slate-500">Date:</span> <span className="font-medium text-slate-300">{new Date(selectedTxn.date).toLocaleString()}</span></div>
              <div><span className="text-slate-500">Recipient UPI:</span> <span className="font-medium text-slate-300">{selectedTxn.upiId}</span></div>
              <div><span className="text-slate-500">Status:</span> <span className="text-red-400 font-bold">Under Review</span></div>
            </div>
            {selectedTxn.holdReason && (
              <div className="mt-4 p-4 bg-amber-950/40 border border-amber-800/40 rounded-xl">
                <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-1">User's Reason for Hold</div>
                <p className="text-sm text-slate-200">{selectedTxn.holdReason}</p>
              </div>
            )}
          </div>

          <div className="bg-white/[0.04] p-6 rounded-2xl border border-white/[0.08] backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-white">Recipient Account History</h2>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${accountStatus === 'Frozen' ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'}`}>
                Status: {accountStatus}
              </div>
            </div>
            
            <div className="mb-4 p-4 bg-white/[0.03] rounded-xl text-sm flex justify-between border border-white/[0.05]">
              <div><span className="text-slate-500">Name:</span> <span className="font-semibold text-white">{SUSPICIOUS_ACCOUNT_HISTORY.accountName}</span></div>
              <div><span className="text-slate-500">UPI ID:</span> <span className="font-semibold text-white">{SUSPICIOUS_ACCOUNT_HISTORY.upiId}</span></div>
            </div>

            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3">Recent Inbound Activity (Flagged Pattern)</h3>
            <div className="space-y-2">
              {SUSPICIOUS_ACCOUNT_HISTORY.transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3.5 border border-red-500/20 rounded-xl bg-red-950/20">
                  <div className="text-sm">
                    <div className="font-semibold text-white">From: {t.sender}</div>
                    <div className="text-slate-500 text-xs">{new Date(t.date).toLocaleString()}</div>
                  </div>
                  <div className="text-red-400 font-bold text-base">+₹{t.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0f1024] p-4 border-t border-white/[0.08] flex flex-wrap gap-4 relative">
          <button 
            onClick={handleContact}
            className="group flex-1 min-w-[180px] flex items-center justify-center gap-2 py-3.5 border border-white/10 bg-white/[0.05] hover:bg-white/10 rounded-2xl font-bold text-white transition-all"
          >
            <Phone className="w-4 h-4 text-violet-400" /> Contact Account
          </button>
          
          <button 
            onClick={handleApprove}
            className="group flex-1 min-w-[180px] flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <Check className="w-4 h-4" /> Release Funds
          </button>

          <button 
            onClick={handleFreeze}
            disabled={accountStatus === 'Frozen'}
            className="group flex-1 min-w-[180px] flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white rounded-2xl font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/30"
          >
            <Ban className="w-4 h-4" /> {accountStatus === 'Frozen' ? 'Account Frozen' : 'Freeze & Cancel'}
          </button>
        </div>

        {toastMessage && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-violet-700 text-white px-6 py-3 rounded-full shadow-xl z-50 text-sm font-medium animate-in slide-in-from-bottom-5">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#07080f] max-w-4xl mx-auto w-full text-white">
      <div className="bg-[#0f1024] p-5 flex justify-between items-center border-b border-white/[0.08]">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-white">
            <ShieldCheck className="w-6 h-6 text-violet-400" /> Bank Security Portal
          </h1>
          <div className="text-slate-400 text-xs mt-1">Fraud Investigation Queue</div>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="text-xs bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl font-bold transition-colors"
        >
          Exit Portal
        </button>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-sm uppercase tracking-widest font-bold text-slate-400">Active Alerts</h2>
          <div className="text-xs text-violet-400 font-bold bg-violet-500/15 border border-violet-500/30 px-3 py-1 rounded-full">
            {underReviewTxns.length} pending
          </div>
        </div>

        <div className="space-y-3">
          {underReviewTxns.map(txn => (
            <div 
              key={txn.id} 
              className="bg-white/[0.04] backdrop-blur-xl p-4 rounded-2xl border-l-4 border-l-red-500 border-white/[0.08] shadow-lg hover:bg-white/[0.07] cursor-pointer transition-all flex justify-between items-center"
              onClick={() => {
                setSelectedTxn(txn);
                setAiAnalysis('idle');
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className={`w-4 h-4 ${txn.status === 'Under Review' ? 'text-red-400' : 'text-amber-400'}`} />
                  <span className={`font-bold text-xs uppercase tracking-wider ${txn.status === 'Under Review' ? 'text-red-400' : 'text-amber-400'}`}>
                    {txn.status === 'Under Review' ? 'User Reported Fraud' : 'AI Safety Escrow Hold'}
                  </span>
                </div>
                <div className="font-semibold text-white text-sm">
                  {txn.isScamFlagged ? '⚠️ High-Risk Scammer Account' : 'Suspicious / Untrusted Payment'}
                </div>
                <div className="text-xs text-slate-400 mt-1">Target: {txn.upiId}</div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="font-black text-lg text-white">₹{txn.amount}</div>
                <div className="text-violet-400 text-xs font-semibold flex items-center gap-1">
                  Investigate <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}

          {underReviewTxns.length === 0 && (
            <div className="text-center py-16 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <div className="font-bold text-white">All clear!</div>
              <div className="text-slate-500 text-sm mt-1">No active fraud reports in the queue.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
