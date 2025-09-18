const { CgpaSemester, CgpaCourse, User } = require('../models');

exports.createSemester = async (req, res) => {
    try {
        const { name } = req.body;
        const user_id = req.user.id;

        const semester = await CgpaSemester.create({ name, user_id });
        res.status(201).json({ message: "Semester created successfully", semester });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while creating semester." });
    }
};

exports.getSemesters = async (req, res) => {
    try {
        const user_id = req.user.id;
        const semesters = await CgpaSemester.findAll({
            where: { user_id },
            order: [['created_at', 'ASC']],
            include: [{ model: CgpaCourse, as: 'courses' }] // Include courses for each semester
        });
        res.status(200).json({ semesters });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching semesters." });
    }
};

const { normalizeGrade } = require('../utils/cgpaUtil');

exports.addCourse = async (req, res) => {
    try {
        const { semester_id, course_code, course_title, units, grade_raw, is_retake } = req.body;
        const user_id = req.user.id;

        // Ensure the user owns the semester they are adding a course to
        const semester = await CgpaSemester.findOne({ where: { id: semester_id, user_id } });
        if (!semester) {
            return res.status(404).json({ message: "Semester not found or you do not own it." });
        }

        const grade_point = normalizeGrade(grade_raw);

        const course = await CgpaCourse.create({
            semester_id,
            user_id,
            course_code,
            course_title,
            units,
            grade_raw,
            grade_point,
            is_retake: is_retake || false,
        });

        res.status(201).json({ message: "Course added successfully", course });

    } catch (error) {
        console.error(error);
        if (error.message.startsWith('Invalid grade')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Server error while adding course." });
    }
};

const { calculateCgpaFromCourses } = require('../utils/cgpaUtil');

exports.calculateCgpaForSemester = async (req, res) => {
    try {
        const { id: semester_id } = req.params;
        const user_id = req.user.id;

        const courses = await CgpaCourse.findAll({ where: { semester_id, user_id } });

        if (courses.length === 0) {
            return res.status(200).json({
                semesterGpa: 0.00,
                totalUnits: 0,
                message: "No courses found for this semester."
            });
        }

        const result = calculateCgpaFromCourses(courses);

        res.status(200).json({
            semesterGpa: result.gpa,
            totalUnits: result.totalUnits,
            totalQualityPoints: result.totalQualityPoints,
            courseCount: result.courseCount,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while calculating semester GPA." });
    }
};

exports.calculateCumulativeCgpa = async (req, res) => {
    try {
        const user_id = req.user.id;
        const allCourses = await CgpaCourse.findAll({ where: { user_id } });

        const result = calculateCgpaFromCourses(allCourses);

        res.status(200).json({
            cumulativeGpa: result.gpa,
            totalUnits: result.totalUnits,
            totalQualityPoints: result.totalQualityPoints,
            totalCourses: result.courseCount,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while calculating cumulative GPA." });
    }
};
