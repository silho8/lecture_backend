const express = require('express');
const router = express.Router();
const cgpaController = require('../controllers/cgpaController');
const { protect } = require('../middlewares/authMiddleware');

// All routes in this file are protected
router.use(protect);

const { validateSemester, validateCourse } = require('../middlewares/validators/cgpaValidator');

// Semester routes
router.post('/semesters', validateSemester, cgpaController.createSemester);
router.get('/semesters', cgpaController.getSemesters);

// Course routes
router.post('/courses', validateCourse, cgpaController.addCourse);

// Calculation routes
router.get('/semesters/:id/calculate', cgpaController.calculateCgpaForSemester);
router.get('/calculate/cumulative', cgpaController.calculateCumulativeCgpa);


module.exports = router;
