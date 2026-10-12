# A Full-Stack Personal Productivity and Habit Tracking System (TYBtech FSWL Mini-Project)

AuraOS is a modern, full-stack personal productivity and habit-tracking web application built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)**. It functions as an integrated **habit tracker, to-do/task manager, productivity planner, Pomodoro focus timer, thought/notes organizer, and intelligent analytics dashboard**.

The application answers four core questions for the user:
1. **What do I need to do?** (Task prioritization, due dates, subtasks, recurrence)
2. **What habits am I building?** (Habit consistency, 7-day mini trackers, current & longest streaks)
3. **How am I spending my time?** (Pomodoro timer, stopwatch, session categorization, deep work logs)
4. **And am I actually improving?** (14-day completion trends, focus hours output, smart automated productivity insights)

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Vanilla CSS Design System (Custom tokens, glassmorphism, Dark/Light modes), Lucide React Icons, Canvas Confetti.
- **Backend**: Node.js 24, Express 4.x REST API, JWT Authentication, bcryptjs, express-validator, morgan.
- **Database**: MongoDB 8.x + Mongoose with compound unique indexes (`{ user, habit, date }`) ensuring strict data isolation per user.

---

## 🚀 Key Modules & Architecture

### 1. User Authentication & Data Isolation
- Registration, Login, Logout with JWT tokens stored in `localStorage` and sent via `Authorization: Bearer <token>`.
- Passwords securely hashed with bcrypt.
- Every MongoDB document (`Habit`, `HabitLog`, `Task`, `FocusSession`, `Note`, `Goal`, `Achievement`) is indexed by `user: ObjectId`.
- Instant 1-click **⚡ Explore with Demo Account** button for effortless evaluation.

### 2. Habit Management System
- Complete CRUD with custom categories, colors, targets, and schedules (Daily, Weekdays, Weekly).
- Historical completion logs via `HabitLog` model (maintains complete historical performance records).
- Automated streak engine calculating **Current Streak**, **Longest Streak**, total completions, and 7-day micro consistency dots.

### 3. Task Management System
- Filters: **Today**, **Upcoming**, **Overdue**, **Completed**, and **All Tasks**.
- Priority levels: `urgent`, `high`, `medium`, `low`.
- Multi-step subtasks with interactive checkboxes and completion tracking.
- Due date indicators with overdue alert badges.

### 4. Focus & Pomodoro Timer
- Modes: **Pomodoro (25/5/15)**, **Short Break**, **Long Break**, **Custom Countdown**, and **Stopwatch**.
- Association with specific tasks, habits, and categories (*Deep Work*, *Coding*, *Academics*, etc.).
- Animated circular SVG countdown ring with smooth transition effects.
- Completed sessions saved in MongoDB with duration, ratings, and XP awards.

### 5. Thoughts & Brain Dump (Notes)
- Fast thought capture modal with color accents and custom tags.
- Pin-to-top feature with dedicated pinned thoughts section.
- Instant real-time text and tag search.

### 6. Planner & Calendar Interface
- Monthly interactive calendar with day-by-day scheduled events.
- Automatically plots scheduled tasks, recurring habits, and logged focus sessions on every calendar date.
- Day-agenda details drawer showing selected day's complete commitments.

### 7. Analytics & Smart Insights
- Interactive SVG 14-day Habit Completion Trend chart with hover tooltips.
- Interactive SVG Focus Hours Output chart.
- Habit Category distribution progress bars.
- Automated intelligent insights (*Top Anchor Habit*, *Peak Productivity Window*, *Deep Work Accumulation*, *Opportunity for Growth*).

### 8. Gamification & Milestone Badges
- XP and Level progression system (Level formula: `Math.floor(xp / 250) + 1`).
- Milestone badges catalog: *Consistency Spark (3d)*, *One Week Warrior (7d)*, *Habit Master (30d)*, *Task Crusher (10 tasks)*, *Hyperfocused Mind (2h+ focus)*.
- Custom target goals with incrementable progress bars.

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally on port 27017 (e.g. `mongodb://127.0.0.1:27017/productivity_os`)

### 2. Backend Setup
```bash
cd backend
npm install
node seed.js    # Seeds demo account with rich historical logs and streaks
npm run dev     # Runs Express API on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Runs Vite React app on http://127.0.0.1:5173
```

### 4. Demo Account Credentials
- **Email**: `demo@productivityos.com`
- **Password**: `password123`
*(Or click the 1-click **⚡ Explore with Demo Account** button on the login screen).*

---

## 📁 Repository Structure

```
mini-project/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth, register, login, profile
│   │   ├── habitController.js    # Habits & historical completions
│   │   ├── taskController.js     # Tasks & subtasks
│   │   ├── focusController.js    # Focus sessions & aggregate stats
│   │   ├── noteController.js     # Notes & brain dump
│   │   ├── analyticsController.js# Dashboard summary & 14-day insights
│   │   └── goalAchievementController.js # Gamification & badges
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Habit.js
│   │   ├── HabitLog.js           # Historical completion logs
│   │   ├── Task.js
│   │   ├── FocusSession.js
│   │   ├── Note.js
│   │   ├── Goal.js
│   │   └── Achievement.js
│   ├── routes/                   # Express route definitions
│   ├── services/
│   │   └── gamificationService.js# Streak recalculations & badge unlocks
│   ├── seed.js                   # Realistic database seeder
│   └── server.js                 # Express entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopNav.jsx
│   │   │   ├── AuthView.jsx
│   │   │   ├── DashboardView.jsx
│   │   │   ├── HabitsView.jsx
│   │   │   ├── TasksView.jsx
│   │   │   ├── FocusTimerView.jsx
│   │   │   ├── NotesView.jsx
│   │   │   ├── CalendarView.jsx
│   │   │   ├── AnalyticsView.jsx
│   │   │   ├── AchievementsView.jsx
│   │   │   ├── SettingsView.jsx
│   │   │   ├── CreateHabitModal.jsx
│   │   │   ├── CreateTaskModal.jsx
│   │   │   └── CreateNoteModal.jsx
│   │   ├── services/
│   │   │   └── api.js            # API client with token management
│   │   ├── App.jsx               # Main state & view routing
│   │   ├── index.css             # Vanilla CSS design system & tokens
│   │   └── main.jsx
│   └── package.json
└── README.md
```
