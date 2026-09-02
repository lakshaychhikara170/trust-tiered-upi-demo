import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Contacts() {
  const navigate = useNavigate();
  const { merchants, trustHistory } = useAppContext();
  const [search, setSearch] = useState('');

  const allContacts = [...merchants, ...trustHistory];
  const filtered = allContacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.upiId.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getContactColors = (index) => {
    const colors = ['bg-green-500', 'bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900 rounded-full cursor-pointer hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">Select Contact</h1>
      </div>

      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-white border border-gray-200 p-3.5 rounded-2xl text-gray-500 shadow-sm">
          <Search className="w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search name or number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-gray-900 placeholder-gray-400 font-medium text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">All Contacts</h2>
          <div className="space-y-4">
            {filtered.map((contact, idx) => (
              <div 
                key={contact.id} 
                className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-all"
                onClick={() => navigate('/pay', { state: { scannedRecipient: contact.name } })}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${getContactColors(idx)}`}>
                  {getInitials(contact.name)}
                </div>
                <div className="flex-1 border-b border-gray-50 pb-2">
                  <div className="font-bold text-gray-900">{contact.name}</div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">{contact.upiId}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
