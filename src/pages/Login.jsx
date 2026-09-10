import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // MOCK BACKEND FOR HACKATHON DEMO (Bypasses localhost:3001)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
      const user = users[username];
      
      if (user && user.password === password) {
        // Remove password before storing in context
        const { password: _, ...userWithoutPassword } = user;
        login(userWithoutPassword, 'mock-jwt-token-123');
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Network error connecting to server');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#07080f] items-center justify-center p-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(139,92,246,0.4)]">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">TrustPay</h1>
          <p className="text-slate-500 text-sm mt-1">AI-Powered Secure Payments</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Welcome back</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-5 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] text-white rounded-xl p-3.5 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:outline-none placeholder-slate-600 transition-all"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] text-white rounded-xl p-3.5 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:outline-none placeholder-slate-600 transition-all"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-xl mt-2 shadow-[0_8px_30px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_40px_rgba(139,92,246,0.5)] hover:opacity-95 active:scale-[0.98] transition-all"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 font-bold hover:text-violet-300 transition-colors">
              Register
            </Link>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">🔒 256-bit encrypted · Hackathon Demo</p>
      </div>
    </div>
  );
}
