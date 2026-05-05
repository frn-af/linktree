import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface PresenceSession {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isVisible: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface PresenceRecord {
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

// Sessions
export function usePresenceSessions(showAll: boolean = false) {
  return useQuery<PresenceSession[]>({
    queryKey: ['presence-sessions', showAll],
    queryFn: async () => {
      const res = await fetch(`/api/presence/sessions${showAll ? '?all=true' : ''}`);
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    },
  });
}

export function useCreatePresenceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSession: Partial<PresenceSession>) => {
      const res = await fetch('/api/presence/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });
      if (!res.ok) throw new Error('Failed to create session');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presence-sessions'] });
      toast.success('Session created successfully');
    },
    onError: () => {
      toast.error('Failed to create session');
    },
  });
}

export function useUpdatePresenceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedSession: Partial<PresenceSession> & { id: string }) => {
      const res = await fetch('/api/presence/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSession),
      });
      if (!res.ok) throw new Error('Failed to update session');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presence-sessions'] });
      // Invalidate presence records too as active session might have changed
      queryClient.invalidateQueries({ queryKey: ['presence-records'] });
      toast.success('Session updated successfully');
    },
    onError: () => {
      toast.error('Failed to update session');
    },
  });
}

export function useDeletePresenceSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/presence/sessions?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete session');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presence-sessions'] });
      toast.success('Session deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete session');
    },
  });
}

// Records
export function usePresenceRecords(sessionId?: string | 'all', showAll: boolean = false) {
  return useQuery<PresenceRecord[]>({
    queryKey: ['presence-records', sessionId, showAll],
    queryFn: async () => {
      let url = `/api/presence?${showAll ? 'all=true' : ''}`;
      if (sessionId && sessionId !== 'all') {
        url += `&sessionId=${sessionId}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch presence records');
      return res.json();
    },
  });
}

export function useCreatePresenceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newRecord: Partial<PresenceRecord>) => {
      const res = await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      if (!res.ok) throw new Error('Failed to submit presence');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presence-records'] });
      toast.success('Presence submitted successfully');
    },
    onError: () => {
      toast.error('Failed to submit presence');
    },
  });
}

export function useUpdatePresenceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedRecord: Partial<PresenceRecord> & { id: string }) => {
      const res = await fetch('/api/presence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecord),
      });
      if (!res.ok) throw new Error('Failed to update presence record');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presence-records'] });
      toast.success('Record updated successfully');
    },
    onError: () => {
      toast.error('Failed to update record');
    },
  });
}

export function useDeletePresenceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/presence?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete record');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presence-records'] });
      toast.success('Record deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete record');
    },
  });
}
