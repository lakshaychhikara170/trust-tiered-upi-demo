import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, MoreHorizontal, Search, Scan as ScanIcon, Plus, Copy, CheckCircle2, FileText, Share2, Building2, ChevronDown, ShieldCheck, Activity, AlertCircle } from 'lucide-react';

export default function Pay() {
  const { merchants, trustHistory, threshold, balance, setBalance, addTransaction, addToTrustHistory, currentUser, setUpiPin, verifyUpiPin } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [recipientInput, setRecipientInput] = useState('');
  
  useEffect(() => {
    if (location.state?.scannedRecipient) {
      setRecipientInput(location.state.scannedRecipient);
    } else if (location.state?.prefillScenario === 'high-risk') {
      setRecipientInput('scammer@fakepay');
      setAmount('45000');
    }
  }, [location.state]);
  const [amount, setAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // PIN Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [aiScanStatus, setAiScanStatus] = useState('idle'); // idle, scanning, safe, warning
  const [isAiExpanded, setIsAiExpanded] = useState(false);

  // Check risk dynamically based on input
  let recipient = merchants.find(c => c.upiId === recipientInput || c.name === recipientInput);
  let isMerchant = recipient?.verified || false;
  let finalUpiId = recipient ? recipient.upiId : recipientInput;
  const isHighRisk = !isMerchant && !trustHistory.some(t => t.upiId === finalUpiId);

  useEffect(() => {
    if (recipientInput.length > 3) {
      setAiScanStatus('idle');
      setIsAiExpanded(false);
      const t1 = setTimeout(() => setAiScanStatus('scanning'), 1000);
      const t2 = setTimeout(() => {
        setAiScanStatus(isHighRisk ? 'warning' : 'safe');
        setIsAiExpanded(true);
      }, 2500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setAiScanStatus('idle');
      setIsAiExpanded(false);
    }
  }, [recipientInput, isHighRisk]);
  
  // Processing Animation State
  const [showProcessingScreen, setShowProcessingScreen] = useState(false);

  const allContacts = [...merchants, ...trustHistory];

  const handlePayClick = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return alert('Invalid amount');
    if (numAmount > balance) return alert('Insufficient balance');
    if (!recipientInput) return alert('Please enter or select a recipient');
    
    // Open PIN Modal instead of paying immediately
    setPinInput('');
    setPinError('');
    setShowPinModal(true);
  };

  const submitPayment = async () => {
    setIsProcessing(true);
    setPinError('');

    if (currentUser.hasUpiPin) {
      const isValid = await verifyUpiPin(pinInput);
      if (!isValid) {
        setPinError('Incorrect UPI PIN');
        setIsProcessing(false);
        return;
      }
    } else {
      if (pinInput.length < 4) {
        setPinError('PIN must be at least 4 digits');
        setIsProcessing(false);
        return;
      }
      const isSet = await setUpiPin(pinInput);
      if (!isSet) {
        setPinError('Failed to set PIN');
        setIsProcessing(false);
        return;
      }
    }

    // PIN is correct. Close modal and show processing screen.
    setShowPinModal(false);
    setShowProcessingScreen(true);

    // Fake network lag / processing time
    setTimeout(() => {
      const numAmount = parseFloat(amount);
      let recipient = allContacts.find(c => c.upiId === recipientInput || c.name === recipientInput);
      let isNew = !recipient;
      let isMerchant = recipient?.verified || false;
      let recipientName = recipient ? recipient.name : recipientInput;
      let finalUpiId = recipient ? recipient.upiId : recipientInput;

      const newTxn = {
        id: 'txn_' + Date.now(),
        recipient: recipientName,
        upiId: finalUpiId,
        amount: numAmount,
        date: new Date().toISOString(),
        isMerchant
      };

      if (isMerchant || (!isNew)) {
        newTxn.status = 'Completed';
        setBalance(b => b - numAmount);
        addTransaction(newTxn);
        setSuccessData(newTxn);
        setShowProcessingScreen(false);
        setIsSuccess(true);
      } else {
        if (numAmount > threshold) {
          newTxn.status = 'Held';
          addTransaction(newTxn);
          setShowProcessingScreen(false);
          navigate(`/held/${newTxn.id}`);
        } else {
          newTxn.status = 'Completed';
          setBalance(b => b - numAmount);
          addTransaction(newTxn);
          addToTrustHistory({ id: 't_' + Date.now(), name: recipientName, upiId: finalUpiId });
          setSuccessData(newTxn);
          setShowProcessingScreen(false);
          setIsSuccess(true);
        }
      }
      setIsProcessing(false);
    }, 2500); // 2.5 second delay
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getContactColors = (index) => {
    const colors = [
      'bg-green-500', 'bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500'
    ];
    return colors[index % colors.length];
  };

  if (showProcessingScreen) {
    let recipient = allContacts.find(c => c.upiId === recipientInput || c.name === recipientInput);
    let isMerchant = recipient?.verified || false;
    let finalUpiId = recipient ? recipient.upiId : recipientInput;
    const isHighRisk = !isMerchant && !trustHistory.some(t => t.upiId === finalUpiId);
    return (
      <div className={`flex flex-col h-screen justify-center items-center relative overflow-hidden ${isHighRisk ? 'bg-slate-900' : 'bg-indigo-600'}`}>
        {/* Pulsing background effects */}
        <div className={`absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20 animate-pulse ${isHighRisk ? 'bg-emerald-500' : 'bg-white'}`}></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-8 relative">
            <div className={`w-24 h-24 border-[6px] border-t-transparent rounded-full animate-spin ${isHighRisk ? 'border-emerald-500/30 border-t-emerald-500' : 'border-indigo-400/30 border-t-white'}`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              {isHighRisk ? <ShieldCheck className="w-10 h-10 text-emerald-500 animate-pulse" /> : <div className="w-8 h-8 bg-white rounded-full"></div>}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {isHighRisk ? 'AI Security Scan' : 'Processing Payment'}
          </h2>
          <p className={`font-medium text-center px-8 ${isHighRisk ? 'text-slate-400 font-mono' : 'text-indigo-200'}`}>
            {isHighRisk ? (
              <>
                <span className="block mb-1 text-emerald-400">&gt; Scanning recipient profile...</span>
                <span className="block mb-1 text-emerald-400 animate-pulse" style={{ animationDelay: '1s' }}>&gt; Checking global registries...</span>
              </>
            ) : (
              <>
                Connecting securely to your bank...<br />
                Please do not close this screen.
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess && successData) {
    return (
      <div className="flex flex-col min-h-screen bg-white pb-6 relative overflow-hidden">
        {/* Confetti mock elements */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-purple-400 rotate-45"></div>
        <div className="absolute top-20 right-20 w-3 h-3 bg-green-400 rounded-full"></div>
        <div className="absolute top-40 left-24 w-2 h-2 bg-orange-400 rotate-12"></div>
        <div className="absolute top-16 right-10 w-2 h-2 bg-blue-400 rotate-45"></div>
        
        {/* Status Area */}
        <div className="flex flex-col items-center pt-20 px-6 mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-white stroke-[2.5]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <div className="text-4xl font-bold text-gray-900 mb-8">
            ₹{successData.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          
          <div className="text-gray-500 text-sm mb-3">Paid to</div>
          
          <div className="w-full border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm shadow-gray-50 mb-8">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {getInitials(successData.recipient)}
            </div>
            <div>
              <div className="font-bold text-gray-900">{successData.recipient}</div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                {successData.upiId} 
                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center ml-1">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full text-sm space-y-4 text-gray-600 border-t border-gray-100 pt-6 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Transaction ID</span>
              <div className="flex items-center gap-2 font-medium text-gray-900">
                T{Date.now().toString().slice(0,10)} <Copy className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Time</span>
              <span className="font-medium text-gray-900">
                {new Date(successData.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">From</span>
              <div className="flex items-center gap-2 font-medium text-gray-900">
                SBI •••• 4567 <Copy className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full mb-6">
            <button className="flex-1 py-3.5 border border-gray-200 rounded-xl font-bold text-gray-700">
              View Details
            </button>
            <button onClick={() => navigate('/')} className="flex-1 py-3.5 bg-indigo-600 rounded-xl font-bold text-white shadow-md shadow-indigo-200">
              Back to Home
            </button>
          </div>

          <div className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <div className="font-bold text-gray-900 text-sm mb-1">Invite your friends</div>
              <div className="text-xs text-gray-500 mb-3 max-w-[140px]">Get ₹51 when they make their first payment!</div>
              <button className="text-xs font-bold text-indigo-600 bg-white border border-indigo-200 py-1.5 px-4 rounded-lg shadow-sm">
                Invite Now
              </button>
            </div>
            <div className="w-20 h-20 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-400">
              <Share2 className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Send Money</h1>
        
        {/* Expanding AI Tab */}
        <div className="relative flex items-center justify-end w-10 h-10">
          <div 
            onClick={() => {
              if (aiScanStatus === 'warning' || aiScanStatus === 'safe') {
                setIsAiExpanded(!isAiExpanded);
              }
            }}
            className={`absolute top-0 right-0 z-50 overflow-hidden transition-all duration-300 ease-out origin-top-right ${
              !isAiExpanded 
                ? 'w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md hover:scale-110 active:scale-95' 
                : 'w-64 rounded-xl bg-gray-900 shadow-2xl p-3 border border-gray-800 cursor-pointer hover:border-gray-700'
            }`}
          >
            {/* Unexpanded / Icon State */}
            {!isAiExpanded && (
              <div className="relative w-full h-full flex items-center justify-center rounded-full">
                {/* Ping rings to make it feel alive */}
                {aiScanStatus === 'warning' && <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-30"></div>}
                {aiScanStatus === 'safe' && <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-30"></div>}
                
                <div className={`relative z-10 w-full h-full flex items-center justify-center rounded-full transition-colors ${
                  aiScanStatus === 'scanning' ? 'bg-indigo-100' : 
                  aiScanStatus === 'warning' ? 'bg-amber-100' : 
                  aiScanStatus === 'safe' ? 'bg-emerald-100' : 'bg-gray-100'
                }`}>
                  {aiScanStatus === 'scanning' && <div className="absolute inset-0 border-[3px] border-t-indigo-600 border-transparent rounded-full animate-spin"></div>}
                  
                  {aiScanStatus === 'warning' ? <ShieldCheck className="w-5 h-5 text-amber-600 animate-pulse" /> :
                   aiScanStatus === 'safe' ? <ShieldCheck className="w-5 h-5 text-emerald-600" /> :
                   <Activity className={`w-5 h-5 ${aiScanStatus === 'scanning' ? 'text-indigo-600 animate-pulse' : 'text-gray-400'}`} />}
                </div>
              </div>
            )}

            {/* Expanded State (Rectangle Tab) */}
            {isAiExpanded && (
              <div className="w-full flex flex-col animate-in fade-in zoom-in-95 duration-500 delay-150">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <Activity className={`w-4 h-4 ${aiScanStatus === 'warning' ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`} />
                    <span className="font-bold text-[11px] text-gray-300 uppercase tracking-widest">
                      AI Trust Analysis
                    </span>
                  </div>
                  <div className="w-5 h-5 rounded-full hover:bg-gray-800 flex items-center justify-center text-gray-500">
                    &times;
                  </div>
                </div>
                
                <div className="font-mono text-[10px] space-y-1.5 mt-1">
                  {aiScanStatus === 'warning' ? (
                    <>
                      <div className="text-amber-400 font-bold flex justify-between"><span>&gt; RECIPIENT:</span> <span>UNKNOWN</span></div>
                      <div className="text-gray-400 flex justify-between"><span>&gt; ACCT AGE:</span> <span>&lt; 24 HOURS</span></div>
                      <div className="text-red-400 flex justify-between"><span>&gt; HISTORY:</span> <span>FLAGGED (3x)</span></div>
                      <div className="mt-3 text-center text-[10px] font-bold text-amber-500 bg-amber-950/40 border border-amber-900/30 p-1.5 rounded">
                        HOLD RULES ACTIVATED
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-emerald-400 font-bold flex justify-between"><span>&gt; RECIPIENT:</span> <span>TRUSTED</span></div>
                      <div className="text-gray-400 flex justify-between"><span>&gt; NETWORK:</span> <span>VERIFIED</span></div>
                      <div className="text-gray-400 flex justify-between"><span>&gt; HISTORY:</span> <span>SECURE</span></div>
                      <div className="mt-3 text-center text-[10px] font-bold text-emerald-500 bg-emerald-950/40 border border-emerald-900/30 p-1.5 rounded">
                        CLEARED FOR TRANSFER
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Search */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 p-3.5 rounded-2xl text-gray-500">
            <Search className="w-5 h-5" />
            <input 
              type="text" 
              placeholder="Enter UPI ID, Mobile or Name"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-gray-900 placeholder-gray-400 font-medium"
            />
            <ScanIcon className="w-5 h-5 text-gray-700" />
          </div>
        </div>

        {/* Contacts Horizontal List */}
        {!recipientInput && (
          <div className="px-5 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Contacts</h2>
              <span className="text-xs font-semibold text-gray-500 cursor-pointer">View All</span>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
              {allContacts.map((contact, idx) => (
                <div key={contact.id} className="flex flex-col items-center gap-2 min-w-max cursor-pointer" onClick={() => setRecipientInput(contact.upiId)}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${getContactColors(idx)}`}>
                    {getInitials(contact.name)}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-900">{contact.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-gray-500">@{contact.upiId.split('@')[0]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-5">
          <div className="text-sm text-gray-500 font-medium mb-4">Enter Amount</div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center text-5xl font-bold text-gray-900 tracking-tight">
              <span className="text-4xl text-gray-400 mr-1">₹</span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent border-none outline-none"
                style={{ width: amount ? `${Math.max(1, amount.length) * 0.7}em` : '2em' }}
              />
            </div>
            <button className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
              <FileText className="w-4 h-4" /> Add Note
            </button>
          </div>

          <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
            {['100', '500', '1000', '2000'].map(val => (
              <button 
                key={val}
                onClick={() => setAmount(val)}
                className="min-w-max px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 shadow-sm"
              >
                + ₹{val}
              </button>
            ))}
          </div>

          <div className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">From</div>
                <div className="text-sm font-bold text-gray-900">State Bank of India •••• 4567</div>
                <div className="text-xs font-semibold text-emerald-600 mt-0.5 cursor-pointer">Check Balance</div>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-5 pt-2 flex flex-col gap-4">
        <button 
          onClick={handlePayClick}
          className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-indigo-200 flex justify-center items-center gap-2"
        >
          <div className="border-2 border-white rounded pl-1 pr-0.5 pb-0.5 pt-0.5 text-xs opacity-80">
            <span className="block border-b-2 border-white w-2.5 h-1"></span>
          </div>
          Pay Securely
        </button>
        <div className="text-center">
          <span className="text-[10px] text-gray-400 font-medium">Powered by UPI</span>
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              {currentUser?.hasUpiPin ? 'Enter UPI PIN' : 'Set your UPI PIN'}
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              {currentUser?.hasUpiPin 
                ? `Enter your 4-digit PIN to pay ₹${amount}` 
                : 'Since this is your first payment, please set a 4-digit PIN to secure future transactions.'}
            </p>
            
            {pinError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 text-center">{pinError}</div>}
            
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full text-center text-3xl tracking-[1em] font-bold p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-6"
              autoFocus
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={submitPayment}
                disabled={isProcessing || pinInput.length < 4}
                className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
