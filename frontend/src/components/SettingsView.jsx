import React, { useState } from 'react';
import {
  User,
  Moon,
  Sun,
  Timer,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsView({
  user,
  theme,
  toggleTheme,
  onUpdateProfile,
}) {
  const [name, setName] = useState(user?.name || '');
  const [focusDuration, setFocusDuration] = useState(user?.pomodoroSettings?.focusDuration || 25);
  const [shortBreakDuration, setShortBreakDuration] = useState(user?.pomodoroSettings?.shortBreakDuration || 5);
  const [longBreakDuration, setLongBreakDuration] = useState(user?.pomodoroSettings?.longBreakDuration || 15);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    await onUpdateProfile({
      name,
      pomodoroSettings: {
        focusDuration: Number(focusDuration),
        shortBreakDuration: Number(shortBreakDuration),
        longBreakDuration: Number(longBreakDuration),
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Settings & Preferences
        </h1>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Configure user profile details, interface theme, and default Pomodoro intervals.
        </p>
      </div>

      {savedSuccess && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: 'var(--success-subtle)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: 'var(--success)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <User size={15} color="var(--accent)" />
                <span>Profile Information</span>
              </h2>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="input"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>
        </div>

        {/* Theme Card */}
        <div className="card">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
                <span>Interface Theme</span>
              </h2>
              <span className="section-description">Choose your preferred visual presentation</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              className={`btn ${theme === 'dark' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{
                padding: '12px',
                border: theme === 'dark' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                background: theme === 'dark' ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                color: theme === 'dark' ? 'var(--accent)' : 'inherit',
                fontWeight: theme === 'dark' ? 600 : 400,
              }}
              onClick={() => { if (theme !== 'dark') toggleTheme(); }}
            >
              <Moon size={15} />
              <span>Dark Mode</span>
            </button>

            <button
              type="button"
              className={`btn ${theme === 'light' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{
                padding: '12px',
                border: theme === 'light' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                background: theme === 'light' ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                color: theme === 'light' ? 'var(--accent)' : 'inherit',
                fontWeight: theme === 'light' ? 600 : 400,
              }}
              onClick={() => { if (theme !== 'light') toggleTheme(); }}
            >
              <Sun size={15} />
              <span>Light Mode</span>
            </button>
          </div>
        </div>

        {/* Pomodoro Timer Defaults */}
        <div className="card">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Timer size={15} color="var(--accent)" />
                <span>Default Pomodoro Durations</span>
              </h2>
              <span className="section-description">Preset interval lengths in minutes</span>
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Focus Sprint (Min)</label>
              <input
                type="number"
                className="input"
                min="5"
                max="120"
                value={focusDuration}
                onChange={(e) => setFocusDuration(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Short Break (Min)</label>
              <input
                type="number"
                className="input"
                min="1"
                max="30"
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Long Break (Min)</label>
              <input
                type="number"
                className="input"
                min="5"
                max="60"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px' }}>
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
