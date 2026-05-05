'use client';

'use client';

import { useState } from 'react';
import { Users, Building, Clock, Download, LogOut, Eye, EyeOff, Archive, Trash2, Plus, Check, Settings, ListFilter, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  usePresenceSessions, 
  useCreatePresenceSession, 
  useUpdatePresenceSession, 
  useDeletePresenceSession,
  usePresenceRecords,
  useUpdatePresenceRecord,
  useDeletePresenceRecord,
  type PresenceSession,
  type PresenceRecord
} from '@/hooks/use-presence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPresencePage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | 'all'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [showArchivedSessions, setShowArchivedSessions] = useState(false);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSession, setNewSession] = useState({ name: '', description: '', isActive: true });
  const [deleteConfirmId, setDeleteConfirmId] = useState<{ type: 'session' | 'record', id: string } | null>(null);
  
  const router = useRouter();

  const { data: sessions = [], isLoading: sessionsLoading } = usePresenceSessions(showArchivedSessions);
  const createSession = useCreatePresenceSession();
  const updateSession = useUpdatePresenceSession();
  const deleteSession = useDeletePresenceSession();

  const { data: presenceList = [], isLoading: recordsLoading } = usePresenceRecords(selectedSessionId, showArchived);
  const updateRecord = useUpdatePresenceRecord();
  const deleteRecord = useDeletePresenceRecord();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    createSession.mutate(newSession, {
      onSuccess: (data) => {
        setIsAddingSession(false);
        setNewSession({ name: '', description: '', isActive: true });
        setSelectedSessionId(data.id);
      }
    });
  };

  const toggleSessionActive = (session: PresenceSession) => {
    updateSession.mutate({ ...session, isActive: !session.isActive });
  };

  const toggleSessionVisibility = (session: PresenceSession) => {
    updateSession.mutate({ ...session, isVisible: !session.isVisible });
  };

  const toggleSessionArchive = (session: PresenceSession) => {
    updateSession.mutate({ ...session, isArchived: !session.isArchived, isActive: false });
  };

  const toggleVisibility = (p: PresenceRecord) => {
    updateRecord.mutate({ id: p.id, isVisible: !p.isVisible });
  };

  const toggleArchive = (p: PresenceRecord) => {
    updateRecord.mutate({ id: p.id, isArchived: !p.isArchived });
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
          <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={18} /> Logout
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-10">
           <Button asChild variant="outline" className="bg-white text-gray-600 rounded-full font-bold">
            <a href="/admin">Links</a>
          </Button>
          <Button asChild variant="default" className="bg-[#FF7F50] hover:bg-[#FF7F50]/90 text-white rounded-full font-bold shadow-sm">
            <a href="/admin/presence">Presence</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
          {/* Sessions Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Settings size={18} className="text-gray-400" />
                Sessions
              </h3>
              <Button size="icon" variant="outline" onClick={() => setIsAddingSession(true)} className="h-8 w-8 bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white border-none">
                <Plus size={18} />
              </Button>
            </div>

            {isAddingSession && (
              <Card className="shadow-sm">
                <CardContent className="pt-4 space-y-3">
                  <Input 
                    placeholder="Session Name" 
                    required
                    value={newSession.name}
                    onChange={e => setNewSession({...newSession, name: e.target.value})}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsAddingSession(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleAddSession} disabled={createSession.isPending}>
                      {createSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              <Button
                variant={selectedSessionId === 'all' ? 'default' : 'outline'}
                className={`w-full justify-between rounded-xl h-auto py-3 ${selectedSessionId === 'all' ? 'bg-indigo-600' : 'bg-white'}`}
                onClick={() => setSelectedSessionId('all')}
              >
                <span className="flex items-center gap-2"><ListFilter size={16} /> All Records</span>
              </Button>

              {sessionsLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-400" /></div>
              ) : (
                sessions.map(session => (
                  <div key={session.id} className="group relative">
                    <Button
                      variant={selectedSessionId === session.id ? 'default' : 'outline'}
                      className={`w-full flex-col items-start rounded-xl h-auto py-3 pr-10 ${selectedSessionId === session.id ? 'bg-[#FF7F50]' : 'bg-white'}`}
                      onClick={() => setSelectedSessionId(session.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold truncate">{session.name}</span>
                        {session.isActive && <Check size={16} className={selectedSessionId === session.id ? 'text-white' : 'text-green-600'} />}
                      </div>
                      <span className={`text-[10px] mt-1 ${selectedSessionId === session.id ? 'text-white/80' : 'text-gray-400'}`}>
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </Button>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleSessionActive(session)}>
                        <Check size={14} className={session.isActive ? 'text-green-600' : 'text-gray-400'} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleSessionVisibility(session)}>
                        {session.isVisible ? <Eye size={14} className="text-indigo-600" /> : <EyeOff size={14} className="text-gray-400" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 p-0 text-orange-600" onClick={() => toggleSessionArchive(session)}>
                        <Archive size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="show-archived-sessions" 
                checked={showArchivedSessions} 
                onCheckedChange={(checked) => setShowArchivedSessions(!!checked)}
              />
              <label htmlFor="show-archived-sessions" className="text-xs text-gray-500 cursor-pointer">
                Show Archived Sessions
              </label>
            </div>
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
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-archived-records" 
                      checked={showArchived} 
                      onCheckedChange={(checked) => setShowArchived(!!checked)}
                    />
                    <label htmlFor="show-archived-records" className="text-xs text-gray-500 cursor-pointer">
                      Show Hidden/Archived Records
                    </label>
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={exportToCSV} className="bg-green-600 text-white hover:bg-green-700 hover:text-white font-semibold">
                <Download size={18} className="mr-2" /> Export CSV
              </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="px-6 py-4 font-bold text-gray-700">Name</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-gray-700">Institution</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-gray-700">Check-in Time</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20 px-6">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                      </TableCell>
                    </TableRow>
                  ) : presenceList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20 px-6 text-gray-500">
                        No entries found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    presenceList.map((p) => (
                      <TableRow key={p.id} className={`${p.isArchived ? 'bg-gray-50 opacity-60' : ''} ${!p.isVisible ? 'bg-yellow-50/30' : ''} hover:bg-gray-50/50 transition-colors`}>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                            {p.isArchived && <span className="text-[8px] bg-gray-200 px-1 rounded font-bold uppercase">Archived</span>}
                          </div>
                          <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{p.email}</p>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Building size={12} className="text-gray-400" />
                            <span className="text-xs truncate max-w-[150px]">{p.institution}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock size={12} />
                            {new Date(p.checkInTime).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => toggleVisibility(p)} disabled={updateRecord.isPending}>
                              {p.isVisible ? <Eye size={16} className="text-indigo-600" /> : <EyeOff size={16} className="text-gray-400" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => toggleArchive(p)} disabled={updateRecord.isPending}>
                              <Archive size={16} className={p.isArchived ? 'text-orange-600' : 'text-gray-400'} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-red-600" onClick={() => setDeleteConfirmId({ type: 'record', id: p.id })}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteConfirmId?.type} from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (!deleteConfirmId) return;
                if (deleteConfirmId.type === 'session') {
                  deleteSession.mutate(deleteConfirmId.id);
                } else {
                  deleteRecord.mutate(deleteConfirmId.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
