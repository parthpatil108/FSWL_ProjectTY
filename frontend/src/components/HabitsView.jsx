import React, { useState } from 'react';
import {
  Plus,
  Flame,
  CheckCircle2,
  Trash2,
  Edit2,
  Archive,
  Calendar,
} from 'lucide-react';

export default function HabitsView({
  habits = [],
  onToggleHabit,
  onOpenCreateHabit,
  onOpenEditHabit,
  onDeleteHabit,
  onArchiveHabit,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewFilter, setViewFilter] = useState('active'); // 'active' | 'archived'

  const categories = ['All', ...new Set(habits.map((h) => h.category).filter(Boolean))];

  const filteredHabits = habits.filter((h) => {
    if (viewFilter === 'active' && h.isArchived) return false;
    if (viewFilter === 'archived' && !h.isArchived) return false;
    if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;
    return true;
  });

  // Generate past 14 days dates array
  const last14Days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    last14Days.push({
      dateStr: `${y}-${m}-${day}`,
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNumber: d.getDate(),
      isToday: i === 0,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Habits & Daily Consistency
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Build momentum through consistent repetition and tracked historical streaks.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenCreateHabit}>
          <Plus size={15} />
          <span>New Habit</span>
        </button>
      </div>

      {/* Filter Row: Categories & Active/Archived */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn ${selectedCategory === cat ? 'btn-secondary' : 'btn-ghost'}`}
              style={{
                padding: '5px 12px',
                fontSize: '0.8rem',
                border: selectedCategory === cat ? '1px solid var(--border-strong)' : '1px solid transparent',
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
          <button
            className="btn"
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              background: viewFilter === 'active' ? 'var(--bg-surface-active)' : 'transparent',
              color: viewFilter === 'active' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
            }}
            onClick={() => setViewFilter('active')}
          >
            Active ({habits.filter((h) => !h.isArchived).length})
          </button>
          <button
            className="btn"
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              background: viewFilter === 'archived' ? 'var(--bg-surface-active)' : 'transparent',
              color: viewFilter === 'archived' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
            }}
            onClick={() => setViewFilter('archived')}
          >
            Archived ({habits.filter((h) => h.isArchived).length})
          </button>
        </div>
      </div>

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CheckCircle2 size={32} className="empty-state-icon" />
            <div className="empty-state-title">No habits found</div>
            <p className="empty-state-text">
              {viewFilter === 'archived' ? 'No archived habits.' : 'Start your first streak by creating a habit.'}
            </p>
            {viewFilter === 'active' && (
              <button className="btn btn-primary" onClick={onOpenCreateHabit}>
                <Plus size={14} /> Create Habit
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredHabits.map((habit) => {
            const completedSet = new Set(habit.recentCompletedDates || []);

            return (
              <div
                key={habit._id}
                className="card card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  padding: '16px 18px',
                }}
              >
                {/* Top Row: Checkbox, Name, Category, Streaks & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <button
                      className={`habit-check-btn ${habit.isCompletedToday ? 'completed' : ''}`}
                      onClick={() => onToggleHabit(habit._id)}
                      title={habit.isCompletedToday ? 'Mark incomplete for today' : 'Mark completed for today'}
                    >
                      <CheckCircle2 size={15} />
                    </button>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.94rem',
                            fontWeight: 600,
                            textDecoration: habit.isCompletedToday ? 'line-through' : 'none',
                            color: habit.isCompletedToday ? 'var(--text-muted)' : 'var(--text-primary)',
                          }}
                        >
                          {habit.name}
                        </span>

                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {habit.category}
                        </span>

                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {habit.frequency === 'daily'
                            ? 'Daily'
                            : habit.frequency === 'specific_days'
                            ? `${habit.targetDays?.length || 5} days/wk`
                            : 'Weekly'}
                        </span>
                      </div>

                      {habit.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="streak-badge">
                      <Flame size={13} />
                      <span>{habit.currentStreak || 0}d streak</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <button
                        className="btn-icon-subtle"
                        title="Edit habit"
                        onClick={() => onOpenEditHabit(habit)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn-icon-subtle"
                        title={habit.isArchived ? 'Restore habit' : 'Archive habit'}
                        onClick={() => onArchiveHabit(habit._id, !habit.isArchived)}
                      >
                        <Archive size={14} />
                      </button>
                      <button
                        className="btn-icon-subtle"
                        style={{ color: 'var(--danger)' }}
                        title="Delete habit"
                        onClick={() => onDeleteHabit(habit._id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: 14-Day Real Consistency Heatmap Strip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span>Target: <strong>{habit.targetCount} {habit.targetUnit}</strong></span>
                    <span>Best streak: <strong>{habit.longestStreak || 0}d</strong></span>
                    <span>Total completions: <strong>{habit.totalCompletions || 0}</strong></span>
                  </div>

                  {/* 14-Day Micro Dots */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '0.68rem', marginRight: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      14-Day Record:
                    </span>
                    {last14Days.map((d) => {
                      const isDone = d.isToday ? habit.isCompletedToday : completedSet.has(d.dateStr);
                      return (
                        <div
                          key={d.dateStr}
                          className={`consistency-dot ${isDone ? 'done' : d.isToday ? 'today-pending' : ''}`}
                          title={`${d.dateStr}: ${isDone ? 'Completed' : 'Not completed'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
