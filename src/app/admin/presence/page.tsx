'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, Building, Briefcase, Clock, Download, LogOut, Map, Eye, EyeOff, Archive, Trash2, Plus, Check, Settings, ListFilter } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PresenceSession {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isVisible: boolean;
  isArchived: boolean;
  createdAt: string;
}

interface Presence {
  id: string;
  sessionId: string;
  name: string;
  institution: string;
  position: string;
  email: string;
  rpjpnUnit: string;
  checkInTime: string;
  isVisible: boolean;
  isArchived: boolean;
}

export default function AdminPresencePage() {
  const [sessions, setSessions] = useState<PresenceSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | 'all'>('all');
  const [presenceList, setPresenceList] = useState<Presence[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showArchivedSessions, setShowArchivedSessions] = useState(false);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSession, setNewSession] = useState({ name: '', description: '', isActive: true });
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, [showArchivedSessions]);

  useEffect(() => {
    fetchPresence();
  }, [selectedSessionId, showArchived]);

  const fetchSessions = async () => {
    const res = await fetch(`/api/presence/sessions${showArchivedSessions ? '?all=true' : ''}`);
    const data = await res.json();
    setSessions(data);
    
    // Set default selected session to the active one if none selected
    if (selectedSessionId === 'all' && data.length > 0) {
      const active = data.find((s: PresenceSession) => s.isActive);
      if (active) setSelectedSessionId(active.id);
    }
  };

  const fetchPresence = async () => {
    let url = `/api/presence?${showArchived ? 'all=true' : ''}`;
    if (selectedSessionId !== 'all') {
      url += `&sessionId=${selectedSessionId}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setPresenceList(data);
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/presence/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession),
    });
    if (res.ok) {
      const session = await res.json();
      setIsAddingSession(false);
      setNewSession({ name: '', description: '', isActive: true });
      await fetchSessions();
      setSelectedSessionId(session.id);
    }
  };

  const toggleSessionActive = async (session: PresenceSession) => {
    const res = await fetch('/api/presence/sessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...session, isActive: !session.isActive }),
    });
    if (res.ok) fetchSessions();
  };

  const toggleSessionVisibility = async (session: PresenceSession) => {
    const res = await fetch('/api/presence/sessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...session, isVisible: !session.isVisible }),
    });
    if (res.ok) fetchSessions();
  };

  const toggleSessionArchive = async (session: PresenceSession) => {
    const action = session.isArchived ? 'unarchive' : 'archive';
    if (!confirm(`Are you sure you want to ${action} this session?`)) return;
    const res = await fetch('/api/presence/sessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...session, isArchived: !session.isArchived, isActive: false }),
    });
    if (res.ok) fetchSessions();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const toggleVisibility = async (p: Presence) => {
    const res = await fetch('/api/presence', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, isVisible: !p.isVisible, isArchived: p.isArchived }),
    });
    if (res.ok) fetchPresence();
  };

  const toggleArchive = async (p: Presence) => {
    const action = p.isArchived ? 'unarchive' : 'archive';
    if (!confirm(`Are you sure you want to ${action} this entry?`)) return;
    const res = await fetch('/api/presence', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, isVisible: p.isVisible, isArchived: !p.isArchived }),
    });
    if (res.ok) fetchPresence();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this entry?')) return;
    const res = await fetch(`/api/presence?id=${id}`, {
      method: 'DELETE',
    });
    if (res.ok) fetchPresence();
  };

  const exportToCSV = () => {
    const selectedSession = sessions.find(s => s.id === selectedSessionId);
    const headers = ['Nama', 'Instansi', 'Jabatan', 'Email', 'Unit RPJPn', 'Waktu'];
    const csvContent = presenceList
      .filter(p => !p.isArchived)
      .map(p => [
        `"${p.name}"`,
        `"${p.institution}"`,
        `"${p.position}"`,
        `"${p.email}"`,
        `"${p.rpjpnUnit}"`,
        `"${new Date(p.checkInTime).toLocaleString('id-ID')}"`
      ].join(',')).join('\n');
    
    const blob = new Blob([[headers.join(','), csvContent].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kehadiran_${selectedSession?.name || 'semua'}_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 font-semibold hover:bg-red-50 px-4 py-2 rounded-lg transition"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-10">
           <a href="/admin" className="bg-white text-gray-600 px-6 py-2 rounded-full font-bold border hover:bg-gray-50 transition">Links</a>
           <a href="/admin/presence" className="bg-[#FF7F50] text-white px-6 py-2 rounded-full font-bold shadow-sm">Presence</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
          {/* Sessions Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Settings size={18} className="text-gray-400" />
                Sessions
              </h3>
              <button 
                onClick={() => setIsAddingSession(true)}
                className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                title="Add New Session"
              >
                <Plus size={18} />
              </button>
            </div>

            {isAddingSession && (
              <form onSubmit={handleAddSession} className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
                <input 
                  type="text" 
                  placeholder="Session Name" 
                  required
                  value={newSession.name}
                  onChange={e => setNewSession({...newSession, name: e.target.value})}
                  className="w-full text-sm border p-2 rounded text-gray-900"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddingSession(false)} className="text-xs text-gray-500">Cancel</button>
                  <button type="submit" className="text-xs bg-indigo-600 text-white px-3 py-1 rounded">Create</button>
                </div>
              </form>
            )}

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              <button
                onClick={() => setSelectedSessionId('all')}
                className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center justify-between ${selectedSessionId === 'all' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
              >
                <span className="flex items-center gap-2"><ListFilter size={16} /> All Records</span>
              </button>

              {sessions.map(session => (
                <div key={session.id} className="group relative">
                  <button
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition flex flex-col ${selectedSessionId === session.id ? 'bg-[#FF7F50] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold truncate pr-4">{session.name}</span>
                      {session.isActive && <Check size={16} className={selectedSessionId === session.id ? 'text-white' : 'text-green-600'} />}
                    </div>
                    <span className={`text-[10px] mt-1 ${selectedSessionId === session.id ? 'text-white/80' : 'text-gray-400'}`}>
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSessionActive(session); }}
                      className={`p-1 rounded ${session.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      title={session.isActive ? 'Deactivate' : 'Set as Active'}
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSessionVisibility(session); }}
                      className={`p-1 rounded ${session.isVisible ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}
                      title={session.isVisible ? 'Hide from home' : 'Show on home'}
                    >
                      {session.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSessionArchive(session); }}
                      className="p-1 bg-orange-100 text-orange-700 rounded"
                      title="Archive Session"
                    >
                      <Archive size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer pt-2">
              <input 
                type="checkbox" 
                checked={showArchivedSessions} 
                onChange={(e) => setShowArchivedSessions(e.target.checked)}
                className="rounded"
              />
              Show Archived Sessions
            </label>
          </div>

          {/* Presence Table */}
          <div className="lg:col-span-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Users className="text-[#FF7F50]" /> 
                  {selectedSessionId === 'all' ? 'All Presence Records' : sessions.find(s => s.id === selectedSessionId)?.name}
                </h2>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-gray-500 text-sm">Total: <span className="font-bold text-gray-900">{presenceList.length}</span></p>
                  <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={showArchived} 
                      onChange={(e) => setShowArchived(e.target.checked)}
                      className="rounded"
                    />
                    Show Hidden/Archived Records
                  </label>
                </div>
              </div>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition shadow-md font-semibold text-sm"
              >
                <Download size={18} /> Export CSV
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Institution</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Check-in Time</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {presenceList.map((p) => (
                      <tr key={p.id} className={`hover:bg-gray-50 transition ${p.isArchived ? 'bg-gray-50 opacity-60' : ''} ${!p.isVisible ? 'bg-yellow-50/30' : ''}`}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                            {p.isArchived && <span className="text-[8px] bg-gray-200 px-1 rounded font-bold uppercase">Archived</span>}
                          </div>
                          <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{p.email}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Building size={12} className="text-gray-400" />
                            <span className="text-xs truncate max-w-[150px]">{p.institution}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock size={12} />
                            {new Date(p.checkInTime).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => toggleVisibility(p)} 
                              className={`p-1 rounded transition ${p.isVisible ? 'text-indigo-600 hover:bg-indigo-50' : 'text-gray-400 hover:bg-gray-100'}`}
                            >
                              {p.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <button 
                              onClick={() => toggleArchive(p)} 
                              className={`p-1 rounded transition ${p.isArchived ? 'text-orange-600 hover:bg-orange-50' : 'text-gray-400 hover:bg-gray-100'}`}
                            >
                              <Archive size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(p.id)} 
                              className="p-1 rounded text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {presenceList.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                   No entries found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
