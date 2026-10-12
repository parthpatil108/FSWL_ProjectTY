const express = require('express');
const router = express.Router();
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getNotes).post(createNote);
router.route('/:id').put(updateNote).delete(deleteNote);
router.route('/:id/pin').post(togglePinNote);

module.exports = router;
