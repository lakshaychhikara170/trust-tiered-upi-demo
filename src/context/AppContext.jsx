import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MERCHANTS, INITIAL_TRUST_HISTORY, INITIAL_TRANSACTIONS, isScamRecipient } from '../utils/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [loading, setLoading] = useState(true);

  // App state
  const [balance, setBalance] = useState(50000);
  const [threshold, setThreshold] = useState(3000);
  
  // For the demo, transactions and contacts are still kept local per user session
  // In a real app, these would also be fetched from the DB based on currentUser.id
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [merchants] = useState(INITIAL_MERCHANTS);
  const [trustHistory, setTrustHistory] = useState(INITIAL_TRUST_HISTORY);

  // Verify token and fetch user on load
  useEffect(() => {
    const fetchUser = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }
      try {
        // MOCK BACKEND
        const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
        const activeUser = Object.values(users).find(u => u.username === localStorage.getItem('active_username'));
        
        if (activeUser) {
          const { password: _, ...userWithoutPassword } = activeUser;
          setCurrentUser(userWithoutPassword);
          setBalance(activeUser.balance || 10000);
          setThreshold(activeUser.freezeThreshold || 50000);
        } else {
          logout();
        }
      } catch (err) {
        console.error("Auth verification failed", err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [authToken]);

  // Sync balance and threshold changes to backend
  useEffect(() => {
    if (currentUser && authToken && !loading) {
      // MOCK BACKEND UPDATE
      const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
      const activeUsername = localStorage.getItem('active_username');
      if (activeUsername && users[activeUsername]) {
        users[activeUsername].balance = balance;
        users[activeUsername].freezeThreshold = threshold;
        localStorage.setItem('mock_users', JSON.stringify(users));
      }
    }
  }, [balance, threshold, currentUser, authToken, loading]);

  const login = (user, token) => {
    localStorage.setItem('authToken', token);
    if (user && user.username) {
      localStorage.setItem('active_username', user.username);
    }
    setAuthToken(token);
    setCurrentUser(user);
    setBalance(user.balance || 10000);
    setThreshold(user.freezeThreshold || 50000);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setCurrentUser(null);
    setTransactions(INITIAL_TRANSACTIONS);
    setTrustHistory(INITIAL_TRUST_HISTORY);
  };

  const setUpiPin = async (pin) => {
    // MOCK BACKEND
    const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
    const activeUsername = localStorage.getItem('active_username');
    if (activeUsername && users[activeUsername]) {
      users[activeUsername].upiPin = pin;
      localStorage.setItem('mock_users', JSON.stringify(users));
      setCurrentUser(prev => ({ ...prev, hasUpiPin: true }));
      return true;
    }
    return false;
  };

  const verifyUpiPin = async (pin) => {
    // MOCK BACKEND
    const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
    const activeUsername = localStorage.getItem('active_username');
    if (activeUsername && users[activeUsername]) {
      return users[activeUsername].upiPin === pin;
    }
    return false;
  };

  const addTransaction = (txn) => {
    setTransactions(prev => [txn, ...prev]);
  };

  const updateTransactionStatus = (id, newStatus) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };
  
  const addToTrustHistory = (contact) => {
    if (!contact?.upiId) return;
    // CRITICAL: Never trust a scammer or flagged address
    if (isScamRecipient(contact.upiId, contact.name)) return;
    if (!trustHistory.find(t => t.upiId === contact.upiId)) {
      setTrustHistory(prev => [...prev, contact]);
    }
  };

  const removeFromTrustHistory = (upiId) => {
    setTrustHistory(prev => prev.filter(t => t.upiId !== upiId));
  };

  const clearTrustHistory = () => {
    setTrustHistory([]);
  };

  const updateThreshold = (val) => {
    setThreshold(val);
  };

  // Dispute / Freeze a transaction and put it on hold
  const disputeTransaction = (id, reason = 'Suspected Fraud') => {
    const txn = transactions.find(t => t.id === id);
    if (!txn) return false;

    // If money was previously completed/deducted, protect user by restoring funds to escrow balance
    if (txn.status === 'Completed') {
      setBalance(prev => prev + txn.amount);
    }

    // Set status to 'Held'
    updateTransactionStatus(id, 'Held');

    // Permanently remove from trusted history
    if (txn.upiId) {
      removeFromTrustHistory(txn.upiId);
    }
    return true;
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    setUpiPin,
    verifyUpiPin,
    balance,
    setBalance,
    threshold,
    setThreshold,
    transactions,
    addTransaction,
    updateTransactionStatus,
    disputeTransaction,
    merchants,
    trustHistory,
    addToTrustHistory,
    removeFromTrustHistory,
    clearTrustHistory,
    updateThreshold
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
