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
    <div className="flex flex-col h-full bg-[#07080f] text-white">
      {/* Header */}
      <div className="flex items-center p-4 bg-[#07080f]/90 backdrop-blur-md sticky top-0 z-10 border-b border-white/[0.08]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-full cursor-pointer hover:bg-white/[0.06] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white ml-2">Select Contact</h1>
      </div>

      <div className="p-4 bg-[#07080f] border-b border-white/[0.06]">
        <div className="flex items-center gap-3 bg-white/[0.05] border border-white/10 p-3.5 rounded-2xl text-slate-400">
          <Search className="w-5 h-5 text-violet-400" />
          <input 
            type="text" 
            placeholder="Search name or number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-white placeholder-slate-500 font-medium text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">All Contacts</h2>
          <div className="space-y-3">
            {filtered.map((contact, idx) => (
              <div 
                key={contact.id} 
                className="flex items-center gap-4 cursor-pointer bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] p-3.5 rounded-2xl transition-all"
                onClick={() => navigate('/pay', { state: { scannedRecipient: contact.name } })}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md ${getContactColors(idx)}`}>
                  {getInitials(contact.name)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">{contact.name}</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">{contact.upiId}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
