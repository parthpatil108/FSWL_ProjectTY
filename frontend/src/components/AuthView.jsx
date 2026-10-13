import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function AuthView({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await api.login({ email, password });
      } else {
        res = await api.register({ name, email, password });
      }

      if (res.token && res.user) {
        localStorage.setItem('aura_token', res.token);
        localStorage.setItem('aura_user', JSON.stringify(res.user));
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.login({
        email: 'demo@productivityos.com',
        password: 'password123',
      });
      if (res.token && res.user) {
        localStorage.setItem('aura_token', res.token);
        localStorage.setItem('aura_user', JSON.stringify(res.user));
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(`Could not connect to demo account: ${err.message || 'Please ensure the backend server is running.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '32px 28px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            className="brand-logo-mark"
            style={{ width: '36px', height: '36px', margin: '0 auto 12px', fontSize: '1rem' }}
          >
            D
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Daymark
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '2px' }}>
            Personal Productivity & Habit Operating System
          </p>
        </div>

        {/* Demo Account Button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '9px 12px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'var(--accent)',
              borderColor: 'var(--accent-border)',
              backgroundColor: 'var(--accent-subtle)',
            }}
          >
            <Sparkles size={14} />
            <span>Sign in as Demo User</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            or continue with email
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Switch tab */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-subtle)',
            padding: '3px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              padding: '6px',
              fontSize: '0.8rem',
              background: isLogin ? 'var(--bg-surface)' : 'transparent',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-muted)',
              border: isLogin ? '1px solid var(--border-default)' : '1px solid transparent',
              fontWeight: isLogin ? 600 : 500,
            }}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Sign in
          </button>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              padding: '6px',
              fontSize: '0.8rem',
              background: !isLogin ? 'var(--bg-surface)' : 'transparent',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-muted)',
              border: !isLogin ? '1px solid var(--border-default)' : '1px solid transparent',
              fontWeight: !isLogin ? 600 : 500,
            }}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Create account
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '8px 12px',
              marginBottom: '14px',
              background: 'var(--danger-subtle)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="input"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '9px', marginTop: '6px' }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
