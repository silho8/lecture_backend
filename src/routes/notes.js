const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/fileUpload');

// Create a new note with files
router.post(
    '/',
    protect,
    upload.array('files', 10), // 'files' is the field name, max 10 files
    noteController.createNote
);

// Get all notes (with filters)
router.get('/', protect, noteController.getNotes);

// Get a single note by ID
router.get('/:id', protect, noteController.getNoteById);

// Update a note's metadata
router.put('/:id', protect, noteController.updateNote);

// Delete a note
router.delete('/:id', protect, noteController.deleteNote);

// File-specific routes
router.get('/files/:fileId/preview', protect, noteController.previewFile);
router.get('/files/:fileId/download', protect, noteController.downloadFile);


module.exports = router;
