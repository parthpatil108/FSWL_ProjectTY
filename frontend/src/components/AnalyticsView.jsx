import React, { useState } from 'react';
import {
  BarChart3,
  Flame,
  Clock,
  CheckCircle2,
  Target,
  Plus,
  Trash2,
} from 'lucide-react';

export default function AnalyticsView({
  insightsData,
  goals = [],
  onSaveGoal,
  onUpdateGoal,
  onDeleteGoal,
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [newGoalModalOpen, setNewGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState(10);
  const [goalUnit, setGoalUnit] = useState('times');
  const [goalCategory, setGoalCategory] = useState('Productivity');

  const habitTrends = insightsData?.habitTrends || [];
  const categoryDistribution = insightsData?.categoryDistribution || [];
  const mostConsistent = insightsData?.mostConsistentHabit;

  // Real Max Values for chart scaling
  const maxCompletions = Math.max(1, ...habitTrends.map((t) => t.completedHabits || 0));
  const maxFocusHours = Math.max(1, ...habitTrends.map((t) => t.focusHours || 0));

  const handleCreateGoalSubmit = (e) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    if (onSaveGoal) {
      onSaveGoal({
        title: goalTitle.trim(),
        targetValue: Number(goalTarget),
        unit: goalUnit.trim(),
        category: goalCategory,
      });
    }
    setGoalTitle('');
    setNewGoalModalOpen(false);
  };

  const handleIncrementGoal = (goal) => {
    const newVal = (goal.currentValue || 0) + 1;
    if (onUpdateGoal) {
      onUpdateGoal(goal._id, { currentValue: newVal });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Analytics, Trends & Goals
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Historical performance derived from actual stored habits, tasks, and deep work sessions.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setNewGoalModalOpen(true)}>
          <Plus size={15} />
          <span>New Goal</span>
        </button>
      </div>

      {/* 4 KPI Metrics Strip */}
      <div className="grid-4">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <Clock size={15} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>14-Day Focus Hours</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            {insightsData?.totalFocusHours || '0.0'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>hrs</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {insightsData?.totalFocusSessionsCount || 0} logged sprints
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <CheckCircle2 size={15} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Monitored Habits</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            {insightsData?.totalHabitsCount || 0}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Active daily routines
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <BarChart3 size={15} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Tasks Completed</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            {insightsData?.totalTasksCompleted || 0}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Delivered in the last 14 days
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--warning)', marginBottom: '6px' }}>
            <Flame size={15} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Top Anchor Habit</span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {mostConsistent?.name || 'None yet'}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {mostConsistent ? `${mostConsistent.streak}d streak (${mostConsistent.total} logs)` : 'Start tracking'}
          </span>
        </div>
      </div>

      {/* 2 SVG Charts: 14-Day Habit Completions & 14-Day Focus Time */}
      <div className="grid-2">
        {/* Chart 1: Habit Completions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <div>
              <h2 className="section-title">
                <CheckCircle2 size={15} color="var(--success)" />
                <span>Habit Completions (Last 14 Days)</span>
              </h2>
              <span className="section-description">Total habits marked complete per calendar date</span>
            </div>
          </div>

          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '6px', paddingTop: '20px', position: 'relative' }}>
            {habitTrends.map((t, idx) => {
              const heightPct = Math.round(((t.completedHabits || 0) / maxCompletions) * 100);
              const isHovered = activeTooltip === `habit-${idx}`;

              return (
                <div
                  key={t.date}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    position: 'relative',
                  }}
                  onMouseEnter={() => setActiveTooltip(`habit-${idx}`)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: `${Math.min(90, heightPct + 12)}%`,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-strong)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.72rem',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        boxShadow: 'var(--shadow-md)',
                      }}
                    >
                      {t.date}: <strong>{t.completedHabits} done</strong>
                    </div>
                  )}

                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(4, heightPct)}%`,
                      borderRadius: '3px 3px 0 0',
                      backgroundColor: isHovered ? 'var(--accent)' : 'var(--border-strong)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                  />
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {t.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Focus Hours */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <div>
              <h2 className="section-title">
                <Clock size={15} color="var(--accent)" />
                <span>Focus Hours Output (Last 14 Days)</span>
              </h2>
              <span className="section-description">Deep work hours logged per date</span>
            </div>
          </div>

          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '6px', paddingTop: '20px', position: 'relative' }}>
            {habitTrends.map((t, idx) => {
              const heightPct = Math.round(((t.focusHours || 0) / maxFocusHours) * 100);
              const isHovered = activeTooltip === `focus-${idx}`;

              return (
                <div
                  key={t.date}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    position: 'relative',
                  }}
                  onMouseEnter={() => setActiveTooltip(`focus-${idx}`)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: `${Math.min(90, heightPct + 12)}%`,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-strong)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.72rem',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        boxShadow: 'var(--shadow-md)',
                      }}
                    >
                      {t.date}: <strong>{t.focusHours} hrs ({t.focusMinutes}m)</strong>
                    </div>
                  )}

                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(4, heightPct)}%`,
                      borderRadius: '3px 3px 0 0',
                      backgroundColor: isHovered ? 'var(--accent)' : 'var(--accent-subtle)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                  />
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {t.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Measurable Targets & Goals Section */}
      <div className="card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Target size={16} color="var(--accent)" />
              <span>Measurable Goals & Targets</span>
            </h2>
            <span className="section-description">
              Set milestones and track quantitative progress.
            </span>
          </div>

          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => setNewGoalModalOpen(true)}>
            <Plus size={13} /> Add Goal
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="empty-state">
            <Target size={28} className="empty-state-icon" />
            <div className="empty-state-title">No active goals configured</div>
            <p className="empty-state-text">Create targets such as "Read 10 Books" or "Complete 20 Workouts" to measure progress.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {goals.map((g) => {
              const pct = Math.min(100, Math.round(((g.currentValue || 0) / g.targetValue) * 100));
              return (
                <div
                  key={g._id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {g.title}
                      </div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.68rem', marginTop: '3px' }}>
                        {g.category}
                      </span>
                    </div>

                    <button
                      className="btn-icon-subtle"
                      style={{ color: 'var(--danger)' }}
                      title="Delete goal"
                      onClick={() => onDeleteGoal && onDeleteGoal(g._id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                      <span>Progress</span>
                      <span><strong>{g.currentValue || 0}</strong> / {g.targetValue} {g.unit} ({pct}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? 'var(--success)' : 'var(--accent)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                      onClick={() => handleIncrementGoal(g)}
                    >
                      +1 {g.unit}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {newGoalModalOpen && (
        <div className="modal-overlay" onClick={() => setNewGoalModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Measurable Goal</h3>
            </div>

            <form onSubmit={handleCreateGoalSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Goal Title *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Read 12 Books this Year"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Target Quantity *</label>
                    <input
                      type="number"
                      className="input"
                      min="1"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit of Measure</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="books, sessions, km"
                      value={goalUnit}
                      onChange={(e) => setGoalUnit(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="select"
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Health">Health & Fitness</option>
                    <option value="Learning">Learning</option>
                    <option value="Career">Career & Work</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setNewGoalModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
