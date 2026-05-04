'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, ExternalLink, LogOut, Users, Presentation, Eye, EyeOff, Archive } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type Link } from '@/lib/db';

export default function AdminPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '', order: 0 });
  const [editForm, setEditForm] = useState({ title: '', url: '', order: 0, isVisible: true, isArchived: false });
  const router = useRouter();

  useEffect(() => {
    fetchLinks();
  }, [showArchived]);

  const fetchLinks = async () => {
    const res = await fetch(`/api/links${showArchived ? '?all=true' : ''}`);
    const data = await res.json();
    setLinks(data);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLink),
    });
    if (res.ok) {
      setNewLink({ title: '', url: '', order: links.length + 1 });
      setIsAdding(false);
      fetchLinks();
    }
  };

  const handleUpdate = async (id: string, updates?: Partial<Link>) => {
    const linkToUpdate = links.find(l => l.id === id);
    if (!linkToUpdate) return;

    const res = await fetch('/api/links', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id, 
        ...(updates || editForm) 
      }),
    });
    if (res.ok) {
      setEditingId(null);
      fetchLinks();
    }
  };

  const toggleVisibility = async (link: Link) => {
    await handleUpdate(link.id, { ...link, isVisible: !link.isVisible });
  };

  const toggleArchive = async (link: Link) => {
    const action = link.isArchived ? 'unarchive' : 'archive';
    if (!confirm(`Are you sure you want to ${action} this link?`)) return;
    await handleUpdate(link.id, { ...link, isArchived: !link.isArchived });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this link?')) return;
    const res = await fetch(`/api/links?id=${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      fetchLinks();
    }
  };

  const startEditing = (link: Link) => {
    setEditingId(link.id);
    setEditForm({ 
      title: link.title, 
      url: link.url, 
      order: link.order,
      isVisible: link.isVisible,
      isArchived: link.isArchived
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
        <div className="flex gap-4 mb-8">
           <a href="/admin" className="bg-[#FF7F50] text-white px-6 py-2 rounded-full font-bold shadow-sm">Links</a>
           <a href="/admin/presence" className="bg-white text-gray-600 px-6 py-2 rounded-full font-bold border hover:bg-gray-50 transition">Presence</a>
        </div>

        <div className="flex justify-between items-center mb-6">
           <div>
            <h2 className="text-xl font-bold text-gray-800">Additional Links</h2>
            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showArchived} 
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded"
              />
              Show Archived Links
            </label>
           </div>
           <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus size={20} /> Add New Link
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-md mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                className="border p-2 rounded w-full text-gray-900"
                required
              />
              <input
                type="url"
                placeholder="URL"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="border p-2 rounded w-full text-gray-900"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
              >
                Save Link
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {links.map((link) => (
            <div key={link.id} className={`bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between ${link.isArchived ? 'opacity-60 bg-gray-100' : ''}`}>
              {editingId === link.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 mr-4">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="border p-1 rounded text-gray-900"
                  />
                  <input
                    type="url"
                    value={editForm.url}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    className="border p-1 rounded text-gray-900"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{link.title}</h3>
                    {link.isArchived && <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">Archived</span>}
                    {!link.isVisible && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">Hidden</span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate max-w-xs md:max-w-md">{link.url}</p>
                </div>
              )}

              <div className="flex items-center gap-1 md:gap-2">
                {editingId === link.id ? (
                  <>
                    <button onClick={() => handleUpdate(link.id)} className="text-green-600 p-2 hover:bg-green-50 rounded">
                      <Save size={20} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 p-2 hover:bg-gray-50 rounded">
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => toggleVisibility(link)} 
                      className={`${link.isVisible ? 'text-indigo-600' : 'text-gray-400'} p-2 hover:bg-indigo-50 rounded transition-colors`}
                      title={link.isVisible ? 'Hide from public' : 'Show to public'}
                    >
                      {link.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                    <button onClick={() => startEditing(link)} className="text-blue-600 p-2 hover:bg-blue-50 rounded">
                      <Edit2 size={20} />
                    </button>
                    <button 
                      onClick={() => toggleArchive(link)} 
                      className={`${link.isArchived ? 'text-orange-600' : 'text-gray-400'} p-2 hover:bg-orange-50 rounded transition-colors`}
                      title={link.isArchived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive size={20} />
                    </button>
                    <button onClick={() => handleDelete(link.id)} className="text-red-600 p-2 hover:bg-red-50 rounded">
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {links.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed">
              No links found. {showArchived ? '' : 'Try checking "Show Archived Links"'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
