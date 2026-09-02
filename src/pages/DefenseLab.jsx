import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Activity, Crosshair, RefreshCw, AlertTriangle, ShieldAlert, Lock, MapPin } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function DefenseLab() {
  const navigate = useNavigate();
  const { setBalance, clearTrustHistory, updateThreshold, transactions } = useAppContext();
  
  const [activeSimulation, setActiveSimulation] = useState(null);

  const heldTxns = transactions.filter(t => t.status === 'Held' || t.status === 'Under Review');
  const completedTxns = transactions.filter(t => t.status === 'Completed');

  const handleReset = () => {
    setBalance(50000);
    clearTrustHistory();
    updateThreshold(5000);
    alert("Demo environment reset! Balance is ₹50,000, Trust History cleared, Threshold is ₹5,000.");
  };

  const simulateVelocity = () => {
    setActiveSimulation('velocity');
    setTimeout(() => setActiveSimulation('velocity_locked'), 2500);
  };

  const renderSimulationModal = () => {
    if (!activeSimulation) return null;

    if (activeSimulation === 'velocity' || activeSimulation === 'velocity_locked') {
      const isLocked = activeSimulation === 'velocity_locked';
      return (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isLocked ? 'bg-red-500/20' : 'bg-blue-500/20 animate-pulse'}`}>
            {isLocked ? <Lock className="w-12 h-12 text-red-500" /> : <Activity className="w-12 h-12 text-blue-500" />}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLocked ? 'Account Locked' : 'Velocity Attack Detected'}
          </h2>
          <p className="text-gray-400 mb-8 max-w-sm">
            {isLocked 
              ? 'Our AI detected 5 rapid transactions within 2 seconds. To protect your funds, outgoing payments have been frozen.'
              : 'Simulating rapid micro-transactions (DDoS payment attack)...'}
          </p>
          {isLocked && (
            <button 
              onClick={() => setActiveSimulation(null)}
              className="bg-red-600 text-white font-bold py-3 px-8 rounded-xl w-full"
            >
              Acknowledge & Unlock
            </button>
          )}
        </div>
      );
    }

    if (activeSimulation === 'geo') {
      return (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
            <MapPin className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Geolocation Anomaly</h2>
          <p className="text-gray-400 mb-8 max-w-sm">
            Login detected from an IP address in <b>Moscow, Russia</b>. Since your primary device is in India, high-value transfers will require biometric verification.
          </p>
          <button 
            onClick={() => setActiveSimulation(null)}
            className="bg-amber-600 text-white font-bold py-3 px-8 rounded-xl w-full"
          >
            Acknowledge
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-y-auto pb-10">
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="ml-2 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          <h1 className="text-lg font-bold text-white">Defense Lab</h1>
        </div>
      </div>

      <div className="p-5">
        <p className="text-gray-400 text-sm mb-6">
          Welcome to the Test Mode. Use these tools to demonstrate the Trust-Tiered AI defense mechanisms to the hackathon judges.
        </p>

        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Simulation Scenarios</h2>
        
        <div className="space-y-4 mb-8">
          {/* Scenario 1 */}
          <div 
            onClick={() => navigate('/pay', { state: { prefillScenario: 'high-risk' } })}
            className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex gap-4 cursor-pointer hover:border-indigo-500/50 hover:bg-gray-800 transition-all"
          >
            <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Crosshair className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Trigger 24h Safety Hold</h3>
              <p className="text-xs text-gray-400">Navigates to Pay screen pre-filled with an unknown UPI ID and high amount to trigger the trust-tier hold.</p>
            </div>
          </div>

          {/* Scenario 2 */}
          <div 
            onClick={simulateVelocity}
            className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex gap-4 cursor-pointer hover:border-blue-500/50 hover:bg-gray-800 transition-all"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Simulate Velocity Attack</h3>
              <p className="text-xs text-gray-400">Simulates rapid bot-like transaction spam, triggering an immediate outgoing payment freeze.</p>
            </div>
          </div>

          {/* Scenario 3 */}
          <div 
            onClick={() => setActiveSimulation('geo')}
            className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex gap-4 cursor-pointer hover:border-amber-500/50 hover:bg-gray-800 transition-all"
          >
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Simulate Geo-Anomaly</h3>
              <p className="text-xs text-gray-400">Triggers a mock alert for a suspicious login from a foreign IP address.</p>
            </div>
          </div>
        </div>

        {/* Security Audit Log */}
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-8">Security Audit Log</h2>
        <div className="space-y-6 mb-8">
          {/* Held Payments */}
          <div>
            <h3 className="text-sm font-bold text-amber-500 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Flagged / Held Payments ({heldTxns.length})
            </h3>
            {heldTxns.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-center text-sm text-gray-500">
                No payments currently on hold.
              </div>
            ) : (
              <div className="space-y-3">
                {heldTxns.map(txn => (
                  <div 
                    key={txn.id} 
                    className="bg-gray-900 border border-amber-900/30 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-all" 
                    onClick={() => navigate(`/held/${txn.id}`)}
                  >
                    <div>
                      <div className="font-bold text-gray-200">{txn.recipient}</div>
                      <div className="text-xs text-gray-500">{new Date(txn.date).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-500">₹{txn.amount.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] uppercase tracking-wider text-amber-600 font-bold mt-1">{txn.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Payments */}
          <div>
            <h3 className="text-sm font-bold text-emerald-500 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Cleared Payments ({completedTxns.length})
            </h3>
            {completedTxns.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-center text-sm text-gray-500">
                No cleared payments found.
              </div>
            ) : (
              <div className="space-y-3">
                {completedTxns.slice(0, 5).map(txn => (
                  <div key={txn.id} className="bg-gray-900 border border-emerald-900/20 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-200">{txn.recipient}</div>
                      <div className="text-xs text-gray-500">{new Date(txn.date).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-500">₹{txn.amount.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold mt-1">Cleared</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Environment Controls</h2>
        
        <div 
          onClick={handleReset}
          className="bg-gray-900 border border-red-900/30 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-red-950/30 transition-all text-red-400"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5" />
            <span className="font-bold text-sm">Reset Demo Environment</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3 text-center">
          Clears all trusted contacts and resets wallet balance.
        </p>
      </div>

      {renderSimulationModal()}
    </div>
  );
}
