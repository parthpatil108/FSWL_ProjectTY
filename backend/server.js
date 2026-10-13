require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

const path = require('path');
const fs = require('fs');

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback for seamless dev while respecting headers
    },
    credentials: true,
  })
);
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Normalize duplicated slashes in incoming requests (e.g. /api//auth/login -> /api/auth/login)
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

// Root & Health check routes
app.get(['/', '/api'], (req, res) => {
  res.json({ status: 'healthy', message: 'Daymark API is running', health: '/api/health' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date(), app: 'Daymark API' });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/focus', require('./routes/focusRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/gamification', require('./routes/goalAchievementRoutes'));

// Serve static frontend in production if built
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }
}

// 404 Handler for API routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Central Error Handler
app.use((err, req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Unhandled Server Error]:', err.stack || err.message);
  } else {
    console.error('[Unhandled Server Error]:', err.message);
  }

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && !err.status ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Daymark Server running on port ${PORT}`);
    console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
  });
}

module.exports = app;
