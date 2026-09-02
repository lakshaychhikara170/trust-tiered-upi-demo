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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <div className="max-w-md mx-auto bg-gray-50 h-screen overflow-hidden shadow-2xl relative">
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
