const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

// All routes in this file are protected and for admins only
router.use(protect, admin);

// User management
router.get('/users', adminController.listUsers);
router.put('/users/:id/ban', adminController.banUser);

// Note management
router.get('/notes', adminController.listAllNotes);
router.delete('/notes/:id', adminController.deleteNoteAsAdmin);

module.exports = router;
