'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, ExternalLink } from 'lucide-react';

interface Link {
  id: string;
  title: string;
  url: string;
  order: number;
}

export default function AdminPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [editForm, setEditForm] = useState({ title: '', url: '' });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const res = await fetch('/api/links');
    const data = await res.json();
    setLinks(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLink),
    });
    if (res.ok) {
      setNewLink({ title: '', url: '' });
      setIsAdding(false);
      fetchLinks();
    }
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch('/api/links', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editForm }),
    });
    if (res.ok) {
      setEditingId(null);
      fetchLinks();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`/api/links?id=${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      fetchLinks();
    }
  };

  const startEditing = (link: Link) => {
    setEditingId(link.id);
    setEditForm({ title: link.title, url: link.url });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Link Manager</h1>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={20} /> Add Link
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-md mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title (e.g., My Instagram)"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                className="border p-2 rounded w-full text-gray-900"
                required
              />
              <input
                type="url"
                placeholder="URL (https://...)"
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
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
              >
                Save Link
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {links.map((link) => (
            <div key={link.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between">
              {editingId === link.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 mr-4">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="border p-1 rounded"
                  />
                  <input
                    type="url"
                    value={editForm.url}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    className="border p-1 rounded"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{link.title}</h3>
                  <p className="text-sm text-gray-500 truncate max-w-xs md:max-w-md">{link.url}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
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
                    <button onClick={() => startEditing(link)} className="text-blue-600 p-2 hover:bg-blue-50 rounded">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => handleDelete(link.id)} className="text-red-600 p-2 hover:bg-red-50 rounded">
                      <Trash2 size={20} />
                    </button>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 p-2 hover:bg-gray-50 rounded">
                      <ExternalLink size={20} />
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
          {links.length === 0 && !isAdding && (
            <div className="text-center py-12 text-gray-500">
              No links yet. Click "Add Link" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
