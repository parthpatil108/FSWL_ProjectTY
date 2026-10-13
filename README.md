# A Full-Stack Personal Productivity and Habit Tracking System (TYBtech FSWL Mini-Project)

Daymark is a modern, full-stack personal productivity and habit-tracking web application built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)**. It functions as an integrated **habit tracker, to-do/task manager, productivity planner, Pomodoro focus timer, thought/notes organizer, and intelligent analytics dashboard**.

The application answers four core questions for the user:

1. **What do I need to do?** (Task prioritization, due dates, subtasks, recurrence)
2. **What habits am I building?** (Habit consistency, 7-day mini trackers, current & longest streaks)
3. **How am I spending my time?** (Pomodoro timer, stopwatch, session categorization, deep work logs)
4. **And am I actually improving?** (14-day completion trends, focus hours output, smart automated productivity insights)

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite 8, Vanilla CSS Design System (Custom tokens, glassmorphism, Dark/Light modes), Lucide React Icons, Canvas Confetti.
- **Backend**: Node.js, Express 4.x REST API, JWT Authentication, bcryptjs, express-validator, morgan.
- **Database**: MongoDB + Mongoose with compound unique indexes (`{ user, habit, date }`) ensuring strict multi-tenant data isolation.
- **Quality & Testing**: Built-in Node test runner (`node --test`), automated API verification, multi-tenant isolation assertions.

---

## 🚀 Key Modules & Architecture

### 1. User Authentication & Data Isolation

- Registration, Login, Logout with JWT tokens stored in `localStorage` and sent via `Authorization: Bearer <token>`.
- Passwords securely hashed with bcrypt (minimum 6 characters enforced).
- Every MongoDB document (`Habit`, `HabitLog`, `Task`, `FocusSession`, `Note`, `Goal`, `Achievement`) is indexed and filtered by `user: ObjectId`.
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
- Association with specific tasks, habits, and categories (_Deep Work_, _Coding_, _Academics_, etc.).
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
- Automated intelligent insights (_Top Anchor Habit_, _Peak Productivity Window_, _Deep Work Accumulation_, _Opportunity for Growth_).

### 8. Gamification & Milestone Badges

- XP and Level progression system (Level formula: `Math.floor(xp / 250) + 1`).
- Milestone badges catalog: _Consistency Spark (3d)_, _One Week Warrior (7d)_, _Habit Master (30d)_, _Task Crusher (10 tasks)_, _Hyperfocused Mind (2h+ focus)_.
- Custom target goals with incrementable progress bars.

---

## ⚡ Quick Start Guide

### 1. Prerequisites

- **Node.js** (v18+)
- **MongoDB** running locally or a MongoDB Atlas URI (e.g. `mongodb://127.0.0.1:27017/daymark`)

### 2. Root Monorepo Commands

From the project root:

```bash
npm run install:all   # Installs dependencies for root, backend, and frontend
npm run seed          # Seeds demo account with rich historical logs and streaks
npm test              # Runs backend automated test suite (12 tests)
npm run build         # Builds frontend production bundle
```

### 3. Development Mode

Run both services concurrently or individually:

```bash
# Terminal 1 - Backend API (http://localhost:5000)
npm run dev:backend

# Terminal 2 - Frontend UI (http://localhost:5173)
npm run dev:frontend
```

### 4. Demo Account Credentials

- **Email**: `demo@productivityos.com`
- **Password**: `password123`
  _(Or click the 1-click **⚡ Explore with Demo Account** button on the login screen)._

---

## 📁 Repository Structure

```
mini-project/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── jwt.js                # Centralized JWT secret validator
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
│   ├── models/                   # Mongoose schemas (User, Habit, Task, etc.)
│   ├── routes/                   # Express route definitions
│   ├── services/
│   │   └── gamificationService.js# Streak recalculations & badge unlocks
│   ├── tests/
│   │   └── api.test.js           # Automated test suite (12 test cases)
│   ├── utils/
│   │   └── handleControllerError.js # Uniform error handling (CastError, ValidationError)
│   ├── seed.js                   # Realistic database seeder
│   └── server.js                 # Express entry point & static serving
├── frontend/
│   ├── src/
│   │   ├── components/           # View components & modals
│   │   ├── services/
│   │   │   ├── api.js            # API client with token management & dynamic base URL
│   │   │   └── useFocusTimer.js  # Resilient focus timer hook
│   │   ├── App.jsx               # Main state & view routing
│   │   └── index.css             # Vanilla CSS design system & tokens
│   ├── vite.config.js            # Vite configuration with API proxy
│   └── package.json
├── package.json                  # Root monorepo orchestration scripts
└── README.md
```
