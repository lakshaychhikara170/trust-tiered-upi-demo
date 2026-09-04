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

  // Time remaining mock logic (starts at 24:00:00)
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!txn) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
        <AlertTriangle className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Transaction Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-xs">
          This transaction may have been deleted or the session was refreshed. 
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
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
    // Save the user's reason to the transaction — visible to admin reviewer
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
      <div className="h-screen flex flex-col items-center justify-center bg-red-50 text-center p-6">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Investigation Started</h1>
        <p className="text-gray-600 mb-8 max-w-sm">
          We have frozen the funds. Our security team is reviewing this transaction and will update you shortly.
        </p>
        <div className="w-full space-y-3">
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
          >
            Return to Dashboard
          </button>
          <button 
            onClick={() => navigate('/admin')}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg flex justify-center items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" /> Simulate Bank Admin Review
          </button>
        </div>
      </div>
    );
  }

  if (txn.status === 'Completed') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-emerald-50 text-center p-6">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Authorized</h1>
        <p className="text-gray-600 mb-8 max-w-sm">
          You have successfully overridden the safety hold. ₹{txn.amount.toLocaleString('en-IN')} has been sent to {txn.recipient}.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isScam = isScamRecipient(txn.upiId, txn.recipient) || txn.isScamFlagged;

  return (
    <div className={`flex flex-col h-screen overflow-y-auto ${isScam ? 'bg-red-50' : 'bg-amber-50'}`}>
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">{isScam ? 'Fraud Protection Alert' : 'Security Hold'}</h1>
      </div>

      <div className="p-6 flex flex-col items-center text-center mt-4 pb-10">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${isScam ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-amber-100 text-amber-500'}`}>
          {isScam ? <ShieldAlert className="w-10 h-10 stroke-[2.5]" /> : <Clock className="w-10 h-10" />}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isScam ? 'AI Intercepted: Scam Suspect' : 'Payment Held for Safety'}
        </h2>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed max-w-sm">
          {isScam ? (
            <span className="text-red-700 font-medium">
              Our AI flagged <b>{txn.upiId}</b> with 14 fraud complaints. To protect your money, the ₹{txn.amount.toLocaleString('en-IN')} transfer has been <b>frozen in 24-hour escrow</b>.
            </span>
          ) : (
            <>
              You are sending ₹{txn.amount.toLocaleString('en-IN')} to a new recipient ({txn.upiId}). This exceeds your safety threshold. The funds will be held for 24 hours before settling.
            </>
          )}
        </p>

        <div className={`bg-white p-5 rounded-2xl shadow-sm w-full mb-6 border ${isScam ? 'border-red-200' : 'border-amber-200'}`}>
          <div className={`font-bold mb-1 text-sm ${isScam ? 'text-red-600' : 'text-amber-600'}`}>
            {isScam ? 'Safety Escrow Remaining' : 'Time Remaining'}
          </div>
          <div className="text-4xl font-mono text-gray-800 tracking-wider">
            {formatTime(timeLeft)}
          </div>
        </div>

        {!showReportForm ? (
          <div className="w-full mt-auto space-y-3">
            <button 
              onClick={() => setShowReportForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-200 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-5 h-5" />
              Report Fraud & Cancel Payment
            </button>
            
            <button 
              onClick={() => navigate('/admin')}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors cursor-pointer text-sm"
            >
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Simulate Bank Admin Review
            </button>

            {!isScam && (
              <button 
                onClick={handleAuthorize}
                className="w-full text-gray-500 font-bold py-2.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer text-sm"
              >
                I authorize this payment anyway
              </button>
            )}

            <button 
              onClick={() => navigate('/')}
              className="w-full text-gray-600 font-medium py-2 hover:underline transition-all cursor-pointer text-xs"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={submitReport} className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-200 text-left animate-in slide-in-from-bottom-4">
            <h3 className="font-bold text-gray-800 mb-4">Why are you reporting this?</h3>
            <select 
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl mb-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="" disabled>Select a reason...</option>
              <option value="Did not recognize sender">Didn't recognize recipient</option>
              <option value="Suspected scam">Suspected scam / impersonation</option>
              <option value="Wrong recipient">Wrong recipient entered</option>
            </select>

            {/* Reason for hold — shown to bank admin reviewer */}
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Additional details <span className="text-gray-400 font-normal">(visible to bank reviewer)</span>
            </label>
            <textarea
              value={holdNote}
              onChange={(e) => setHoldNote(e.target.value)}
              placeholder="Describe what happened, e.g. 'Received a call from someone claiming to be my bank asking me to send money urgently...'"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-xl mb-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
            />
            
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowReportForm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-md"
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
