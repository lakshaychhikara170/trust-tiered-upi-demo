import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Settings, ShieldCheck, CheckCircle2, Clock, AlertCircle, Bell, Eye, Plus, FileText, QrCode, User, Smartphone, CreditCard, Send, MoreHorizontal, Home as HomeIcon, History, ChevronDown, AlertTriangle, ShieldAlert, Sun, Moon } from 'lucide-react';

export default function Home() {
  const { balance, setBalance, transactions, currentUser, logout, disputeTransaction, theme, toggleTheme } = useAppContext();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  
  // States
  const [hideBalance, setHideBalance] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState({ name: 'State Bank of India', last4: '4567', icon: 'SBI' });
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const isLight = theme === 'light';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddMoney = () => {
    setShowAddMoneyModal(true);
    setAddAmount('');
  };

  const submitAddMoney = () => {
    const numAmount = parseInt(addAmount, 10);
    if (!numAmount || numAmount <= 0) {
      showToast('Please enter a valid amount');
      return;
    }
    setBalance(prev => prev + numAmount);
    showToast(`₹${numAmount.toLocaleString('en-IN')} added to wallet!`);
    setShowAddMoneyModal(false);
    setAddAmount('');
  };

  const scrollToTransactions = () => {
    document.getElementById('recent-transactions')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return isLight ? 'text-emerald-600' : 'text-emerald-400';
      case 'Held': return isLight ? 'text-amber-600 font-bold' : 'text-amber-400 font-bold';
      case 'Under Review': return isLight ? 'text-red-600 font-bold' : 'text-red-400 font-bold';
      case 'Cancelled': return 'text-slate-400 line-through';
      default: return 'text-slate-400';
    }
  };

  const quickActionColors = [
    'from-violet-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-purple-500 to-violet-600',
    'from-yellow-500 to-orange-500',
    'from-slate-500 to-slate-600',
  ];

  return (
    <div className={`flex flex-col h-full pb-24 relative overflow-y-auto scrollbar-hide transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#07080f] text-white'
    }`}>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-violet-700 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg shadow-violet-500/30 z-[100] animate-in slide-in-from-top-4 whitespace-nowrap">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-8 pb-4 flex justify-between items-center relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30 ring-2 ring-violet-500/20">
            <span className="text-white font-black text-lg">
              {currentUser?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className={`font-bold text-base flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Hello, {currentUser?.username} <span className="text-lg">👋</span>
            </h1>
            <div className={`text-xs font-medium mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {currentUser?.username}@trustpay
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 flex items-center justify-center rounded-full border active:scale-95 transition-all shadow-sm ${
              isLight
                ? 'bg-amber-100 border-amber-300 text-amber-600 hover:bg-amber-200'
                : 'bg-white/[0.06] border-white/[0.08] text-amber-400 hover:bg-white/[0.1]'
            }`}
            title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400 fill-amber-400/20" />}
          </button>

          {/* Notifications Bell */}
          <div
            className={`relative cursor-pointer w-10 h-10 flex items-center justify-center rounded-full border active:scale-95 transition-all ${
              isLight ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'bg-white/[0.06] border-white/[0.08] text-white'
            }`}
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="w-5 h-5" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full shadow-sm shadow-violet-500/50" />
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-5 mb-6">
        <div className="bg-gradient-to-br from-violet-600 via-indigo-700 to-blue-700 rounded-3xl p-6 shadow-[0_20px_60px_rgba(99,102,241,0.35)] relative overflow-hidden text-white">
          {/* Decorative orbs */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-6 w-36 h-36 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-300/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-indigo-100/80 text-xs font-semibold uppercase tracking-widest mb-2">
              Total Balance
              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="opacity-70 hover:opacity-100 transition-opacity active:scale-95"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-5">
              <div className="text-4xl font-black text-white tracking-tight">
                {hideBalance
                  ? '••••••'
                  : `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/25 active:scale-95 transition-all"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-3 mb-5">
              <button
                onClick={handleAddMoney}
                className="flex-1 bg-white/15 backdrop-blur-sm border border-white/20 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-white/25 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Money
              </button>
              <button
                onClick={scrollToTransactions}
                className="flex-1 bg-white/15 backdrop-blur-sm border border-white/20 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-white/25 active:scale-95 transition-all"
              >
                <FileText className="w-4 h-4" /> History
              </button>
            </div>

            <div
              className="pt-4 border-t border-white/15 flex justify-between items-center text-xs text-indigo-100/70 cursor-pointer hover:text-white transition-colors"
              onClick={() => setShowBankSelector(true)}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-indigo-700 font-black text-[9px]">{selectedBank.icon}</span>
                </div>
                <span className="font-medium">{selectedBank.name} •••• {selectedBank.last4}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xs uppercase tracking-widest font-semibold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Quick Actions</h2>
          <span
            className="text-violet-500 text-xs font-semibold cursor-pointer hover:text-violet-600 transition-colors"
            onClick={() => navigate('/service/more')}
          >
            See All
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: QrCode,         label: 'Scan & Pay',    action: () => navigate('/scan'),                color: 0 },
            { icon: User,           label: 'Pay Contact',   action: () => navigate('/contacts'),            color: 1 },
            { icon: Send,           label: 'Pay UPI ID',    action: () => navigate('/pay'),                 color: 2 },
            { icon: Plus,           label: 'Self Transfer', action: () => navigate('/service/transfer'),    color: 3 },
            { icon: Smartphone,     label: 'Recharge',      action: () => navigate('/service/recharge'),   color: 4 },
            { icon: CreditCard,     label: 'DTH',           action: () => navigate('/service/dth'),         color: 5 },
            { icon: Clock,          label: 'Electricity',   action: () => navigate('/service/electricity'), color: 6 },
            { icon: MoreHorizontal, label: 'More',          action: () => navigate('/service/more'),        color: 7 },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all ${
                isLight 
                  ? 'bg-white border border-slate-200/80 shadow-xs hover:bg-slate-100' 
                  : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07]'
              }`}
              onClick={item.action}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${quickActionColors[item.color]} flex items-center justify-center shadow-lg`}>
                <item.icon className="w-4 h-4 text-white stroke-[2]" />
              </div>
              <span className={`text-[10px] font-semibold text-center leading-tight px-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Defense Lab Banner */}
      <div
        className="px-5 mb-4 cursor-pointer active:scale-[0.98] transition-all"
        onClick={() => navigate('/defense-lab')}
      >
        <div className={`rounded-2xl p-4 flex items-center justify-between border ${
          isLight
            ? 'bg-gradient-to-r from-violet-100 to-indigo-100 border-violet-200 text-violet-950 shadow-sm'
            : 'bg-gradient-to-r from-violet-950/80 to-indigo-950/80 border-violet-500/25 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.2)]'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-sm flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Defense Lab <span className="text-base">🧪</span>
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Hackathon: Test safety mechanisms</p>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
            isLight ? 'bg-violet-200/80 border-violet-300 text-violet-800' : 'bg-violet-600/40 border-violet-500/30 text-violet-300'
          }`}>
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </div>
        </div>
      </div>

      {/* Quick AI Test Button */}
      <div className="px-5 mb-6">
        <button
          onClick={() => navigate('/pay', { state: { prefillScenario: 'high-risk' } })}
          className={`w-full font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden border ${
            isLight
              ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 shadow-sm'
              : 'bg-red-950/60 border-red-800/40 text-red-400 hover:bg-red-950/80'
          }`}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-2xl" />
          <AlertCircle className="w-5 h-5" />
          Test AI: Pay Scammy User
        </button>
      </div>

      {/* Recent Transactions */}
      <div id="recent-transactions" className="px-5 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xs uppercase tracking-widest font-semibold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            {showAllTransactions ? 'All Transactions' : 'Recent Transactions'}
          </h2>
          {!showAllTransactions && (
            <span
              className="text-violet-500 text-xs font-semibold cursor-pointer hover:text-violet-600 transition-colors"
              onClick={() => setShowAllTransactions(true)}
            >
              See All
            </span>
          )}
        </div>

        <div className="space-y-2">
          {(showAllTransactions ? transactions : transactions.slice(0, 5)).map(txn => (
            <div
              key={txn.id}
              className={`rounded-2xl p-3 cursor-pointer transition-all flex justify-between items-center border ${
                isLight
                  ? 'bg-white border-slate-200/80 hover:bg-slate-50 shadow-xs'
                  : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
              }`}
              onClick={() => {
                if (txn.status === 'Held' || txn.status === 'Under Review') {
                  navigate(`/held/${txn.id}`);
                } else {
                  setSelectedTxn(txn);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-base shadow-md ${
                  txn.status === 'Held'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                    : txn.status === 'Under Review'
                    ? 'bg-gradient-to-br from-red-500 to-rose-700 text-white'
                    : txn.isMerchant
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                    : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
                }`}>
                  {txn.recipient.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{txn.recipient}</div>
                  <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    {new Date(txn.date).toLocaleDateString()} • <span className={getStatusColor(txn.status)}>{txn.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <div className={`font-bold text-sm ${getStatusColor(txn.status)}`}>
                  − ₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                  txn.status === 'Completed'
                    ? isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/15 text-emerald-400'
                    : txn.status === 'Held'
                    ? isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/15 text-amber-400'
                    : txn.status === 'Under Review'
                    ? isLight ? 'bg-red-100 text-red-800' : 'bg-red-500/15 text-red-400'
                    : isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-700/50 text-slate-400'
                }`}>
                  {txn.status === 'Held' ? <Clock className="w-3 h-3" /> :
                   txn.status === 'Under Review' ? <ShieldAlert className="w-3 h-3" /> : null}
                  {txn.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto flex justify-around items-center px-2 pt-3 pb-6 z-50 border-t backdrop-blur-xl ${
        isLight
          ? 'bg-white/95 border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]'
          : 'bg-[#0d0e1a]/90 border-white/[0.08]'
      }`}>
        <div
          className="flex flex-col items-center gap-1 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <HomeIcon className="w-6 h-6 text-violet-500" />
          <span className="text-[10px] font-bold text-violet-500">Home</span>
        </div>

        <div
          className="flex flex-col items-center gap-1 cursor-pointer"
          onClick={scrollToTransactions}
        >
          <History className={`w-6 h-6 ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-600'}`} />
          <span className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>History</span>
        </div>

        <div className="relative flex flex-col items-center -mt-6">
          <div
            className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.5)] cursor-pointer hover:scale-105 active:scale-95 transition-all"
            onClick={() => navigate('/scan')}
          >
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className={`text-[10px] font-bold mt-1 ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>Scan</span>
        </div>

        <div
          onClick={() => navigate('/settings')}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <Settings className={`w-6 h-6 ${isLight ? 'text-slate-400 hover:text-violet-600' : 'text-slate-600 hover:text-violet-400'} transition-colors`} />
          <span className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>Settings</span>
        </div>

        <div
          onClick={() => { logout(); navigate('/login'); }}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <User className={`w-6 h-6 ${isLight ? 'text-slate-400 hover:text-red-500' : 'text-slate-600 hover:text-red-400'} transition-colors`} />
          <span className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>Logout</span>
        </div>
      </div>

      {/* ── Notifications Panel ── */}
      {showNotifications && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in"
            onClick={() => setShowNotifications(false)}
          />
          <div className={`fixed top-0 right-0 h-full w-80 z-50 shadow-2xl p-5 animate-in slide-in-from-right flex flex-col border-l ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0f1024] border-white/10 text-white'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>Notifications</h2>
              <button
                onClick={() => setShowNotifications(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
                  isLight ? 'bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900' : 'bg-white/[0.06] border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                <div className={`font-bold text-sm ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>Cashback Received! 🎉</div>
                <div className={`text-xs mt-1 ${isLight ? 'text-emerald-950' : 'text-slate-300'}`}>You won ₹51 on your last payment.</div>
                <div className={`text-[10px] mt-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>2 hours ago</div>
              </div>
              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/[0.08]'}`}>
                <div className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Security Alert</div>
                <div className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>New login from Chrome on Windows.</div>
                <div className={`text-[10px] mt-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Yesterday</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Bank Selector Modal ── */}
      {showBankSelector && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in"
            onClick={() => setShowBankSelector(false)}
          />
          <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 rounded-t-3xl p-5 pb-8 animate-in slide-in-from-bottom shadow-2xl border ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0f1024] border-white/10 text-white'
          }`}>
            <div className={`w-10 h-1 rounded-full mx-auto mb-6 ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
            <h2 className={`font-bold text-lg mb-5 ${isLight ? 'text-slate-900' : 'text-white'}`}>Select Bank Account</h2>

            <div className="space-y-3">
              {[
                { name: 'State Bank of India', last4: '4567', icon: 'SBI' },
                { name: 'HDFC Bank',           last4: '9821', icon: 'HDFC' },
                { name: 'ICICI Bank',          last4: '1122', icon: 'ICICI' },
              ].map((bank, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedBank.name === bank.name
                      ? isLight ? 'border-violet-500 bg-violet-50' : 'border-violet-500/50 bg-violet-500/10'
                      : isLight ? 'border-slate-200 bg-slate-50 hover:bg-slate-100' : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                  onClick={() => {
                    setSelectedBank(bank);
                    setShowBankSelector(false);
                    showToast(`${bank.name} set as primary.`);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[10px] shadow-md ${
                      selectedBank.name === bank.name
                        ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
                        : isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/[0.08] text-slate-400'
                    }`}>
                      {bank.icon}
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{bank.name}</div>
                      <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Account ending in {bank.last4}</div>
                    </div>
                  </div>
                  {selectedBank.name === bank.name && (
                    <CheckCircle2 className="w-5 h-5 text-violet-500" />
                  )}
                </div>
              ))}
            </div>

            <button className={`w-full mt-5 py-4 font-bold rounded-2xl border flex justify-center items-center gap-2 transition-all ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-violet-700 hover:bg-slate-200'
                : 'bg-white/[0.04] border-white/[0.08] text-violet-400 hover:bg-white/[0.08]'
            }`}>
              <Plus className="w-5 h-5" /> Add New Bank Account
            </button>
          </div>
        </>
      )}

      {/* ── Transaction Receipt Modal ── */}
      {selectedTxn && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in"
            onClick={() => setSelectedTxn(null)}
          />
          <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[340px] z-50 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 border ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0f1024] border-white/10 text-white'
          }`}>
            {/* Gradient top band based on status */}
            <div className={`h-28 flex flex-col items-center justify-center gap-2 relative overflow-hidden ${
              selectedTxn.status === 'Completed'
                ? 'bg-gradient-to-b from-emerald-500/20 to-transparent'
                : selectedTxn.status === 'Held'
                ? 'bg-gradient-to-b from-amber-500/20 to-transparent'
                : 'bg-gradient-to-b from-red-500/20 to-transparent'
            }`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                selectedTxn.status === 'Completed' ? 'bg-emerald-500/20 border border-emerald-400/30' :
                selectedTxn.status === 'Held'      ? 'bg-amber-500/20 border border-amber-400/30' :
                                                     'bg-red-500/20 border border-red-400/30'
              }`}>
                {selectedTxn.status === 'Completed'
                  ? <CheckCircle2 className="w-8 h-8 text-emerald-500 stroke-[2.5]" />
                  : selectedTxn.status === 'Held'
                  ? <Clock className="w-8 h-8 text-amber-500 stroke-[2.5]" />
                  : <ShieldAlert className="w-8 h-8 text-red-500 stroke-[2.5]" />}
              </div>
            </div>

            <div className="px-6 pb-6 -mt-4 flex flex-col items-center">
              <h2 className={`font-bold text-lg mb-1 text-center ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {selectedTxn.status === 'Completed'    ? 'Payment Completed'      :
                 selectedTxn.status === 'Held'         ? 'Payment on Safety Hold' :
                 selectedTxn.status === 'Under Review' ? 'Under Fraud Review'     : 'Payment Cancelled'}
              </h2>
              <div className={`text-3xl font-black mb-5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                ₹{selectedTxn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>

              <div className={`w-full rounded-2xl p-4 space-y-3 mb-5 text-left border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/[0.07]'
              }`}>
                {[
                  { label: 'Recipient', value: selectedTxn.recipient, bold: true },
                  { label: 'UPI ID',    value: selectedTxn.upiId || 'N/A' },
                  { label: 'Date',      value: new Date(selectedTxn.date).toLocaleString() },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">{row.label}</span>
                    <span className={row.bold ? `font-bold ${isLight ? 'text-slate-900' : 'text-white'}` : `font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-bold ${getStatusColor(selectedTxn.status)}`}>{selectedTxn.status}</span>
                </div>
              </div>

              {/* Put on Hold / Dispute Action for Completed Payments */}
              {selectedTxn.status === 'Completed' && (
                <button
                  onClick={() => {
                    const txnId = selectedTxn.id;
                    disputeTransaction(txnId);
                    setSelectedTxn(null);
                    showToast('Payment put on safety hold! Funds frozen in escrow.');
                    navigate(`/held/${txnId}`);
                  }}
                  className="w-full py-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-500 font-bold rounded-xl mb-3 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Put on Safety Hold / Dispute
                </button>
              )}

              {/* Direct navigation to safety hold screen for Held / Under Review */}
              {(selectedTxn.status === 'Held' || selectedTxn.status === 'Under Review') && (
                <button
                  onClick={() => {
                    const txnId = selectedTxn.id;
                    setSelectedTxn(null);
                    navigate(`/held/${txnId}`);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-bold rounded-xl mb-3 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 text-sm"
                >
                  <ShieldAlert className="w-4 h-4" />
                  View Safety Hold &amp; Bank Review
                </button>
              )}

              <button
                onClick={() => setSelectedTxn(null)}
                className={`w-full py-3 font-bold rounded-xl transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.1]'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Add Money Modal ── */}
      {showAddMoneyModal && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in"
            onClick={() => setShowAddMoneyModal(false)}
          />
          <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom shadow-2xl border ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0f1024] border-white/10 text-white'
          }`}>
            <div className={`w-10 h-1 rounded-full mx-auto mb-6 ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
            <h2 className={`font-bold text-xl mb-1 text-center ${isLight ? 'text-slate-900' : 'text-white'}`}>Add Money to Wallet</h2>
            <p className={`text-sm text-center mb-7 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              Current Balance: <span className="text-violet-500 font-semibold">₹{balance.toLocaleString('en-IN')}</span>
            </p>

            <div className="flex justify-center mb-6">
              <div className="relative inline-flex items-center">
                <span className={`text-3xl font-black mr-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>₹</span>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className={`text-4xl font-black w-40 py-2 border-b-2 focus:border-violet-500 focus:outline-none text-center bg-transparent transition-colors ${
                    isLight
                      ? 'text-slate-900 border-slate-300 placeholder:text-slate-300'
                      : 'text-white border-white/20 placeholder:text-slate-700'
                  }`}
                  placeholder="0"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {[500, 1000, 2000, 5000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setAddAmount(amt.toString())}
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold transition-all ${
                    isLight
                      ? 'border-slate-300 bg-slate-100 text-slate-700 hover:border-violet-500 hover:bg-violet-50 hover:text-violet-700'
                      : 'border-white/[0.12] bg-white/[0.04] text-slate-300 hover:border-violet-500/50 hover:text-violet-300 hover:bg-violet-500/10'
                  }`}
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <button
              onClick={submitAddMoney}
              disabled={!addAmount || parseInt(addAmount, 10) <= 0}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98]"
            >
              Add Securely
            </button>
          </div>
        </>
      )}
    </div>
  );
}
