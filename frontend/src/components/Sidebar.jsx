import React from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  ListTodo,
  Timer,
  BookOpen,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  Flame,
  X,
} from 'lucide-react';

export default function Sidebar({
  currentView,
  setCurrentView,
  user,
  onLogout,
  counts = {},
  isTimerRunning = false,
  mobileOpen = false,
  onCloseMobile = () => {},
}) {
  const sections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Organize',
      items: [
        { id: 'tasks', label: 'Tasks', icon: ListTodo, badge: counts.tasksCount },
        { id: 'habits', label: 'Habits', icon: CheckCircle2, badge: counts.habitsCount },
        { id: 'calendar', label: 'Calendar', icon: CalendarDays },
      ],
    },
    {
      title: 'Focus',
      items: [
        {
          id: 'focus',
          label: 'Focus Timer',
          icon: Timer,
          badge: isTimerRunning ? 'Active' : undefined,
          badgeAccent: isTimerRunning,
        },
      ],
    },
    {
      title: 'Personal',
      items: [
        { id: 'notes', label: 'Notes', icon: BookOpen },
      ],
    },
    {
      title: 'Insights',
      items: [
        { id: 'analytics', label: 'Analytics & Goals', icon: BarChart3 },
      ],
    },
    {
      title: 'System',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const handleNavClick = (id) => {
    setCurrentView(id);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-logo-mark">D</div>
            <span className="brand-title">Daymark</span>
          </div>
          {mobileOpen && (
            <button className="btn-icon-subtle" onClick={onCloseMobile}>
              <X size={16} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {sections.map((sec) => (
            <div key={sec.title} className="sidebar-section">
              <div className="sidebar-section-title">{sec.title}</div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`nav-badge ${item.badgeAccent ? 'active-badge' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-snippet">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-subtext">
                <Flame size={12} color="var(--warning)" />
                <span>{user?.gamification?.currentStreak || 0}d streak</span>
              </div>
            </div>
            <button
              className="btn-icon-subtle"
              onClick={onLogout}
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
