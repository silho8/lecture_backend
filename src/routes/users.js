const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
// I might need a file upload middleware for the avatar later
// const upload = require('../middlewares/fileUpload');

// All routes here are protected
router.use(protect);

router.get('/me', userController.getUserProfile);
router.put('/me', userController.updateUserProfile);
router.put('/me/theme', userController.updateUserTheme);

module.exports = router;
