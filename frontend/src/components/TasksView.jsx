import React, { useState } from 'react';
import {
  Plus,
  ListTodo,
  CheckCircle2,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Search,
  AlertCircle,
} from 'lucide-react';

export default function TasksView({
  tasks = [],
  currentViewTab = 'today',
  onSelectViewTab,
  onToggleTask,
  onToggleSubtask,
  onOpenCreateTask,
  onOpenEditTask,
  onDeleteTask,
  onQuickCreateTask,
}) {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [inlineTitle, setInlineTitle] = useState('');

  const viewTabs = [
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'completed', label: 'Completed' },
    { id: 'all', label: 'All Tasks' },
  ];

  const priorities = ['All', 'urgent', 'high', 'medium', 'low'];

  const toggleExpand = (id) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleInlineSubmit = (e) => {
    e.preventDefault();
    if (!inlineTitle.trim()) return;
    if (onQuickCreateTask) {
      onQuickCreateTask(inlineTitle.trim());
      setInlineTitle('');
    } else {
      onOpenCreateTask();
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    return true;
  });

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Tasks & To-Do List
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Organize commitments, prioritize deliverables, and track multi-step progress.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenCreateTask}>
          <Plus size={15} />
          <span>New Task</span>
        </button>
      </div>

      {/* View Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', overflowX: 'auto' }}>
        {viewTabs.map((tab) => (
          <button
            key={tab.id}
            className={`btn ${currentViewTab === tab.id ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              padding: '6px 14px',
              fontSize: '0.84rem',
              border: currentViewTab === tab.id ? '1px solid var(--border-strong)' : '1px solid transparent',
              fontWeight: currentViewTab === tab.id ? 600 : 500,
            }}
            onClick={() => onSelectViewTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Priority Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '360px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '32px', height: '34px', fontSize: '0.82rem' }}
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {priorities.map((p) => (
            <button
              key={p}
              className="btn btn-ghost"
              style={{
                fontSize: '0.76rem',
                padding: '4px 8px',
                textTransform: 'capitalize',
                color: priorityFilter === p ? 'var(--text-primary)' : 'var(--text-muted)',
                background: priorityFilter === p ? 'var(--bg-surface-active)' : 'transparent',
                fontWeight: priorityFilter === p ? 600 : 400,
              }}
              onClick={() => setPriorityFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Inline Creation Input */}
      <form onSubmit={handleInlineSubmit}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            className="input"
            style={{ height: '38px', fontSize: '0.86rem' }}
            placeholder="+ Add a new task (Press Enter to save)..."
            value={inlineTitle}
            onChange={(e) => setInlineTitle(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" style={{ height: '38px', padding: '0 14px' }}>
            <Plus size={15} />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <ListTodo size={32} className="empty-state-icon" />
            <div className="empty-state-title">No tasks in this view</div>
            <p className="empty-state-text">
              {search || priorityFilter !== 'All'
                ? 'No tasks match the active filters.'
                : 'All caught up! Add a new task to stay organized.'}
            </p>
            <button className="btn btn-primary" onClick={onOpenCreateTask}>
              <Plus size={14} /> Create Task
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTasks.map((task) => {
            const isExpanded = expandedTasks.has(task._id);
            const hasSubtasks = task.subtasks && task.subtasks.length > 0;
            const completedSubtasks = hasSubtasks ? task.subtasks.filter((s) => s.completed).length : 0;
            const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date();

            return (
              <div
                key={task._id}
                className="card card-interactive"
                style={{
                  padding: '12px 16px',
                  background: task.completed ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div
                      className={`task-checkbox ${task.completed ? 'completed' : ''}`}
                      onClick={() => onToggleTask(task._id)}
                      title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.completed && <CheckCircle2 size={13} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                          }}
                        >
                          {task.title}
                        </span>

                        <span
                          className={`badge ${
                            task.priority === 'urgent'
                              ? 'badge-danger'
                              : task.priority === 'high'
                              ? 'badge-warning'
                              : 'badge-neutral'
                          }`}
                          style={{ textTransform: 'capitalize', fontSize: '0.68rem', padding: '1px 6px' }}
                        >
                          {task.priority}
                        </span>

                        <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {task.category}
                        </span>

                        {task.isRecurring && (
                          <span className="badge badge-accent" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            Recurring
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                          {task.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '5px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {task.dueDate && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isOverdue ? 'var(--danger)' : 'inherit' }}>
                            {isOverdue && <AlertCircle size={12} />}
                            <Calendar size={12} />
                            <span>Due {formatDueDate(task.dueDate)}</span>
                            {isOverdue && <strong>(Overdue)</strong>}
                          </span>
                        )}

                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          <span>Est {task.estimatedMinutes}m | Spent {task.actualMinutes || 0}m</span>
                        </span>

                        {hasSubtasks && (
                          <button
                            onClick={() => toggleExpand(task._id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              color: 'var(--accent)',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                            <span>{completedSubtasks}/{task.subtasks.length} subtasks</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      className="btn-icon-subtle"
                      title="Edit task"
                      onClick={() => onOpenEditTask(task)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon-subtle"
                      style={{ color: 'var(--danger)' }}
                      title="Delete task"
                      onClick={() => onDeleteTask(task._id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Subtasks Collapsible */}
                {hasSubtasks && isExpanded && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingLeft: '30px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {task.subtasks.map((st) => (
                        <label
                          key={st._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => onToggleSubtask(task._id, st._id)}
                            style={{ accentColor: 'var(--accent)', width: '14px', height: '14px', cursor: 'pointer' }}
                          />
                          <span
                            style={{
                              textDecoration: st.completed ? 'line-through' : 'none',
                              color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                            }}
                          >
                            {st.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
