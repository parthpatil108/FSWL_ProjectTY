const Note = require('../models/Note');
const { handleControllerError } = require('../utils/handleControllerError');

// @route   GET /api/notes
// @desc    Get user notes with search & filtering
exports.getNotes = async (req, res) => {
  try {
    const { search, category, tag } = req.query;
    const query = { user: req.user.id, isArchived: false };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const notes = await Note.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean();

    return res.json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @route   POST /api/notes
// @desc    Create a new note
exports.createNote = async (req, res) => {
  try {
    const { title, content, category, tags, color, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const note = await Note.create({
      user: req.user.id,
      title,
      content,
      category: category || 'Quick Thoughts',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' && tags ? tags.split(',').map((t) => t.trim()) : [],
      color: color || '#6366f1',
      isPinned: !!isPinned,
    });

    return res.status(201).json({ success: true, data: note });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @route   PUT /api/notes/:id
// @desc    Update an existing note
exports.updateNote = async (req, res) => {
  try {
    let note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const allowed = ['title', 'content', 'category', 'tags', 'color', 'isPinned', 'isArchived'];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) {
        if (f === 'tags' && typeof req.body[f] === 'string') {
          note[f] = req.body[f].split(',').map((t) => t.trim());
        } else {
          note[f] = req.body[f];
        }
      }
    });

    await note.save();

    return res.json({ success: true, data: note });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @route   DELETE /api/notes/:id
// @desc    Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    return res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// @route   POST /api/notes/:id/pin
// @desc    Toggle pin status for a note
exports.togglePinNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    return res.json({ success: true, data: note });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
