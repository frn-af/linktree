'use client';

import { useState, useEffect } from 'react';
import { User, Building, Briefcase, Mail, Send, CheckCircle2, Map, Clock, Loader2 } from 'lucide-react';
import { usePresenceSessions, useCreatePresenceRecord } from '@/hooks/use-presence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PresencePage() {
  const [submitted, setSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    position: '',
    email: '',
    rpjpnUnit: ''
  });

  const { data: sessions = [], isLoading: sessionsLoading } = usePresenceSessions(false);
  const createRecord = useCreatePresenceRecord();

  const activeSession = sessions.find(s => s.isActive);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('id-ID', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createRecord.mutate(formData, {
      onSuccess: () => setSubmitted(true)
    });
  };

  if (submitted) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center p-4 bg-[#111827]">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#FF7F50]/20 via-[#111827] to-[#111827]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#FF7F50]/10 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full text-center">
          <CheckCircle2 size={64} className="mx-auto text-green-400 mb-6" />
          <h1 className="text-3xl font-bold mb-2">Terima Kasih!</h1>
          <p className="text-gray-300 mb-8 text-lg">Kehadiran Anda telah berhasil dicatat.</p>
          <Button asChild className="bg-[#FF7F50] text-white hover:bg-[#FF7F50]/90 px-8 py-6 rounded-xl font-bold transition h-auto">
            <a href="/">Kembali ke Beranda</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-[#111827]">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#FF7F50]/20 via-[#111827] to-[#111827]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#FF7F50]/10 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 overflow-y-auto py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 mx-auto border-4 border-white shadow-xl flex items-center justify-center overflow-hidden p-2">
              <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Formulir Kehadiran</h1>
            <p className="mt-2 text-[#FF7F50] font-bold text-lg px-4">
              {sessionsLoading ? 'Loading event...' : (activeSession?.name || 'No active event')}
            </p>
            <p className="mt-1 text-gray-300 text-sm px-4 italic">Silakan isi data diri Anda untuk absensi.</p>
            
            {/* Displaying default time */}
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm font-medium">
              <Clock size={16} className="text-[#FF7F50]" />
              <span>{currentTime || 'Loading time...'}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <User size={16} /> Nama Lengkap
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Masukkan nama lengkap"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-[#FF7F50]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Building size={16} /> Instansi / Unit Kerja
              </label>
              <Input
                required
                value={formData.institution}
                onChange={(e) => setFormData({...formData, institution: e.target.value})}
                placeholder="Masukkan instansi"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-[#FF7F50]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Briefcase size={16} /> Jabatan
              </label>
              <Input
                required
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="Masukkan jabatan"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-[#FF7F50]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Mail size={16} /> Email
              </label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="nama@email.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-[#FF7F50]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Map size={16} /> RPJPn unit kawasan konservasi yang disusun
              </label>
              <Input
                required
                value={formData.rpjpnUnit}
                onChange={(e) => setFormData({...formData, rpjpnUnit: e.target.value})}
                placeholder="Masukkan unit kawasan"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-[#FF7F50]"
              />
            </div>

            <Button
              type="submit"
              disabled={createRecord.isPending || !activeSession}
              className="w-full bg-[#FF7F50] hover:bg-[#FF7F50]/90 text-white font-bold py-7 rounded-xl transition shadow-lg flex items-center justify-center gap-2 mt-4 h-auto"
            >
              {createRecord.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Kirim Kehadiran
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
