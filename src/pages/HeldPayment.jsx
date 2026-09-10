import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { isScamRecipient } from '../utils/mockData';
import { ArrowLeft, AlertTriangle, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function HeldPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, updateTransactionStatus, setBalance, addToTrustHistory, addHoldReason } = useAppContext();
  
  const txn = transactions.find(t => t.id === id);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [holdNote, setHoldNote] = useState('');
  const [isReported, setIsReported] = useState(false);

  // Calculate remaining seconds of the 24h window from when the payment was made
  const getInitialTimeLeft = () => {
    if (!txn?.date) return 24 * 60 * 60;
    const paymentTime = new Date(txn.date).getTime();
    const elapsed = Math.floor((Date.now() - paymentTime) / 1000);
    const remaining = 24 * 60 * 60 - elapsed;
    return remaining > 0 ? remaining : 0;
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!txn) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#07080f] text-center p-6">
        <AlertTriangle className="w-16 h-16 text-slate-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Transaction Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-xs text-sm">
          This transaction may have been deleted or the session was refreshed. 
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-violet-500/30 hover:opacity-90 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const submitReport = (e) => {
    e.preventDefault();
    if (holdNote.trim()) {
      addHoldReason(id, holdNote.trim());
    } else if (reportReason) {
      addHoldReason(id, reportReason);
    }
    updateTransactionStatus(id, 'Under Review');
    setIsReported(true);
  };

  const handleAuthorize = () => {
    updateTransactionStatus(id, 'Completed');
    setBalance(prev => prev - txn.amount);
    addToTrustHistory({ id: 't_' + Date.now(), name: txn.recipient, upiId: txn.upiId });
  };

  if (isReported || txn.status === 'Under Review') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#07080f] text-center p-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-24 h-24 bg-red-500/15 border border-red-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse">
          <ShieldAlert className="w-12 h-12 text-red-400 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-black text-white mb-3">Investigation Started</h1>
        <p className="text-slate-400 text-sm mb-8 max-w-sm leading-relaxed">
          We have frozen the funds. Our security team is reviewing this transaction and will update you shortly.
        </p>
        <div className="w-full space-y-3 max-w-sm">
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold py-4 rounded-2xl hover:opacity-95 transition-all shadow-lg shadow-red-600/30"
          >
            Return to Dashboard
          </button>
          <button 
            onClick={() => navigate('/admin')}
            className="w-full bg-white/[0.06] border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all flex justify-center items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" /> Simulate Bank Admin Review
          </button>
        </div>
      </div>
    );
  }

  if (txn.status === 'Completed') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#07080f] text-center p-6 relative overflow-hidden">
        <div className="w-24 h-24 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-black text-white mb-3">Payment Authorized</h1>
        <p className="text-slate-400 text-sm mb-8 max-w-sm leading-relaxed">
          You have successfully overridden the safety hold. ₹{txn.amount.toLocaleString('en-IN')} has been sent to <span className="text-white font-bold">{txn.recipient}</span>.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-emerald-500/30 hover:opacity-95 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isScam = isScamRecipient(txn.upiId, txn.recipient) || txn.isScamFlagged;

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-[#07080f] text-white">
      <div className="bg-[#07080f]/90 backdrop-blur-md p-4 flex items-center gap-4 border-b border-white/[0.08] sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">{isScam ? 'Fraud Protection Alert' : 'Security Hold'}</h1>
      </div>

      <div className="p-6 flex flex-col items-center text-center mt-2 pb-10">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${isScam ? 'bg-red-500/20 border border-red-500/40 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]'}`}>
          {isScam ? <ShieldAlert className="w-10 h-10 stroke-[2.5]" /> : <Clock className="w-10 h-10 stroke-[2.5]" />}
        </div>
        
        <h2 className="text-2xl font-black text-white mb-3">
          {isScam ? 'AI Intercepted: Scam Suspect' : 'Payment Held for Safety'}
        </h2>
        <p className="text-slate-400 mb-6 text-sm leading-relaxed max-w-sm">
          {isScam ? (
            <span className="text-red-400 font-medium">
              Our AI flagged <b className="text-white">{txn.upiId}</b> with 14 fraud complaints. To protect your money, the ₹{txn.amount.toLocaleString('en-IN')} transfer has been <b>frozen in 24-hour escrow</b>.
            </span>
          ) : (
            <>
              You are sending ₹{txn.amount.toLocaleString('en-IN')} to a new recipient ({txn.upiId}). This exceeds your safety threshold. The funds will be held for 24 hours before settling.
            </>
          )}
        </p>

        <div className={`p-5 rounded-2xl w-full mb-6 border backdrop-blur-xl ${isScam ? 'bg-red-950/40 border-red-800/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-amber-950/40 border-amber-800/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'}`}>
          <div className={`font-bold mb-1 text-xs uppercase tracking-widest ${isScam ? 'text-red-400' : 'text-amber-400'}`}>
            {isScam ? 'Safety Escrow Remaining' : 'Time Remaining'}
          </div>
          <div className="text-4xl font-black font-mono text-white tracking-wider">
            {formatTime(timeLeft)}
          </div>
        </div>

        {!showReportForm ? (
          <div className="w-full mt-auto space-y-3">
            <button 
              onClick={() => setShowReportForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-600/30 transition-all active:scale-[0.98] cursor-pointer"
            >
              <AlertTriangle className="w-5 h-5" />
              Report Fraud & Cancel Payment
            </button>
            
            <button 
              onClick={() => navigate('/admin')}
              className="w-full flex items-center justify-center gap-2 bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white font-bold py-4 rounded-2xl transition-all cursor-pointer text-sm"
            >
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Simulate Bank Admin Review
            </button>

            {!isScam && (
              <button 
                onClick={handleAuthorize}
                className="w-full text-slate-400 font-bold py-2.5 hover:text-white transition-all cursor-pointer text-sm"
              >
                I authorize this payment anyway
              </button>
            )}

            <button 
              onClick={() => navigate('/')}
              className="w-full text-slate-500 font-medium py-2 hover:text-slate-300 transition-all cursor-pointer text-xs"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={submitReport} className="w-full bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 text-left animate-in slide-in-from-bottom-4">
            <h3 className="font-bold text-white mb-4 text-base">Why are you reporting this?</h3>
            <select 
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-3.5 border border-white/10 rounded-xl mb-4 bg-white/[0.06] text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              required
            >
              <option value="" disabled className="bg-[#0f1024]">Select a reason...</option>
              <option value="Did not recognize sender" className="bg-[#0f1024]">Didn't recognize recipient</option>
              <option value="Suspected scam" className="bg-[#0f1024]">Suspected scam / impersonation</option>
              <option value="Wrong recipient" className="bg-[#0f1024]">Wrong recipient entered</option>
            </select>

            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Additional details <span className="text-slate-500 font-normal text-none">(visible to reviewer)</span>
            </label>
            <textarea
              value={holdNote}
              onChange={(e) => setHoldNote(e.target.value)}
              placeholder="Describe what happened, e.g. 'Received a call asking to send money urgently...'"
              rows={3}
              className="w-full p-3.5 border border-white/10 rounded-xl mb-4 bg-white/[0.06] text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none placeholder:text-slate-600"
            />
            
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowReportForm(false)}
                className="flex-1 py-3.5 bg-white/[0.06] text-slate-300 font-bold rounded-xl hover:bg-white/[0.1]"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3.5 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/30"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
