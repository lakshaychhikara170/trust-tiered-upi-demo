import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import Home from './pages/Home';
import Pay from './pages/Pay';
import Scan from './pages/Scan';
import Contacts from './pages/Contacts';
import Service from './pages/Service';
import Settings from './pages/Settings';
import HeldPayment from './pages/HeldPayment';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import DefenseLab from './pages/DefenseLab';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAppContext();
  const location = useLocation();
  
  if (loading) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-[#07080f]"><div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div><p className="text-slate-500 text-sm">Loading TrustPay...</p></div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

export default function App() {
  const { theme } = useAppContext();
  return (
    <div 
      className={`max-w-md mx-auto h-screen overflow-hidden relative transition-colors duration-300 ${
        theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#07080f] text-white'
      }`} 
      style={{boxShadow: theme === 'light' ? '0 0 0 1px rgba(0,0,0,0.1), 0 20px 60px rgba(0,0,0,0.12)' : '0 0 0 1px rgba(139,92,246,0.15), 0 25px 80px rgba(0,0,0,0.8)'}}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/pay" element={
          <ProtectedRoute><Pay /></ProtectedRoute>
        } />
        <Route path="/scan" element={
          <ProtectedRoute><Scan /></ProtectedRoute>
        } />
        <Route path="/contacts" element={
          <ProtectedRoute><Contacts /></ProtectedRoute>
        } />
        <Route path="/service/:type" element={
          <ProtectedRoute><Service /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />
        <Route path="/defense-lab" element={
          <ProtectedRoute><DefenseLab /></ProtectedRoute>
        } />
        <Route path="/held/:id" element={
          <ProtectedRoute><HeldPayment /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute><Admin /></ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}
