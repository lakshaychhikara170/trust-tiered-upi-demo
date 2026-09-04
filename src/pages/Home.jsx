import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Settings, ShieldCheck, CheckCircle2, Clock, AlertCircle, Bell, Eye, Plus, FileText, QrCode, User, Smartphone, CreditCard, Send, MoreHorizontal, UserCircle, Home as HomeIcon, History, ChevronDown, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function Home() {
  const { balance, setBalance, transactions, currentUser, logout, disputeTransaction } = useAppContext();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  
  // New States
  const [hideBalance, setHideBalance] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState({ name: 'State Bank of India', last4: '4567', icon: 'SBI' });
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

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

  const handleComingSoon = (feature) => {
    showToast(`${feature} feature coming soon!`);
  };

  const scrollToTransactions = () => {
    document.getElementById('recent-transactions')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-emerald-600';
      case 'Held': return 'text-amber-600 font-bold';
      case 'Under Review': return 'text-red-600 font-bold';
      case 'Cancelled': return 'text-gray-400 line-through';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white pb-20 relative overflow-y-auto hide-scrollbar">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium shadow-xl z-50 animate-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex justify-between items-center relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300">
            <UserCircle className="w-10 h-10 text-gray-500 mt-2" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 flex items-center gap-1">
              Hello, {currentUser?.username} <span className="text-xl">👋</span>
            </h1>
            <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
              UPI ID: {currentUser?.username}@trustpay
            </div>
          </div>
        </div>
        <div className="relative cursor-pointer" onClick={() => setShowNotifications(true)}>
          <Bell className="w-6 h-6 text-gray-700" />
          <div className="absolute top-0 right-0.5 w-2 h-2 bg-indigo-600 rounded-full border border-white"></div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-5 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-5 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-8 -mb-8"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-indigo-100 text-sm font-medium mb-1">
              Total Balance <Eye className={`w-4 h-4 cursor-pointer ${hideBalance ? 'opacity-50' : 'opacity-100'}`} onClick={() => setHideBalance(!hideBalance)} />
            </div>
            <div className="text-3xl font-bold mb-5 flex items-center justify-between">
              {hideBalance ? '••••••' : `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              <span className="text-lg opacity-80 cursor-pointer" onClick={() => navigate('/settings')}>&gt;</span>
            </div>
            
            <div className="flex gap-3 mb-5">
              <button onClick={handleAddMoney} className="flex-1 bg-white text-indigo-700 font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all">
                <Plus className="w-4 h-4" /> Add Money
              </button>
              <button onClick={scrollToTransactions} className="flex-1 bg-indigo-600 border border-indigo-400 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-indigo-500 active:scale-95 transition-all">
                <FileText className="w-4 h-4" /> History
              </button>
            </div>
            
            <div className="pt-3 border-t border-indigo-400/50 flex justify-between items-center text-xs text-indigo-100 cursor-pointer" onClick={() => setShowBankSelector(true)}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <span className="text-indigo-700 font-bold text-[10px]">{selectedBank.icon}</span>
                </div>
                {selectedBank.name} •••• {selectedBank.last4}
              </div>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-900 text-lg">Quick Actions</h2>
          <span className="text-indigo-600 text-sm font-semibold cursor-pointer" onClick={() => navigate('/service/more')}>See All</span>
        </div>
        
        <div className="grid grid-cols-4 gap-y-6 gap-x-2">
          {[
            { icon: QrCode, label: 'Scan & Pay', action: () => navigate('/scan') },
            { icon: User, label: 'Pay to Contact', action: () => navigate('/contacts') },
            { icon: Send, label: 'Pay to UPI ID', action: () => navigate('/pay') },
            { icon: Plus, label: 'Self Transfer', action: () => navigate('/service/transfer') },
            { icon: Smartphone, label: 'Mobile Recharge', action: () => navigate('/service/recharge') },
            { icon: CreditCard, label: 'DTH', action: () => navigate('/service/dth') },
            { icon: Clock, label: 'Electricity', action: () => navigate('/service/electricity') },
            { icon: MoreHorizontal, label: 'More', action: () => navigate('/service/more') },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-all" onClick={item.action}>
              <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                <item.icon className="w-6 h-6 stroke-[1.5]" />
              </div>
              <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Banner */}
      <div className="px-5 mb-6 cursor-pointer active:scale-95 transition-all" onClick={() => navigate('/defense-lab')}>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-gray-900/20">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Defense Lab 🧪
            </h3>
            <p className="text-gray-400 text-xs mt-1">Hackathon: Test safety mechanisms</p>
          </div>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold">&gt;</span>
          </div>
        </div>
      </div>

      {/* Quick AI Test Button */}
      <div className="px-5 mb-6">
        <button 
          onClick={() => navigate('/pay', { state: { prefillScenario: 'high-risk' } })}
          className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <AlertCircle className="w-5 h-5" /> Test AI: Pay Scammy User
        </button>
      </div>

      {/* Recent Transactions */}
      <div id="recent-transactions" className="px-5 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-900 text-lg">{showAllTransactions ? 'All Transactions' : 'Recent Transactions'}</h2>
          {!showAllTransactions && (
            <span className="text-indigo-600 text-sm font-semibold cursor-pointer" onClick={() => setShowAllTransactions(true)}>See All</span>
          )}
        </div>
        
        <div className="space-y-4">
          {(showAllTransactions ? transactions : transactions.slice(0, 5)).map(txn => (
            <div 
              key={txn.id} 
              className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-all"
              onClick={() => {
                if (txn.status === 'Held' || txn.status === 'Under Review') {
                  navigate(`/held/${txn.id}`);
                } else {
                  setSelectedTxn(txn);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${txn.isMerchant ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {txn.recipient.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{txn.recipient}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(txn.date).toLocaleDateString()} • {txn.status}
                  </div>
                </div>
              </div>
              <div className={`font-bold text-sm ${getStatusColor(txn.status)}`}>
                - ₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around items-center px-2 pt-2 pb-5 z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col items-center gap-1 text-indigo-600 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <HomeIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer" onClick={scrollToTransactions}>
          <History className="w-6 h-6" />
          <span className="text-[10px] font-medium">History</span>
        </div>
        <div className="relative -top-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-300 text-white cursor-pointer hover:scale-105 active:scale-95 transition-all" onClick={() => navigate('/scan')}>
            <QrCode className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-gray-600 absolute -bottom-5 left-1/2 -translate-x-1/2">Scan</span>
        </div>
        <div onClick={() => navigate('/settings')} className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-medium">Settings</span>
        </div>
        <div onClick={() => {
          logout();
          navigate('/login');
        }} className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer hover:text-red-500 transition-colors">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Logout</span>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <>
          <div className="fixed inset-0 bg-black/20 z-50 animate-in fade-in" onClick={() => setShowNotifications(false)}></div>
          <div className="fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl p-5 animate-in slide-in-from-right flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-gray-900 text-lg">Notifications</h2>
              <button onClick={() => setShowNotifications(false)} className="text-gray-500 font-bold">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <div className="font-bold text-emerald-800 text-sm">Cashback Received!</div>
                <div className="text-xs text-emerald-600 mt-1">You won ₹51 on your last payment.</div>
                <div className="text-[10px] text-gray-400 mt-2">2 hours ago</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="font-bold text-gray-800 text-sm">Security Alert</div>
                <div className="text-xs text-gray-600 mt-1">New login from Chrome on Windows.</div>
                <div className="text-[10px] text-gray-400 mt-2">Yesterday</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bank Selector Modal */}
      {showBankSelector && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" onClick={() => setShowBankSelector(false)}></div>
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white z-50 rounded-t-3xl p-5 pb-8 animate-in slide-in-from-bottom shadow-2xl">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <h2 className="font-bold text-gray-900 text-lg mb-4">Select Bank Account</h2>
            
            <div className="space-y-3">
              {[
                { name: 'State Bank of India', last4: '4567', icon: 'SBI', active: true },
                { name: 'HDFC Bank', last4: '9821', icon: 'HDFC', active: false },
                { name: 'ICICI Bank', last4: '1122', icon: 'ICICI', active: false }
              ].map((bank, idx) => (
                <div 
                  key={idx} 
                  className={`flex justify-between items-center p-4 rounded-2xl border ${selectedBank.name === bank.name ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:bg-gray-50'} cursor-pointer`}
                  onClick={() => {
                    setSelectedBank(bank);
                    setShowBankSelector(false);
                    showToast(`${bank.name} set as primary.`);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[10px] ${selectedBank.name === bank.name ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {bank.icon}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{bank.name}</div>
                      <div className="text-xs text-gray-500">Account ending in {bank.last4}</div>
                    </div>
                  </div>
                  {selectedBank.name === bank.name && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-4 bg-gray-50 text-indigo-600 font-bold rounded-2xl border border-gray-200 flex justify-center items-center gap-2 hover:bg-gray-100">
              <Plus className="w-5 h-5" /> Add New Bank Account
            </button>
          </div>
        </>
      )}

      {/* Transaction Receipt Modal */}
      {selectedTxn && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" onClick={() => setSelectedTxn(null)}></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[340px] bg-white z-50 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              selectedTxn.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
              selectedTxn.status === 'Held' ? 'bg-amber-100 text-amber-600' :
              selectedTxn.status === 'Under Review' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {selectedTxn.status === 'Completed' ? <CheckCircle2 className="w-10 h-10 stroke-[2.5]" /> :
               selectedTxn.status === 'Held' ? <Clock className="w-10 h-10 stroke-[2.5]" /> :
               <ShieldAlert className="w-10 h-10 stroke-[2.5]" />}
            </div>
            
            <h2 className="font-bold text-gray-900 text-xl mb-1 text-center">
              {selectedTxn.status === 'Completed' ? 'Payment Completed' :
               selectedTxn.status === 'Held' ? 'Payment on Safety Hold' :
               selectedTxn.status === 'Under Review' ? 'Under Fraud Review' : 'Payment Cancelled'}
            </h2>
            <div className="text-3xl font-bold text-gray-900 mb-6">
              ₹{selectedTxn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            
            <div className="w-full bg-gray-50 rounded-2xl p-4 space-y-3 mb-5 border border-gray-100 text-left">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Recipient</span>
                <span className="font-bold text-gray-900">{selectedTxn.recipient}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">UPI ID</span>
                <span className="font-medium text-gray-900">{selectedTxn.upiId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{new Date(selectedTxn.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`font-bold ${getStatusColor(selectedTxn.status)}`}>
                  {selectedTxn.status}
                </span>
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
                className="w-full py-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold rounded-xl mb-3 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm text-sm"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
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
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl mb-3 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md text-sm"
              >
                <ShieldAlert className="w-4 h-4 text-white" />
                View Safety Hold & Bank Review
              </button>
            )}

            <button 
              onClick={() => setSelectedTxn(null)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" onClick={() => setShowAddMoneyModal(false)}></div>
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white z-50 rounded-t-3xl p-5 pb-8 animate-in slide-in-from-bottom shadow-2xl">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <h2 className="font-bold text-gray-900 text-lg mb-2 text-center">Add Money to Wallet</h2>
            <p className="text-gray-500 text-sm text-center mb-6">Current Balance: ₹{balance.toLocaleString('en-IN')}</p>
            
            <div className="flex justify-center mb-6">
              <div className="relative inline-block">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₹</span>
                <input 
                  type="number" 
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="text-4xl font-bold text-gray-900 w-full pl-8 py-2 border-b-2 border-gray-200 focus:border-indigo-600 focus:outline-none text-center bg-transparent"
                  placeholder="0"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-center gap-3 mb-8">
              {[500, 1000, 2000, 5000].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setAddAmount(amt.toString())}
                  className="px-4 py-2 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-indigo-300 transition-colors"
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <button 
              onClick={submitAddMoney}
              disabled={!addAmount || parseInt(addAmount, 10) <= 0}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Add Securely
            </button>
          </div>
        </>
      )}
    </div>
  );
}
