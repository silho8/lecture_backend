const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middlewares/validators/authValidator');

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', validateSignup, authController.signup);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', validateLogin, authController.login);

const { validateForgotPassword, validateResetPassword } = require('../middlewares/validators/passwordValidator');

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset user's password
// @access  Public
router.post('/reset-password', validateResetPassword, authController.resetPassword);

module.exports = router;
