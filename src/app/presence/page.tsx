'use client';

import { useState } from 'react';
import { Dithering } from '@paper-design/shaders-react';
import { User, Building, Briefcase, Mail, Send, CheckCircle2, Map } from 'lucide-react';

export default function PresencePage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    position: '',
    email: '',
    rpjpnUnit: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center p-4">
         <div className="fixed inset-0 z-0">
          <Dithering
            style={{ width: '100%', height: '100%' }}
            colorFront="#FF7F50"
            colorBack="#111827"
            shape="simplex"
            type="random"
            speed={0.5}
            scale={1.5}
          />
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full text-center">
          <CheckCircle2 size={64} className="mx-auto text-green-400 mb-6" />
          <h1 className="text-3xl font-bold mb-2">Terima Kasih!</h1>
          <p className="text-gray-300 mb-8 text-lg">Kehadiran Anda telah berhasil dicatat.</p>
          <a href="/" className="inline-block bg-[#FF7F50] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition">
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="fixed inset-0 z-0">
        <Dithering
          style={{ width: '100%', height: '100%' }}
          colorFront="#FF7F50"
          colorBack="#111827"
          shape="simplex"
          type="random"
          speed={0.5}
          scale={1.5}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 overflow-y-auto py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 mx-auto border-4 border-white shadow-xl flex items-center justify-center overflow-hidden p-2">
              <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Formulir Kehadiran</h1>
            <p className="mt-2 text-gray-300 px-4">Silakan isi data diri Anda untuk absensi lokakarya.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <User size={16} /> Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Masukkan nama lengkap"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:ring-2 focus:ring-[#FF7F50] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Building size={16} /> Instansi / Unit Kerja
              </label>
              <input
                type="text"
                required
                value={formData.institution}
                onChange={(e) => setFormData({...formData, institution: e.target.value})}
                placeholder="Masukkan instansi"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:ring-2 focus:ring-[#FF7F50] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Briefcase size={16} /> Jabatan
              </label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="Masukkan jabatan"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:ring-2 focus:ring-[#FF7F50] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Mail size={16} /> Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="nama@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:ring-2 focus:ring-[#FF7F50] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Map size={16} /> RPJPn unit kawasan konservasi yang disusun
              </label>
              <input
                type="text"
                required
                value={formData.rpjpnUnit}
                onChange={(e) => setFormData({...formData, rpjpnUnit: e.target.value})}
                placeholder="Masukkan unit kawasan"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:ring-2 focus:ring-[#FF7F50] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF7F50] hover:opacity-90 text-white font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? "Mengirim..." : (
                <>
                  <Send size={18} />
                  Kirim Kehadiran
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
