import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { useFocusTimer } from './services/useFocusTimer';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import HabitsView from './components/HabitsView';
import TasksView from './components/TasksView';
import FocusTimerView from './components/FocusTimerView';
import NotesView from './components/NotesView';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import CreateHabitModal from './components/CreateHabitModal';
import CreateTaskModal from './components/CreateTaskModal';
import CreateNoteModal from './components/CreateNoteModal';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aura_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('aura_theme') || 'dark';
  });
  const [currentView, setCurrentView] = useState('dashboard');
  const [taskViewTab, setTaskViewTab] = useState('today');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data collections
  const [dashboardData, setDashboardData] = useState(null);
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [focusStats, setFocusStats] = useState({});
  const [notes, setNotes] = useState([]);
  const [insightsData, setInsightsData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth Logout Listener
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('aura_token');
      localStorage.removeItem('aura_user');
    };
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  // Fetch core data
  const fetchAllData = useCallback(async () => {
    if (!localStorage.getItem('aura_token')) return;
    setLoading(true);
    try {
      const [
        dashRes,
        habitsRes,
        tasksRes,
        focusRes,
        focusStatsRes,
        notesRes,
        insightsRes,
        goalsRes,
        userRes,
      ] = await Promise.all([
        api.getDashboardSummary().catch(() => null),
        api.getHabits().catch(() => ({ data: [] })),
        api.getTasks({ view: taskViewTab }).catch(() => ({ data: [] })),
        api.getFocusSessions().catch(() => ({ data: [] })),
        api.getFocusStats().catch(() => ({ data: {} })),
        api.getNotes().catch(() => ({ data: [] })),
        api.getAnalyticsInsights().catch(() => ({ data: null })),
        api.getGoals().catch(() => ({ data: [] })),
        api.getMe().catch(() => null),
      ]);

      if (dashRes?.success) setDashboardData(dashRes.data);
      if (habitsRes?.success) setHabits(habitsRes.data);
      if (tasksRes?.success) setTasks(tasksRes.data);
      if (focusRes?.success) setFocusSessions(focusRes.data);
      if (focusStatsRes?.success) setFocusStats(focusStatsRes.data);
      if (notesRes?.success) setNotes(notesRes.data);
      if (insightsRes?.success) setInsightsData(insightsRes.data);
      if (goalsRes?.success) setGoals(goalsRes.data);
      if (userRes?.success) {
        setUser(userRes.user);
        localStorage.setItem('aura_user', JSON.stringify(userRes.user));
      }
    } catch (err) {
      console.error('[Error fetching data]:', err);
    } finally {
      setLoading(false);
    }
  }, [taskViewTab]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  // Focus Session Save
  const handleSaveFocusSession = async (sessionData) => {
    try {
      await api.logFocusSession(sessionData);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Persistent Timer Hook
  const {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setMode: setTimerMode,
    finishSession: finishTimerSession,
    updateDetails: updateTimerDetails,
  } = useFocusTimer(async () => {
    await handleSaveFocusSession({
      sessionType: timerState.sessionType,
      durationMinutes: timerState.targetMinutes,
      startTime: timerState.startedAt ? new Date(timerState.startedAt) : new Date(),
      endTime: new Date(),
      associatedTask: timerState.associatedTaskId || null,
      category: timerState.category,
      notes: timerState.notes,
    });
  });

  // Refetch tasks when view tab changes
  const handleSelectTaskViewTab = async (tab) => {
    setTaskViewTab(tab);
    try {
      const res = await api.getTasks({ view: tab });
      if (res.success) setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Habit Actions
  const handleToggleHabit = async (habitId) => {
    try {
      await api.toggleHabit(habitId);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveHabit = async (habitData) => {
    try {
      if (editingHabit) {
        await api.updateHabit(editingHabit._id, habitData);
      } else {
        await api.createHabit(habitData);
      }
      setEditingHabit(null);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Delete this habit and all its logged history?')) return;
    try {
      await api.deleteHabit(habitId);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveHabit = async (habitId, isArchived) => {
    try {
      await api.updateHabit(habitId, { isArchived });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Task Actions
  const handleToggleTask = async (taskId) => {
    try {
      await api.toggleTask(taskId);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubtask = async (taskId, subtaskId) => {
    try {
      await api.toggleSubtask(taskId, subtaskId);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await api.updateTask(editingTask._id, taskData);
      } else {
        await api.createTask(taskData);
      }
      setEditingTask(null);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickCreateTask = async (title) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await api.createTask({
        title,
        priority: 'medium',
        category: 'General',
        scheduledDate: todayStr,
      });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Note Actions
  const handleSaveNote = async (noteData) => {
    try {
      if (editingNote) {
        await api.updateNote(editingNote._id, noteData);
      } else {
        await api.createNote(noteData);
      }
      setEditingNote(null);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickCreateNote = async (noteData) => {
    try {
      await api.createNote(noteData);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.deleteNote(noteId);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePinNote = async (noteId) => {
    try {
      await api.togglePinNote(noteId);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Goal Actions
  const handleSaveGoal = async (goalData) => {
    try {
      await api.createGoal(goalData);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGoal = async (id, updates) => {
    try {
      await api.updateGoal(id, updates);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.deleteGoal(id);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Profile Update
  const handleUpdateProfile = async (updates) => {
    try {
      const res = await api.updateProfile(updates);
      if (res.success) {
        setUser(res.user);
        localStorage.setItem('aura_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartFocus = (minutes, sessionType) => {
    if (minutes) {
      setTimerMode(sessionType || 'countdown', minutes);
    }
    setCurrentView('focus');
  };

  if (!user) {
    return <AuthView onAuthSuccess={(userData) => setUser(userData)} />;
  }

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'tasks': return 'Tasks';
      case 'habits': return 'Habits';
      case 'calendar': return 'Planner & Calendar';
      case 'focus': return 'Focus Timer';
      case 'notes': return 'Notes & Thoughts';
      case 'analytics': return 'Analytics & Goals';
      case 'settings': return 'Settings';
      default: return 'Daymark';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onLogout={() => {
          localStorage.removeItem('aura_token');
          localStorage.removeItem('aura_user');
          setUser(null);
        }}
        counts={{
          habitsCount: habits.filter((h) => !h.isArchived).length,
          tasksCount: tasks.filter((t) => !t.completed).length,
        }}
        isTimerRunning={timerState.isRunning}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <TopNav
          title={getViewTitle()}
          theme={theme}
          toggleTheme={toggleTheme}
          userStreak={user?.gamification?.currentStreak || 0}
          activeTimer={timerState}
          onOpenCreateHabit={() => {
            setEditingHabit(null);
            setHabitModalOpen(true);
          }}
          onOpenCreateTask={() => {
            setEditingTask(null);
            setTaskModalOpen(true);
          }}
          onOpenCreateNote={() => {
            setEditingNote(null);
            setNoteModalOpen(true);
          }}
          onStartFocus={() => handleStartFocus()}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="content-body">
          {currentView === 'dashboard' && (
            <DashboardView
              dashboardData={dashboardData}
              user={user}
              onToggleHabit={handleToggleHabit}
              onToggleTask={handleToggleTask}
              onNavigate={setCurrentView}
              onOpenCreateHabit={() => {
                setEditingHabit(null);
                setHabitModalOpen(true);
              }}
              onOpenCreateTask={() => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
              onStartFocus={handleStartFocus}
              onQuickCreateTask={handleQuickCreateTask}
            />
          )}

          {currentView === 'habits' && (
            <HabitsView
              habits={habits}
              onToggleHabit={handleToggleHabit}
              onOpenCreateHabit={() => {
                setEditingHabit(null);
                setHabitModalOpen(true);
              }}
              onOpenEditHabit={(habit) => {
                setEditingHabit(habit);
                setHabitModalOpen(true);
              }}
              onDeleteHabit={handleDeleteHabit}
              onArchiveHabit={handleArchiveHabit}
            />
          )}

          {currentView === 'tasks' && (
            <TasksView
              tasks={tasks}
              currentViewTab={taskViewTab}
              onSelectViewTab={handleSelectTaskViewTab}
              onToggleTask={handleToggleTask}
              onToggleSubtask={handleToggleSubtask}
              onOpenCreateTask={() => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
              onOpenEditTask={(task) => {
                setEditingTask(task);
                setTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onQuickCreateTask={handleQuickCreateTask}
            />
          )}

          {currentView === 'focus' && (
            <FocusTimerView
              tasks={tasks.filter((t) => !t.completed)}
              habits={habits.filter((h) => !h.isArchived)}
              recentSessions={focusSessions}
              focusStats={focusStats}
              timerState={timerState}
              startTimer={startTimer}
              pauseTimer={pauseTimer}
              resumeTimer={resumeTimer}
              resetTimer={resetTimer}
              setMode={setTimerMode}
              finishSession={finishTimerSession}
              updateDetails={updateTimerDetails}
              onSaveSession={handleSaveFocusSession}
            />
          )}

          {currentView === 'notes' && (
            <NotesView
              notes={notes}
              onOpenCreateNote={() => {
                setEditingNote(null);
                setNoteModalOpen(true);
              }}
              onOpenEditNote={(note) => {
                setEditingNote(note);
                setNoteModalOpen(true);
              }}
              onDeleteNote={handleDeleteNote}
              onTogglePinNote={handleTogglePinNote}
              onQuickCreateNote={handleQuickCreateNote}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              habits={habits}
              tasks={tasks}
              focusSessions={focusSessions}
              onToggleTask={handleToggleTask}
              onToggleHabit={handleToggleHabit}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              insightsData={insightsData}
              goals={goals}
              onSaveGoal={handleSaveGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              user={user}
              theme={theme}
              toggleTheme={toggleTheme}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateHabitModal
        isOpen={habitModalOpen}
        onClose={() => {
          setHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        initialData={editingHabit}
      />

      <CreateTaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialData={editingTask}
        habits={habits}
      />

      <CreateNoteModal
        isOpen={noteModalOpen}
        onClose={() => {
          setNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initialData={editingNote}
      />
    </div>
  );
}
