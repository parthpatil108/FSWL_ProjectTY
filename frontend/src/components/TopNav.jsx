import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Plus,
  Flame,
  CheckCircle2,
  ListTodo,
  Timer,
  BookOpen,
  Menu,
  Play,
  Pause,
} from 'lucide-react';

export default function TopNav({
  title,
  theme,
  toggleTheme,
  userStreak = 0,
  activeTimer = null,
  onOpenCreateHabit,
  onOpenCreateTask,
  onOpenCreateNote,
  onStartFocus,
  onToggleMobileMenu = () => {},
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const formatTimerSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header className="top-navbar">
      <div className="top-navbar-left">
        <button
          className="btn-icon mobile-menu-btn"
          onClick={onToggleMobileMenu}
          title="Toggle Navigation"
        >
          <Menu size={18} />
        </button>
        <div>
          <h2 className="top-title">{title}</h2>
          <span className="top-subtitle">{todayFormatted}</span>
        </div>
      </div>

      <div className="top-actions">
        {/* Active Timer Pill if Timer is Running */}
        {activeTimer && activeTimer.isRunning && (
          <div
            className="timer-pill-active"
            onClick={onStartFocus}
            title="Focus Session in Progress — Click to open Focus Timer"
          >
            <Timer size={14} />
            <span className="timer-pill-time">
              {formatTimerSeconds(activeTimer.secondsRemaining)}
            </span>
          </div>
        )}

        {/* Overall Streak Indicator */}
        <div className="streak-badge" title="Consecutive daily consistency streak">
          <Flame size={13} />
          <span>{userStreak}d streak</span>
        </div>

        {/* Theme Toggle */}
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Quick Add Menu */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-primary"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ padding: '6px 12px' }}
          >
            <Plus size={15} />
            <span>Create</span>
          </button>

          {dropdownOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                onClick={() => setDropdownOpen(false)}
              />
              <div
                className="card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  width: '180px',
                  padding: '6px',
                  zIndex: 50,
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <button
                  className="nav-item"
                  style={{ width: '100%', padding: '7px 10px' }}
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenCreateTask();
                  }}
                >
                  <ListTodo size={15} />
                  <span>New Task</span>
                </button>
                <button
                  className="nav-item"
                  style={{ width: '100%', padding: '7px 10px' }}
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenCreateHabit();
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>New Habit</span>
                </button>
                <button
                  className="nav-item"
                  style={{ width: '100%', padding: '7px 10px' }}
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenCreateNote();
                  }}
                >
                  <BookOpen size={15} />
                  <span>Capture Note</span>
                </button>
                <button
                  className="nav-item"
                  style={{ width: '100%', padding: '7px 10px' }}
                  onClick={() => {
                    setDropdownOpen(false);
                    onStartFocus();
                  }}
                >
                  <Timer size={15} />
                  <span>Focus Timer</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
