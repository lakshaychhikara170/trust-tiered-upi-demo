import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck } from 'lucide-react';

export default function Register() {
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
      await new Promise(resolve => setTimeout(resolve, 500)); // fake network delay
      
      const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
      if (users[username]) {
        setError('Username already exists');
        return;
      }
      
      const newUser = {
        username,
        password, // In a real app, never store plaintext passwords!
        balance: 10000,
        upiPin: null
      };
      users[username] = newUser;
      localStorage.setItem('mock_users', JSON.stringify(users));

      // Auto login after register
      login(newUser, 'mock-jwt-token-123');
      navigate('/');
    } catch (err) {
      setError('Network error connecting to server');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <ShieldCheck className="w-10 h-10" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">Create an Account</h1>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Choose Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors mt-4"
          >
            Register
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
