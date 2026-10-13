import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Timer,
  Coffee,
  Clock,
  ListTodo,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export default function FocusTimerView({
  tasks = [],
  habits = [],
  recentSessions = [],
  focusStats = {},
  timerState,
  startTimer,
  pauseTimer,
  resumeTimer,
  resetTimer,
  setMode,
  finishSession,
  updateDetails,
  onSaveSession,
}) {
  const {
    isRunning,
    isPaused,
    sessionType,
    targetMinutes,
    secondsRemaining,
    stopwatchSeconds,
    associatedTaskId,
    category,
    notes,
  } = timerState;

  const formatDisplayTime = () => {
    if (sessionType === 'stopwatch') {
      const mins = Math.floor(stopwatchSeconds / 60);
      const secs = stopwatchSeconds % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalTargetSec = targetMinutes * 60;
  const progressPct =
    sessionType === 'stopwatch'
      ? Math.min(100, Math.round((stopwatchSeconds / 3600) * 100))
      : totalTargetSec > 0
      ? Math.min(100, Math.round(((totalTargetSec - secondsRemaining) / totalTargetSec) * 100))
      : 0;

  const handleFinish = async () => {
    if (!window.confirm('Finish and record this focus session?')) return;
    await finishSession(onSaveSession);
  };

  const handleCancel = () => {
    if (isRunning && !window.confirm('Cancel this focus session without recording?')) return;
    resetTimer();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Focus & Pomodoro Timer
        </h1>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Execute deep work sprints, track time spent on tasks, and maintain uninterrupted attention.
        </p>
      </div>

      {/* Top 3 Metric Summary Strip */}
      <div className="grid-3">
        <div className="card">
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Today's Focus Output
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            {focusStats?.todayHours || '0.0'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>hrs</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {focusStats?.todayMinutes || 0} minutes logged today
          </span>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Past 7 Days Output
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            {focusStats?.weekHours || '0.0'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>hrs</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Across {focusStats?.totalSessionsCount || 0} logged sprints
          </span>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Top Focus Category
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '4px' }}>
            {focusStats?.categoryBreakdown?.[0]?._id || 'Deep Work'}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {focusStats?.categoryBreakdown?.[0]?.totalMinutes
              ? `${Math.round(focusStats.categoryBreakdown[0].totalMinutes / 60)} hrs accumulated`
              : 'Consistent attention block'}
          </span>
        </div>
      </div>

      {/* Main Timer Workspace */}
      <div className="card" style={{ padding: '36px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Mode Selector Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px',
            marginBottom: '32px',
          }}
        >
          <button
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-pill)',
              background: sessionType === 'pomodoro' ? 'var(--bg-surface)' : 'transparent',
              color: sessionType === 'pomodoro' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: sessionType === 'pomodoro' ? '1px solid var(--border-default)' : '1px solid transparent',
              fontWeight: sessionType === 'pomodoro' ? 600 : 500,
            }}
            onClick={() => setMode('pomodoro', 25)}
            disabled={isRunning}
          >
            Pomodoro (25m)
          </button>
          <button
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-pill)',
              background: sessionType === 'short_break' ? 'var(--bg-surface)' : 'transparent',
              color: sessionType === 'short_break' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: sessionType === 'short_break' ? '1px solid var(--border-default)' : '1px solid transparent',
              fontWeight: sessionType === 'short_break' ? 600 : 500,
            }}
            onClick={() => setMode('short_break', 5)}
            disabled={isRunning}
          >
            Short Break (5m)
          </button>
          <button
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-pill)',
              background: sessionType === 'long_break' ? 'var(--bg-surface)' : 'transparent',
              color: sessionType === 'long_break' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: sessionType === 'long_break' ? '1px solid var(--border-default)' : '1px solid transparent',
              fontWeight: sessionType === 'long_break' ? 600 : 500,
            }}
            onClick={() => setMode('long_break', 15)}
            disabled={isRunning}
          >
            Long Break (15m)
          </button>
          <button
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-pill)',
              background: sessionType === 'stopwatch' ? 'var(--bg-surface)' : 'transparent',
              color: sessionType === 'stopwatch' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: sessionType === 'stopwatch' ? '1px solid var(--border-default)' : '1px solid transparent',
              fontWeight: sessionType === 'stopwatch' ? 600 : 500,
            }}
            onClick={() => setMode('stopwatch')}
            disabled={isRunning}
          >
            Stopwatch
          </button>
        </div>

        {/* Large Restrained Timer Display */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '4.8rem',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}
          >
            {formatDisplayTime()}
          </div>

          <div style={{ width: '240px', margin: '0 auto' }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          {!isRunning && !isPaused && (
            <button
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.94rem' }}
              onClick={() => startTimer()}
            >
              <Play size={16} />
              <span>Start Session</span>
            </button>
          )}

          {isRunning && !isPaused && (
            <>
              <button
                className="btn btn-secondary"
                style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                onClick={pauseTimer}
              >
                <Pause size={16} />
                <span>Pause</span>
              </button>
              <button
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                onClick={handleFinish}
              >
                <CheckCircle size={16} />
                <span>Finish & Record</span>
              </button>
              <button
                className="btn btn-ghost"
                style={{ padding: '10px 14px', fontSize: '0.84rem' }}
                onClick={handleCancel}
              >
                <RotateCcw size={15} />
                <span>Cancel</span>
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                onClick={resumeTimer}
              >
                <Play size={16} />
                <span>Resume</span>
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                onClick={handleFinish}
              >
                <CheckCircle size={16} />
                <span>Finish & Record</span>
              </button>
              <button
                className="btn btn-ghost"
                style={{ padding: '10px 14px', fontSize: '0.84rem' }}
                onClick={handleCancel}
              >
                <RotateCcw size={15} />
                <span>Cancel</span>
              </button>
            </>
          )}
        </div>

        {/* Session Metadata Config (Task association & Category) */}
        <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Link Task (Optional)</label>
              <select
                className="select"
                value={associatedTaskId}
                onChange={(e) => updateDetails({ associatedTaskId: e.target.value })}
                disabled={isRunning}
              >
                <option value="">No task linked</option>
                {tasks.map((t) => (
                  <option key={t._id} value={t._id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select
                className="select"
                value={category}
                onChange={(e) => updateDetails({ category: e.target.value })}
                disabled={isRunning}
              >
                <option value="Deep Work">Deep Work</option>
                <option value="Coding">Coding & Dev</option>
                <option value="Writing">Writing & Docs</option>
                <option value="Academics">Study & Research</option>
                <option value="General">General Focus</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Session Intent or Notes</label>
            <input
              type="text"
              className="input"
              placeholder="What are you aiming to complete during this block?"
              value={notes}
              onChange={(e) => updateDetails({ notes: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Focus Session Log History */}
      <div className="card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Clock size={16} color="var(--text-secondary)" />
              <span>Session Log History</span>
            </h2>
            <span className="section-description">
              Recent recorded deep work sprints.
            </span>
          </div>
        </div>

        {recentSessions.length === 0 ? (
          <div className="empty-state">
            <Timer size={28} className="empty-state-icon" />
            <div className="empty-state-title">No focus sessions logged yet</div>
            <p className="empty-state-text">Start and complete your first timer session to track productivity hours.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentSessions.map((s) => (
              <div
                key={s._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.84rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                    {s.sessionType.replace('_', ' ')}
                  </span>
                  <span style={{ fontWeight: 600 }}>{s.durationMinutes} min</span>
                  <span style={{ color: 'var(--text-muted)' }}>• {s.category}</span>
                  {s.associatedTask?.title && (
                    <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                      [{s.associatedTask.title}]
                    </span>
                  )}
                  {s.notes && (
                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      — "{s.notes}"
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {new Date(s.endTime || s.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
