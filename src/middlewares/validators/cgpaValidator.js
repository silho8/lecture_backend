const Joi = require('joi');

const semesterSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
});

const courseSchema = Joi.object({
    semester_id: Joi.number().integer().required(),
    course_code: Joi.string().max(64).required(),
    course_title: Joi.string().max(255).optional(),
    units: Joi.number().integer().min(0).max(10).required(),
    grade_raw: Joi.string().max(10).required(),
    is_retake: Joi.boolean().optional(),
});

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

module.exports = {
    validateSemester: validate(semesterSchema),
    validateCourse: validate(courseSchema),
};
