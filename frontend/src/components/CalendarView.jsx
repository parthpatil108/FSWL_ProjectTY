import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  ListTodo,
  Timer,
  Clock,
  Plus,
} from 'lucide-react';

export default function CalendarView({
  habits = [],
  tasks = [],
  focusSessions = [],
  onToggleTask,
  onToggleHabit,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getLocalDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = getLocalDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(todayStr);
  };

  // Generate calendar days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ dayNumber: d, dateStr: dStr });
  }

  // Map events to date
  const getEventsForDate = (dateStr) => {
    if (!dateStr) return { tasks: [], habits: [], focus: [] };

    const dateTasks = tasks.filter((t) => {
      if (t.scheduledDate === dateStr) return true;
      if (t.dueDate) {
        const dueStr = typeof t.dueDate === 'string' ? t.dueDate.split('T')[0] : new Date(t.dueDate).toISOString().split('T')[0];
        if (dueStr === dateStr) return true;
      }
      return false;
    });

    const dObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dObj.getDay();

    const dateHabits = habits.filter((h) => {
      if (h.isArchived) return false;
      if (h.frequency === 'daily') return true;
      if (h.frequency === 'specific_days' && h.targetDays?.includes(dayOfWeek)) return true;
      return false;
    });

    const dateFocus = focusSessions.filter((s) => {
      const rawDate = s.endTime || s.createdAt;
      if (!rawDate) return false;
      const sDateStr = typeof rawDate === 'string' ? rawDate.split('T')[0] : new Date(rawDate).toISOString().split('T')[0];
      return sDateStr === dateStr;
    });

    return { tasks: dateTasks, habits: dateHabits, focus: dateFocus };
  };

  const selectedEvents = getEventsForDate(selectedDate);
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const formattedSelectedHeader = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(selectedDateObj);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Planner & Calendar
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Inspect scheduled habits, deadlines, and deep work sessions across dates.
          </p>
        </div>

        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={jumpToToday}>
            Today
          </button>
          <button className="btn-icon-subtle" onClick={prevMonth} title="Previous Month">
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '0.92rem', fontWeight: 600, minWidth: '130px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button className="btn-icon-subtle" onClick={nextMonth} title="Next Month">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns (Calendar Grid + Selected Day Agenda) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '16px' }}>
        {/* Left: Month View */}
        <div className="card" style={{ padding: '16px' }}>
          {/* Day of Week Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Month Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {calendarDays.map((item, index) => {
              if (!item) {
                return (
                  <div
                    key={`empty-${index}`}
                    style={{ minHeight: '68px', background: 'transparent' }}
                  />
                );
              }

              const isToday = item.dateStr === todayStr;
              const isSelected = item.dateStr === selectedDate;
              const events = getEventsForDate(item.dateStr);
              const hasEvents = events.tasks.length > 0 || events.habits.length > 0 || events.focus.length > 0;

              return (
                <div
                  key={item.dateStr}
                  style={{
                    minHeight: '68px',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected
                      ? 'var(--bg-surface-active)'
                      : isToday
                      ? 'var(--accent-subtle)'
                      : 'var(--bg-surface)',
                    border: isSelected
                      ? '1px solid var(--accent)'
                      : isToday
                      ? '1px solid var(--accent-border)'
                      : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-fast)',
                  }}
                  onClick={() => setSelectedDate(item.dateStr)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: isToday || isSelected ? 700 : 500,
                        color: isToday ? 'var(--accent)' : 'var(--text-primary)',
                      }}
                    >
                      {item.dayNumber}
                    </span>
                  </div>

                  {/* Micro event indicators */}
                  {hasEvents && (
                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {events.habits.length > 0 && (
                        <span
                          style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)' }}
                          title={`${events.habits.length} habits scheduled`}
                        />
                      )}
                      {events.tasks.length > 0 && (
                        <span
                          style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)' }}
                          title={`${events.tasks.length} tasks scheduled/due`}
                        />
                      )}
                      {events.focus.length > 0 && (
                        <span
                          style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--warning)' }}
                          title={`${events.focus.length} focus sessions logged`}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Agenda */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <div>
              <h2 className="section-title">
                <CalendarIcon size={16} color="var(--accent)" />
                <span>{formattedSelectedHeader}</span>
              </h2>
              <span className="section-description">
                Day agenda and commitments
              </span>
            </div>
          </div>

          {/* Agenda Section: Habits */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Scheduled Habits ({selectedEvents.habits.length})
            </div>
            {selectedEvents.habits.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No habits scheduled for this day of the week.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedEvents.habits.map((h) => {
                  const completedSet = new Set(h.recentCompletedDates || []);
                  const isDone = selectedDate === todayStr ? h.isCompletedToday : completedSet.has(selectedDate);
                  return (
                    <div
                      key={h._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.84rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className={`habit-check-btn ${isDone ? 'completed' : ''}`}
                          onClick={() => onToggleHabit(h._id)}
                          title="Toggle completion for this date"
                        >
                          <CheckCircle2 size={13} />
                        </button>
                        <span style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'inherit' }}>
                          {h.name}
                        </span>
                      </div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                        {h.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Agenda Section: Tasks Due/Scheduled */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tasks Due / Scheduled ({selectedEvents.tasks.length})
            </div>
            {selectedEvents.tasks.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No tasks scheduled or due on this date.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedEvents.tasks.map((t) => (
                  <div
                    key={t._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.84rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        className={`task-checkbox ${t.completed ? 'completed' : ''}`}
                        onClick={() => onToggleTask(t._id)}
                      >
                        {t.completed && <CheckCircle2 size={12} />}
                      </div>
                      <span style={{ textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? 'var(--text-muted)' : 'inherit' }}>
                        {t.title}
                      </span>
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.68rem', textTransform: 'capitalize' }}>
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agenda Section: Logged Focus Sessions */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Logged Focus Sprints ({selectedEvents.focus.length})
            </div>
            {selectedEvents.focus.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No focus sessions logged on this date.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedEvents.focus.map((s) => (
                  <div
                    key={s._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} color="var(--warning)" />
                      <span>{s.durationMinutes} min ({s.category})</span>
                    </div>
                    {s.notes && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                        "{s.notes}"
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
