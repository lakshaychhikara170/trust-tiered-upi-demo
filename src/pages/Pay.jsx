import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { isScamRecipient } from '../utils/mockData';
import { ArrowLeft, Search, Scan as ScanIcon, Copy, CheckCircle2, FileText, Share2, Building2, ChevronDown, ShieldCheck, Activity, AlertCircle, ShieldAlert } from 'lucide-react';

export default function Pay() {
  const { merchants, trustHistory, threshold, balance, setBalance, addTransaction, addToTrustHistory, disputeTransaction, currentUser, setUpiPin, verifyUpiPin } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [recipientInput, setRecipientInput] = useState('');
  const [amount, setAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (location.state?.scannedRecipient) {
      setRecipientInput(location.state.scannedRecipient);
    } else if (location.state?.prefillScenario === 'high-risk') {
      setRecipientInput('scammer@fakepay');
      setAmount('8000');
    }
  }, [location.state]);

  // PIN Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [aiScanStatus, setAiScanStatus] = useState('idle');
  const [isAiExpanded, setIsAiExpanded] = useState(false);

  // Check risk dynamically based on input
  let recipient = merchants.find(c => c.upiId === recipientInput || c.name === recipientInput);
  let isMerchant = recipient?.verified || false;
  let finalUpiId = recipient ? recipient.upiId : recipientInput;
  const isScam = isScamRecipient(finalUpiId, recipient?.name || recipientInput);
  // A scammer is ALWAYS high-risk, even if somehow in contacts/history!
  const isHighRisk = isScam || (!isMerchant && !trustHistory.some(t => t.upiId === finalUpiId));

  useEffect(() => {
    if (recipientInput.length > 3) {
      setAiScanStatus('idle');
      setIsAiExpanded(false);
      const t1 = setTimeout(() => setAiScanStatus('scanning'), 800);
      const t2 = setTimeout(() => {
        setAiScanStatus(isHighRisk ? 'warning' : 'safe');
        setIsAiExpanded(true);
      }, 2000);
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
      let recipientName = recipient ? recipient.name : recipientInput;
      let finalUpiId = recipient ? recipient.upiId : recipientInput;
      const isScam = isScamRecipient(finalUpiId, recipientName);
      let isNew = !recipient && !trustHistory.some(t => t.upiId === finalUpiId);
      let isMerchant = recipient?.verified || false;

      const newTxn = {
        id: 'txn_' + Date.now(),
        recipient: isScam && !recipient ? 'Scammy User' : recipientName,
        upiId: finalUpiId,
        amount: numAmount,
        date: new Date().toISOString(),
        isMerchant,
        isScamFlagged: isScam
      };

      if (isScam) {
        // SCAMMER: NEVER COMPLETE PAYMENT! ENFORCE IMMEDIATE 24H SAFETY ESCROW HOLD!
        newTxn.status = 'Held';
        addTransaction(newTxn);
        setShowProcessingScreen(false);
        navigate(`/held/${newTxn.id}`);
      } else if (isMerchant || (!isNew)) {
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

  const getContactGradient = (index) => {
    const gradients = [
      'bg-gradient-to-br from-emerald-400 to-teal-600',
      'bg-gradient-to-br from-violet-400 to-indigo-600',
      'bg-gradient-to-br from-orange-400 to-rose-500',
      'bg-gradient-to-br from-sky-400 to-blue-600',
      'bg-gradient-to-br from-pink-400 to-fuchsia-600',
    ];
    return gradients[index % gradients.length];
  };

  // ─── PROCESSING SCREEN ────────────────────────────────────────────────────
  if (showProcessingScreen) {
    let recipient = allContacts.find(c => c.upiId === recipientInput || c.name === recipientInput);
    let isMerchant = recipient?.verified || false;
    let finalUpiId = recipient ? recipient.upiId : recipientInput;
    const isHighRisk = !isMerchant && !trustHistory.some(t => t.upiId === finalUpiId);
    return (
      <div className="flex flex-col h-screen bg-[#07080f] justify-center items-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl animate-pulse" />
        <div className="relative z-10 flex flex-col items-center gap-8 px-8">
          {/* Dual-spin spinner */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full border-[3px] border-violet-500/20 border-t-violet-500 animate-spin"
              style={{ animationDuration: '2s' }}
            />
            <div
              className="absolute inset-3 rounded-full border-[3px] border-indigo-400/20 border-t-indigo-400 animate-spin"
              style={{ animationDuration: '1s', animationDirection: 'reverse' }}
            />
            <div className="relative z-10">
              {isHighRisk
                ? <ShieldCheck className="w-9 h-9 text-emerald-400 animate-pulse" />
                : <Activity className="w-9 h-9 text-violet-400 animate-pulse" />}
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
              {isHighRisk ? 'AI Security Scan' : 'Processing Payment'}
            </h2>
            <div className="font-mono text-sm space-y-1.5 text-left">
              {isHighRisk ? (
                <>
                  <p className="text-emerald-400">&gt; Scanning recipient profile...</p>
                  <p className="text-emerald-400 animate-pulse" style={{ animationDelay: '0.8s' }}>&gt; Checking global fraud registries...</p>
                  <p className="text-slate-500 animate-pulse" style={{ animationDelay: '1.5s' }}>&gt; Cross-referencing trust network...</p>
                </>
              ) : (
                <>
                  <p className="text-violet-400">&gt; Connecting to secure gateway...</p>
                  <p className="text-violet-400 animate-pulse" style={{ animationDelay: '0.8s' }}>&gt; Encrypting transaction data...</p>
                  <p className="text-slate-500 animate-pulse" style={{ animationDelay: '1.5s' }}>&gt; Awaiting bank confirmation...</p>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium tracking-widest">PLEASE DO NOT CLOSE THIS SCREEN</p>
        </div>
      </div>
    );
  }

  // ─── SUCCESS SCREEN ───────────────────────────────────────────────────────
  if (isSuccess && successData) {
    return (
      <div className="flex flex-col min-h-screen bg-[#07080f] pb-6 relative overflow-hidden">
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="flex flex-col items-center pt-16 px-5 relative z-10">
          {/* Big emerald checkmark */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-2xl scale-150 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(52,211,153,0.3)]">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 stroke-[1.5]" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-400 mb-2 tracking-wide">Payment Successful</h1>
          <div className="text-5xl font-black text-white mb-8 tracking-tight flex items-baseline gap-1">
            <span className="text-violet-400 text-4xl">&#8377;</span>
            {successData.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-slate-600 text-xs uppercase tracking-widest mb-3 font-semibold">Paid to</div>
          {/* Recipient card */}
          <div className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 flex items-center gap-4 mb-8 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
              {getInitials(successData.recipient)}
            </div>
            <div>
              <div className="font-bold text-white text-base">{successData.recipient}</div>
              <div className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                {successData.upiId}
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
          {/* Receipt */}
          <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Transaction ID</span>
              <div className="flex items-center gap-2 text-white font-mono text-sm font-medium">
                T{Date.now().toString().slice(0, 10)}
                <Copy className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-violet-400 transition-colors" />
              </div>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Time</span>
              <span className="text-white text-sm font-medium">
                {new Date(successData.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">From</span>
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                SBI &bull;&bull;&bull;&bull; 4567
                <Copy className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-violet-400 transition-colors" />
              </div>
            </div>
          </div>
          {/* 24-Hour Safety Hold */}
          <div className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
              <ShieldAlert className="w-4 h-4" />
              24-Hour UPI Safety Window Active
            </div>
            <p className="text-xs text-amber-700/80 mb-4 leading-relaxed">
              Suspect fraud, unauthorized transfer, or sent to the wrong person? You can put this payment on immediate hold.
            </p>
            <button
              onClick={() => { disputeTransaction(successData.id); navigate(`/held/${successData.id}`); }}
              className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" /> Freeze &amp; Put Payment on Hold
            </button>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl font-black text-white text-base shadow-[0_8px_30px_rgba(139,92,246,0.4)] mb-5 cursor-pointer hover:shadow-[0_8px_40px_rgba(139,92,246,0.55)] transition-all active:scale-[0.98]"
          >
            Back to Dashboard
          </button>
          <div className="w-full bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 flex justify-between items-center">
            <div>
              <div className="font-bold text-white text-sm mb-1">Invite your friends</div>
              <div className="text-xs text-slate-500 mb-3 max-w-[150px] leading-relaxed">Get &#8377;51 when they make their first payment!</div>
              <button className="text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 py-1.5 px-4 rounded-lg hover:bg-violet-500/20 transition-colors">
                Invite Now
              </button>
            </div>
            <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center text-violet-400">
              <Share2 className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN PAY SCREEN ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#07080f]">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-4 bg-[#07080f] sticky top-0 z-20 border-b border-white/[0.05]">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-1 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-white tracking-wide">Send Money</h1>

        {/* AI SCANNER WIDGET */}
        <div className="relative flex items-center justify-end" style={{ minWidth: 40, minHeight: 40 }}>
          <div
            onClick={() => {
              if (aiScanStatus === 'warning' || aiScanStatus === 'safe') {
                setIsAiExpanded(!isAiExpanded);
              }
            }}
            className={`absolute top-0 right-0 z-50 transition-all duration-300 ease-out origin-top-right cursor-pointer ${
              !isAiExpanded ? 'w-10 h-10 rounded-full flex items-center justify-center' : 'w-72 rounded-2xl'
            }`}
          >
            {/* COLLAPSED ORB */}
            {!isAiExpanded && (
              <div className="relative w-10 h-10 flex items-center justify-center">
                {/* IDLE ghost */}
                {aiScanStatus === 'idle' && (
                  <div className="absolute inset-0 rounded-full bg-white/5 border border-white/10" />
                )}
                {/* SCANNING: dual opposite-spin rings */}
                {aiScanStatus === 'scanning' && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-1.5 rounded-full border-2 border-indigo-400/20 border-t-indigo-400 animate-spin" style={{ animationDuration: '0.9s', animationDirection: 'reverse' }} />
                  </>
                )}
                {/* SAFE: emerald ping */}
                {aiScanStatus === 'safe' && !isScam && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-emerald-400/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.4)]" />
                    <div className="absolute inset-0 rounded-full border border-emerald-400/40 animate-ping" />
                  </>
                )}
                {/* WARNING: double amber ping */}
                {aiScanStatus === 'warning' && !isScam && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-amber-400/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.4)]" />
                    <div className="absolute inset-0 rounded-full border border-amber-400/50 animate-ping" />
                    <div className="absolute inset-0 rounded-full border border-amber-400/25 animate-ping" style={{ animationDelay: '0.4s' }} />
                  </>
                )}
                {/* DANGER: triple red ping */}
                {isScam && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-red-500/15 border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.6)]" />
                    <div className="absolute inset-0 rounded-full border border-red-500/60 animate-ping" style={{ animationDelay: '0s' }} />
                    <div className="absolute inset-0 rounded-full border border-red-500/40 animate-ping" style={{ animationDelay: '0.3s' }} />
                    <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping" style={{ animationDelay: '0.6s' }} />
                  </>
                )}
                {/* Center icon */}
                <div className="relative z-10">
                  {isScam
                    ? <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                    : aiScanStatus === 'warning'
                      ? <ShieldCheck className="w-5 h-5 text-amber-400 animate-pulse" />
                      : aiScanStatus === 'safe'
                        ? <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        : <Activity className={`w-5 h-5 ${aiScanStatus === 'scanning' ? 'text-violet-400 animate-pulse' : 'text-white/20'}`} />
                  }
                </div>
              </div>
            )}

            {/* EXPANDED PANEL */}
            {isAiExpanded && (
              <div className="w-72 bg-[#0d1117] border border-gray-700/50 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-4">
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isScam ? 'bg-red-500 animate-pulse' : aiScanStatus === 'warning' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                    <span className={`font-bold text-[10px] uppercase tracking-[0.15em] ${isScam ? 'text-red-400' : aiScanStatus === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {isScam ? 'FRAUD ALERT' : 'AI Trust Analysis'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsAiExpanded(false); }}
                    className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white text-xs transition-all flex-shrink-0"
                  >
                    &#x2715;
                  </button>
                </div>
                <div className="font-mono text-[11px] space-y-2">
                  {isScam ? (
                    <>
                      <div className="flex justify-between"><span className="text-slate-500">&gt; RECIPIENT:</span><span className="text-red-400 font-bold animate-pulse">SUSPECTED SCAMMER</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">&gt; RISK SCORE:</span><span className="text-red-400 font-bold">99.4% &#8212; CRITICAL</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">&gt; COMPLAINTS:</span><span className="text-red-400">14 Active Flags</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">&gt; AI VERDICT:</span><span className="text-red-500 font-extrabold">DO NOT PAY</span></div>
                      <div className="mt-3 text-center text-[10px] font-bold text-red-300 bg-red-950/60 border border-red-800/50 py-2 px-3 rounded-xl animate-pulse tracking-wider">
                        &#9888; MANDATORY 24H SAFETY HOLD
                      </div>
                    </>
                  ) : aiScanStatus === 'warning' ? (
                    <>
                      <div className="flex justify-between"><span className="text-slate-500">&gt; RECIPIENT:</span><span className="text-amber-400 font-bold">NEW / UNKNOWN</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">&gt; CRIMINAL RECORD:</span><span className="text-emerald-400">NONE FOUND</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">&gt; TRUST HISTORY:</span><span className="text-slate-300">NO PRIOR TXNS</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">&gt; RISK SCORE:</span><span className="text-amber-400 font-bold">MODERATE</span></div>
                      <div className="mt-3 text-center text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-800/30 py-2 px-3 rounded-xl tracking-wider">
                        &#9889; THRESHOLD HOLD IF ABOVE LIMIT
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between"><span className="text-slate-500">&gt; RECIPIENT:</span><span className="text-emerald-400 font-bold">TRUSTED</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">&gt; NETWORK:</span><span className="text-emerald-400">VERIFIED</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">&gt; HISTORY:</span><span className="text-emerald-400">SECURE</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">&gt; RISK SCORE:</span><span className="text-emerald-400 font-bold">LOW</span></div>
                      <div className="mt-3 text-center text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 py-2 px-3 rounded-xl tracking-wider">
                        &#10003; CLEARED FOR TRANSFER
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto pb-32 px-4 pt-5">

        {/* SEARCH INPUT */}
        <div className="mb-6">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-4">
            <Search className="w-5 h-5 text-violet-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Enter UPI ID, Mobile or Name"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-white placeholder-slate-500 font-medium text-sm"
            />
            <ScanIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
          </div>
        </div>

        {/* CONTACT BUBBLES */}
        {!recipientInput && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-white text-sm tracking-wide">Contacts</h2>
              <span className="text-xs font-semibold text-violet-400 cursor-pointer hover:text-violet-300 transition-colors">View All</span>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
              {allContacts.map((contact, idx) => (
                <div
                  key={contact.id}
                  className="flex flex-col items-center gap-2 min-w-max cursor-pointer group"
                  onClick={() => setRecipientInput(contact.upiId)}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${getContactGradient(idx)} shadow-lg group-hover:scale-105 transition-transform`}>
                    {getInitials(contact.name)}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-white">{contact.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-500">@{contact.upiId.split('@')[0]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AMOUNT INPUT */}
        <div className="mb-8">
          <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-5">Enter Amount</div>
          <div className="flex flex-col items-center mb-2">
            <div className="flex items-center justify-center">
              <span className="text-4xl font-black text-violet-400 mr-2 leading-none">&#8377;</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="text-6xl font-black text-white bg-transparent border-none outline-none text-center leading-none placeholder-slate-700"
                style={{ width: amount ? `${Math.max(1, amount.length) * 0.75}em` : '2em', minWidth: '2em', maxWidth: '100%' }}
              />
            </div>
            <div className={`h-0.5 mt-3 rounded-full transition-all duration-500 ${amount ? 'w-32 bg-gradient-to-r from-violet-500 to-indigo-500' : 'w-16 bg-white/10'}`} />
          </div>
          {/* Quick-amount chips */}
          <div className="flex gap-2.5 mt-6 overflow-x-auto pb-1 scrollbar-hide justify-center">
            {['100', '500', '1000', '2000'].map(val => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={`min-w-max px-4 py-2 rounded-full text-sm font-bold border transition-all active:scale-95 cursor-pointer ${
                  amount === val
                    ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                }`}
              >
                + &#8377;{val}
              </button>
            ))}
          </div>
        </div>

        {/* BANK CARD */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 flex items-center justify-between mb-6 backdrop-blur-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-0.5">From</div>
              <div className="text-sm font-bold text-white">State Bank of India &bull;&bull;&bull;&bull; 4567</div>
              <div className="text-xs font-semibold text-emerald-400 mt-0.5 cursor-pointer hover:text-emerald-300 transition-colors">Check Balance</div>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-slate-600" />
        </div>
      </div>

      {/* FIXED BOTTOM PAY BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#07080f]/90 backdrop-blur-xl px-4 pt-3 pb-6 border-t border-white/[0.05]">
        <button
          onClick={handlePayClick}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_8px_30px_rgba(139,92,246,0.45)] text-white font-black text-lg py-5 rounded-2xl flex justify-center items-center gap-2.5 cursor-pointer hover:shadow-[0_8px_40px_rgba(139,92,246,0.6)] hover:from-violet-500 hover:to-indigo-500 transition-all active:scale-[0.98]"
        >
          <ShieldCheck className="w-5 h-5 opacity-80" />
          Pay Securely
        </button>
        <div className="text-center mt-2.5">
          <span className="text-[10px] text-slate-600 font-semibold tracking-widest uppercase">Powered by UPI &middot; 256-bit Encrypted</span>
        </div>
      </div>

      {/* PIN MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="bg-[#0f1024] border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-violet-400" />
              </div>
            </div>
            <h2 className="text-xl font-black text-white text-center mb-2">
              {currentUser?.hasUpiPin ? 'Enter UPI PIN' : 'Set Your UPI PIN'}
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
              {currentUser?.hasUpiPin
                ? `Enter your 4-digit PIN to pay \u20b9${amount}`
                : 'Since this is your first payment, please set a 4-digit PIN to secure future transactions.'}
            </p>
            {pinError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 text-center font-medium">
                {pinError}
              </div>
            )}
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full bg-white/5 border border-violet-500/40 focus:border-violet-500/80 text-white text-4xl tracking-[1em] text-center rounded-2xl py-4 px-6 outline-none mb-6 font-black transition-colors"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPinModal(false)}
                disabled={isProcessing}
                className="flex-1 py-4 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitPayment}
                disabled={isProcessing || pinInput.length < 4}
                className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black rounded-xl disabled:opacity-40 transition-all shadow-[0_4px_20px_rgba(139,92,246,0.35)] cursor-pointer"
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

