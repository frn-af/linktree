'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, Building, Briefcase, Clock, Download, LogOut, Map } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Presence {
  id: string;
  name: string;
  institution: string;
  position: string;
  email: string;
  rpjpnUnit: string;
  timestamp: string;
}

export default function AdminPresencePage() {
  const [presenceList, setPresenceList] = useState<Presence[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchPresence();
  }, []);

  const fetchPresence = async () => {
    const res = await fetch('/api/presence');
    const data = await res.json();
    setPresenceList(data);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const exportToCSV = () => {
    const headers = ['Nama', 'Instansi', 'Jabatan', 'Email', 'Unit RPJPn', 'Waktu'];
    const csvContent = presenceList.map(p => [
      `"${p.name}"`,
      `"${p.institution}"`,
      `"${p.position}"`,
      `"${p.email}"`,
      `"${p.rpjpnUnit}"`,
      `"${new Date(p.timestamp).toLocaleString('id-ID')}"`
    ].join(',')).join('\n');
    
    const blob = new Blob([[headers.join(','), csvContent].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kehadiran_${new Date().toLocaleDateString()}.csv`);
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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Users className="text-[#FF7F50]" /> 
              Presence List
            </h2>
            <p className="text-gray-500 mt-1">Total Participants: <span className="font-bold text-gray-900">{presenceList.length}</span></p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition shadow-md font-semibold"
          >
            <Download size={20} /> Export to CSV
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Institution</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">RPJPn Unit</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Check-in Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {presenceList.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900">{p.name}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building size={14} className="text-gray-400" />
                        <span className="text-sm">{p.institution}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 italic">
                       {p.position}
                    </td>
                    <td className="px-6 py-5">
                      <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-[#FF7F50] hover:underline font-medium text-sm">
                        <Mail size={14} />
                        {p.email}
                      </a>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Map size={14} className="text-gray-400" />
                        <span className="text-sm">{p.rpjpnUnit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock size={14} />
                        {new Date(p.timestamp).toLocaleString('id-ID')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {presenceList.length === 0 && (
            <div className="text-center py-20 text-gray-500">
               No check-ins yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
