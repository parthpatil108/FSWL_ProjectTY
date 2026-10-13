/**
 * Central controller error handler to format Mongoose CastError,
 * ValidationError, and general 500 server errors consistently.
 */
function handleControllerError(res, error) {
  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: error.message });
  }
  return res.status(500).json({ success: false, message: error.message || 'Server error' });
}

module.exports = { handleControllerError };
