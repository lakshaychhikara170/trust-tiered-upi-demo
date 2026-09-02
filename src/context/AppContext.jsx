import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MERCHANTS, INITIAL_TRUST_HISTORY, INITIAL_TRANSACTIONS } from '../utils/mockData';

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
        const res = await fetch('http://localhost:3001/api/auth/me', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setBalance(data.user.balance);
          setThreshold(data.user.freezeThreshold);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
      setLoading(false);
    };
    fetchUser();
  }, [authToken]);

  // Sync balance and threshold changes to backend
  useEffect(() => {
    if (currentUser && authToken && !loading) {
      fetch('http://localhost:3001/api/auth/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ balance, freezeThreshold: threshold })
      }).catch(console.error);
    }
  }, [balance, threshold, currentUser, authToken, loading]);

  const login = (user, token) => {
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    setCurrentUser(user);
    setBalance(user.balance);
    setThreshold(user.freezeThreshold);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setCurrentUser(null);
    setTransactions(INITIAL_TRANSACTIONS);
    setTrustHistory(INITIAL_TRUST_HISTORY);
  };

  const setUpiPin = async (pin) => {
    const res = await fetch('http://localhost:3001/api/auth/set-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ pin })
    });
    if (res.ok) {
      setCurrentUser(prev => ({ ...prev, hasUpiPin: true }));
      return true;
    }
    return false;
  };

  const verifyUpiPin = async (pin) => {
    const res = await fetch('http://localhost:3001/api/auth/verify-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ pin })
    });
    return res.ok;
  };

  const addTransaction = (txn) => {
    setTransactions(prev => [txn, ...prev]);
  };

  const updateTransactionStatus = (id, newStatus) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };
  
  const addToTrustHistory = (contact) => {
    if (!trustHistory.find(t => t.upiId === contact.upiId)) {
      setTrustHistory(prev => [...prev, contact]);
    }
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
    merchants,
    trustHistory,
    addToTrustHistory
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
