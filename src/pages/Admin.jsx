import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { SUSPICIOUS_ACCOUNT_HISTORY } from '../utils/mockData';
import { AlertCircle, Search, UserX, Phone, CheckCircle2, ChevronRight, Ban, ShieldCheck, Check, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { transactions, updateTransactionStatus, setBalance } = useAppContext();
  const navigate = useNavigate();
  const underReviewTxns = transactions.filter(t => t.status === 'Under Review');
  
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
      <div className="flex flex-col h-screen bg-slate-50 max-w-4xl mx-auto w-full">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelectedTxn(null); setAiAnalysis('idle'); }} className="text-slate-400 hover:text-white">Back to Queue</button>
            <h1 className="font-bold border-l pl-4 border-slate-700">Case #{selectedTxn.id.substring(4,10)}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider hidden sm:block">High Priority</span>
            
            <div className="relative flex items-center gap-2">
              {aiAnalysis === 'analyzing' && <span className="text-emerald-400 text-xs font-mono animate-pulse">Scanning...</span>}
              {aiAnalysis === 'complete' && <span className="text-red-400 text-xs font-mono font-bold">98.7% Fraud</span>}
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center relative cursor-help ${aiAnalysis === 'analyzing' ? 'bg-indigo-500/20' : aiAnalysis === 'complete' ? 'bg-red-500/20' : 'bg-slate-800'}`}>
                {aiAnalysis === 'analyzing' && <div className="absolute inset-0 border-2 border-t-emerald-400 border-transparent rounded-full animate-spin"></div>}
                <Activity className={`w-5 h-5 ${aiAnalysis === 'analyzing' ? 'text-emerald-400' : aiAnalysis === 'complete' ? 'text-red-400' : 'text-slate-500'}`} />
              </div>

              {/* Popover on complete */}
              {aiAnalysis === 'complete' && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 text-left z-50 animate-in slide-in-from-top-2">
                   <div className="font-mono text-xs space-y-1">
                     <div className="text-slate-400">&gt; AI Scan complete.</div>
                     <div className="text-red-400">&gt; VELOCITY ANOMALY DETECTED</div>
                     <div className="text-red-400">&gt; AGE: &lt; 24 HOURS</div>
                     <div className="mt-2 p-2 bg-red-950/50 border border-red-900/50 rounded text-red-400 font-bold">
                       FRAUD PROBABILITY: 98.7%
                     </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle className="text-red-500 w-5 h-5" /> 
              Reported Transaction
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Amount:</span> <span className="font-bold text-lg text-slate-800">₹{selectedTxn.amount}</span></div>
              <div><span className="text-slate-500">Date:</span> <span className="font-medium text-slate-800">{new Date(selectedTxn.date).toLocaleString()}</span></div>
              <div><span className="text-slate-500">Recipient UPI:</span> <span className="font-medium text-slate-800">{selectedTxn.upiId}</span></div>
              <div><span className="text-slate-500">Status:</span> <span className="text-red-600 font-medium">Under Review</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Recipient Account History</h2>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${accountStatus === 'Frozen' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                Status: {accountStatus}
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm flex justify-between">
              <div><span className="text-slate-500">Name:</span> <span className="font-medium">{SUSPICIOUS_ACCOUNT_HISTORY.accountName}</span></div>
              <div><span className="text-slate-500">UPI ID:</span> <span className="font-medium">{SUSPICIOUS_ACCOUNT_HISTORY.upiId}</span></div>
            </div>

            <h3 className="font-semibold text-sm text-slate-700 mb-3">Recent Inbound Activity (Flagged Pattern)</h3>
            <div className="space-y-2">
              {SUSPICIOUS_ACCOUNT_HISTORY.transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-red-50/30">
                  <div className="text-sm">
                    <div className="font-medium text-slate-800">From: {t.sender}</div>
                    <div className="text-slate-500 text-xs">{new Date(t.date).toLocaleString()}</div>
                  </div>
                  <div className="text-red-600 font-bold">+₹{t.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border-t border-slate-200 flex flex-wrap gap-4 relative">
          <button 
            onClick={handleContact}
            className="group flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50"
          >
            <Phone className="w-4 h-4" /> Contact Account
            <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg text-center z-50">
              Attempts to call the registered phone number to verify identity.
            </div>
          </button>
          
          <button 
            onClick={handleApprove}
            title="Overrides the AI safety hold, marks transaction as completed, and settles funds to the recipient."
            className="group flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold relative"
          >
            <Check className="w-4 h-4" /> Release Funds
            <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg text-center z-50">
              Overrides safety hold and permanently settles funds to the recipient.
            </div>
          </button>

          <button 
            onClick={handleFreeze}
            disabled={accountStatus === 'Frozen'}
            title="Cancels the pending transaction, refunds the sender, and permanently freezes the scammer's account."
            className="group flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            <Ban className="w-4 h-4" /> {accountStatus === 'Frozen' ? 'Account Frozen' : 'Freeze & Cancel'}
            {accountStatus !== 'Frozen' && (
              <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg text-center z-50 right-0">
                Cancels transaction and completely freezes the suspicious account.
              </div>
            )}
          </button>
        </div>

        {toastMessage && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl animate-in slide-in-from-bottom-5">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-4xl mx-auto w-full">
      <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" /> Bank Security Portal
          </h1>
          <div className="text-slate-400 text-sm mt-1">Fraud Investigation Queue</div>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Exit Portal
        </button>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-lg font-bold text-slate-800">Active Alerts</h2>
          <div className="text-sm text-slate-500 font-medium bg-slate-200 px-3 py-1 rounded-full">
            {underReviewTxns.length} pending
          </div>
        </div>

        <div className="space-y-4">
          {underReviewTxns.map(txn => (
            <div 
              key={txn.id} 
              className="bg-white p-4 rounded-xl border-l-4 border-l-red-500 shadow-sm hover:shadow-md cursor-pointer transition-shadow flex justify-between items-center"
              onClick={() => {
                setSelectedTxn(txn);
                setAiAnalysis('idle');
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="font-bold text-red-600 text-sm uppercase tracking-wide">User Reported Fraud</span>
                </div>
                <div className="font-medium text-slate-800">Potential Scam Payment</div>
                <div className="text-sm text-slate-500 mt-1">Target: {txn.upiId}</div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="font-bold text-lg text-slate-800">₹{txn.amount}</div>
                <div className="text-slate-400 text-xs flex items-center gap-1">
                  Investigate <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}

          {underReviewTxns.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <div className="font-bold text-slate-700">All clear!</div>
              <div className="text-slate-500 text-sm mt-1">No active fraud reports in the queue.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
