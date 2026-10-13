const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../config/jwt');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    getJwtSecret(),
    { expiresIn: '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference,
        pomodoroSettings: user.pomodoroSettings,
        gamification: user.gamification,
      },
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference,
        pomodoroSettings: user.pomodoroSettings,
        gamification: user.gamification,
      },
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference,
        pomodoroSettings: user.pomodoroSettings,
        gamification: user.gamification,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   PUT /api/auth/profile
// @desc    Update user profile & preferences
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, themePreference, pomodoroSettings } = req.body;
    if (name) user.name = name;
    if (themePreference) user.themePreference = themePreference;
    if (pomodoroSettings) {
      user.pomodoroSettings = { ...user.pomodoroSettings, ...pomodoroSettings };
    }

    await user.save();

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        themePreference: user.themePreference,
        pomodoroSettings: user.pomodoroSettings,
        gamification: user.gamification,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
