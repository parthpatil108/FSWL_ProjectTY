import React, { useState } from 'react';
import {
  CheckCircle2,
  ListTodo,
  Timer,
  Flame,
  ArrowRight,
  Plus,
  Play,
  Clock,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export default function DashboardView({
  dashboardData,
  user,
  onToggleHabit,
  onToggleTask,
  onNavigate,
  onOpenCreateHabit,
  onOpenCreateTask,
  onStartFocus,
  onQuickCreateTask,
}) {
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  const habits = dashboardData?.habits?.list || [];
  const tasks = dashboardData?.tasks?.list || [];
  const focus = dashboardData?.focus || {};
  const gamification = dashboardData?.userGamification || user?.gamification || {};

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickTaskSubmit = (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    if (onQuickCreateTask) {
      onQuickCreateTask(quickTaskTitle.trim());
      setQuickTaskTitle('');
    } else {
      onOpenCreateTask();
    }
  };

  const todayHabitsDone = dashboardData?.habits?.completed || 0;
  const todayHabitsTotal = dashboardData?.habits?.total || 0;
  const habitPct = todayHabitsTotal > 0 ? Math.round((todayHabitsDone / todayHabitsTotal) * 100) : 0;

  const todayTasksDone = dashboardData?.tasks?.completed || 0;
  const todayTasksTotal = dashboardData?.tasks?.total || 0;
  const taskPct = todayTasksTotal > 0 ? Math.round((todayTasksDone / todayTasksTotal) * 100) : 0;
  const overdueCount = dashboardData?.tasks?.overdueCount || 0;

  // Last 7 days helper for real mini-strip
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    last7Days.push({
      dateStr: `${y}-${m}-${day}`,
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isToday: i === 0,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header: Greeting & Quick Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'there'}
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Here is your daily agenda. Focus on completing your active commitments.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={onOpenCreateHabit}>
            <Plus size={14} />
            <span>Habit</span>
          </button>
          <button className="btn btn-secondary" onClick={onOpenCreateTask}>
            <Plus size={14} />
            <span>Task</span>
          </button>
          <button className="btn btn-primary" onClick={onStartFocus}>
            <Play size={14} />
            <span>Start Focus</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Daily Summary Bar */}
      <div className="grid-4">
        {/* Habits Block */}
        <div className="card card-interactive" onClick={() => onNavigate('habits')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Today's Habits</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{habitPct}%</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
            {todayHabitsDone} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {todayHabitsTotal}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${habitPct}%`, backgroundColor: 'var(--success)' }} />
          </div>
        </div>

        {/* Tasks Block */}
        <div className="card card-interactive" onClick={() => onNavigate('tasks')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Today's Tasks</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{taskPct}%</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
            {todayTasksDone} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {todayTasksTotal}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${taskPct}%`, backgroundColor: 'var(--accent)' }} />
          </div>
        </div>

        {/* Focus Hours Block */}
        <div className="card card-interactive" onClick={() => onNavigate('focus')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Focus Time</span>
            <Clock size={14} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
            {focus?.todayHours || '0.0'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>hrs</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {focus?.sessionCount || 0} session(s) logged today
          </span>
        </div>

        {/* Streak Block */}
        <div className="card card-interactive" onClick={() => onNavigate('analytics')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Daily Streak</span>
            <Flame size={14} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: 'var(--warning)' }}>
            {gamification?.currentStreak || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>days</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Personal best: {gamification?.longestStreak || 0} days
          </span>
        </div>
      </div>

      {/* Overdue Items Alert Badge (if any) */}
      {overdueCount > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--danger-subtle)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--danger)',
            fontSize: '0.84rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>You have <strong>{overdueCount} overdue task(s)</strong> that need attention.</span>
          </div>
          <button
            className="btn btn-ghost"
            style={{ color: 'var(--danger)', padding: '2px 8px', fontSize: '0.78rem', fontWeight: 600 }}
            onClick={() => onNavigate('tasks')}
          >
            Review tasks <ArrowRight size={13} style={{ marginLeft: '4px' }} />
          </button>
        </div>
      )}

      {/* 3. Main Action Grid: Habits & Tasks */}
      <div className="grid-2">
        {/* Left Column: Today's Scheduled Habits */}
        <div className="card">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Today's Habits</span>
              </h2>
              <span className="section-description">
                {todayHabitsDone} of {todayHabitsTotal} completed today
              </span>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '4px 8px' }} onClick={() => onNavigate('habits')}>
              View All <ArrowRight size={13} />
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={28} className="empty-state-icon" />
              <div className="empty-state-title">No habits scheduled</div>
              <p className="empty-state-text">Start building consistency with your daily anchor habits.</p>
              <button className="btn btn-primary" onClick={onOpenCreateHabit}>
                <Plus size={14} /> Add Habit
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {habits.map((habit) => (
                <div
                  key={habit._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: habit.isCompletedToday ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <button
                      className={`habit-check-btn ${habit.isCompletedToday ? 'completed' : ''}`}
                      onClick={() => onToggleHabit(habit._id)}
                      title={habit.isCompletedToday ? 'Mark incomplete' : 'Mark completed for today'}
                    >
                      <CheckCircle2 size={14} />
                    </button>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.86rem',
                          fontWeight: 500,
                          textDecoration: habit.isCompletedToday ? 'line-through' : 'none',
                          color: habit.isCompletedToday ? 'var(--text-muted)' : 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {habit.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                          {habit.category}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {habit.targetCount} {habit.targetUnit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="streak-badge" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
                    <Flame size={11} />
                    <span>{habit.currentStreak || 0}d</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Today's Tasks */}
        <div className="card">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <ListTodo size={16} color="var(--accent)" />
                <span>Today's Tasks</span>
              </h2>
              <span className="section-description">
                {todayTasksDone} of {todayTasksTotal} completed
              </span>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '4px 8px' }} onClick={() => onNavigate('tasks')}>
              View All <ArrowRight size={13} />
            </button>
          </div>

          {/* Quick inline task creation input */}
          <form onSubmit={handleQuickTaskSubmit} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="input"
                style={{ height: '34px', fontSize: '0.82rem' }}
                placeholder="+ Add task for today (Press Enter)..."
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '0 10px', height: '34px' }}>
                <Plus size={14} />
              </button>
            </div>
          </form>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <ListTodo size={28} className="empty-state-icon" />
              <div className="empty-state-title">No tasks due today</div>
              <p className="empty-state-text">You are all caught up for today. Add a new task above.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasks.slice(0, 6).map((task) => (
                <div
                  key={task._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: task.completed ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div
                      className={`task-checkbox ${task.completed ? 'completed' : ''}`}
                      onClick={() => onToggleTask(task._id)}
                      title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.completed && <CheckCircle2 size={12} />}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.86rem',
                          fontWeight: 500,
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {task.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span
                          className={`badge ${
                            task.priority === 'urgent'
                              ? 'badge-danger'
                              : task.priority === 'high'
                              ? 'badge-warning'
                              : 'badge-neutral'
                          }`}
                          style={{ fontSize: '0.68rem', padding: '1px 5px', textTransform: 'capitalize' }}
                        >
                          {task.priority}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {task.category}
                        </span>
                        {task.subtasks && task.subtasks.length > 0 && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            • {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Row: Quick Focus Launcher & Real 7-Day Consistency Matrix */}
      <div className="grid-2">
        {/* Quick Focus Sprint Box */}
        <div className="card">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Timer size={16} color="var(--accent)" />
                <span>Focus Sprint Launcher</span>
              </h2>
              <span className="section-description">
                Eliminate distractions and enter deep work mode.
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '6px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '12px 10px', flexDirection: 'column', gap: '4px', textAlign: 'center' }}
              onClick={onStartFocus}
            >
              <span style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--accent)' }}>25 min</span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Pomodoro</span>
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '12px 10px', flexDirection: 'column', gap: '4px', textAlign: 'center' }}
              onClick={onStartFocus}
            >
              <span style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--accent)' }}>50 min</span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Deep Sprint</span>
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '12px 10px', flexDirection: 'column', gap: '4px', textAlign: 'center' }}
              onClick={onStartFocus}
            >
              <span style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--accent)' }}>15 min</span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Quick Focus</span>
            </button>
          </div>
        </div>

        {/* 7-Day Consistency Dot Matrix (Real Data) */}
        <div className="card">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Calendar size={16} color="var(--text-secondary)" />
                <span>7-Day Habit Consistency</span>
              </h2>
              <span className="section-description">
                Real completion records for your active habits.
              </span>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '4px 8px' }} onClick={() => onNavigate('habits')}>
              Manage <ArrowRight size={13} />
            </button>
          </div>

          {habits.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              No habits configured yet to track consistency.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {habits.slice(0, 4).map((h) => {
                const completedSet = new Set(h.recentCompletedDates || []);
                return (
                  <div key={h._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        maxWidth: '180px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h.name}
                    </span>

                    <div className="consistency-dot-grid">
                      {last7Days.map((d) => {
                        const isDone = d.isToday ? h.isCompletedToday : completedSet.has(d.dateStr);
                        return (
                          <div
                            key={d.dateStr}
                            className={`consistency-dot ${isDone ? 'done' : d.isToday ? 'today-pending' : ''}`}
                            title={`${d.dateStr}: ${isDone ? 'Completed' : 'Missed'}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
