import React, { useState } from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  BookOpen,
  Tag,
} from 'lucide-react';

export default function NotesView({
  notes = [],
  onOpenCreateNote,
  onOpenEditNote,
  onDeleteNote,
  onTogglePinNote,
  onQuickCreateNote,
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quickThought, setQuickThought] = useState('');

  const categories = ['All', ...new Set(notes.map((n) => n.category).filter(Boolean))];

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickThought.trim()) return;
    if (onQuickCreateNote) {
      onQuickCreateNote({
        title: quickThought.trim().slice(0, 40),
        content: quickThought.trim(),
        category: 'Quick Thoughts',
      });
      setQuickThought('');
    } else {
      onOpenCreateNote();
    }
  };

  const filteredNotes = notes.filter((note) => {
    if (selectedCategory !== 'All' && note.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      const inTitle = note.title?.toLowerCase().includes(q);
      const inContent = note.content?.toLowerCase().includes(q);
      const inTags = note.tags?.some((t) => t.toLowerCase().includes(q));
      if (!inTitle && !inContent && !inTags) return false;
    }
    return true;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const renderNoteCard = (note) => (
    <div
      key={note._id}
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '10px',
        padding: '14px 16px',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
            {note.category}
          </span>
          <button
            className="btn-icon-subtle"
            style={{ color: note.isPinned ? 'var(--warning)' : 'var(--text-muted)' }}
            title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
            onClick={() => onTogglePinNote(note._id)}
          >
            <Pin size={13} fill={note.isPinned ? 'currentColor' : 'none'} />
          </button>
        </div>

        <h3 style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {note.title}
        </h3>

        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-line',
            lineHeight: 1.45,
            maxHeight: '120px',
            overflowY: 'auto',
          }}
        >
          {note.content}
        </p>

        {note.tags && note.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
            {note.tags.map((t, idx) => (
              <span key={idx} style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '1px 6px', borderRadius: 'var(--radius-xs)' }}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '4px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button
            className="btn-icon-subtle"
            title="Edit note"
            onClick={() => onOpenEditNote(note)}
          >
            <Edit2 size={13} />
          </button>
          <button
            className="btn-icon-subtle"
            style={{ color: 'var(--danger)' }}
            title="Delete note"
            onClick={() => onDeleteNote(note._id)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Notes & Thought Capture
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Quickly capture ideas, meeting takeaways, and unstructured thoughts.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenCreateNote}>
          <Plus size={15} />
          <span>New Note</span>
        </button>
      </div>

      {/* Quick Thought Capture Box */}
      <form onSubmit={handleQuickSubmit}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            className="input"
            style={{ height: '38px', fontSize: '0.86rem' }}
            placeholder="+ Quick thought capture (Press Enter to save instantly)..."
            value={quickThought}
            onChange={(e) => setQuickThought(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" style={{ height: '38px', padding: '0 14px' }}>
            <Plus size={15} />
            <span>Capture</span>
          </button>
        </div>
      </form>

      {/* Search and Category Filter Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '360px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '32px', height: '34px', fontSize: '0.82rem' }}
            placeholder="Search notes and tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {categories.map((c) => (
            <button
              key={c}
              className={`btn ${selectedCategory === c ? 'btn-secondary' : 'btn-ghost'}`}
              style={{
                fontSize: '0.78rem',
                padding: '4px 10px',
                border: selectedCategory === c ? '1px solid var(--border-strong)' : '1px solid transparent',
              }}
              onClick={() => setSelectedCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <BookOpen size={32} className="empty-state-icon" />
            <div className="empty-state-title">No notes found</div>
            <p className="empty-state-text">Capture your first thought or memo using the capture box above.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Pin size={13} color="var(--warning)" fill="currentColor" />
                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pinned ({pinnedNotes.length})
                </span>
              </div>
              <div className="grid-3">
                {pinnedNotes.map(renderNoteCard)}
              </div>
            </div>
          )}

          {/* All Other Notes */}
          <div>
            {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
              <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                Other Notes ({unpinnedNotes.length})
              </div>
            )}
            <div className="grid-3">
              {unpinnedNotes.map(renderNoteCard)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
