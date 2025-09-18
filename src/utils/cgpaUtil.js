const GRADE_MAP = {
    'A': 5.0,
    'B': 4.0,
    'C': 3.0,
    'D': 2.0,
    'E': 1.0,
    'F': 0.0,
};

const normalizeGrade = (gradeRaw) => {
    if (typeof gradeRaw === 'number') {
        if (gradeRaw >= 0 && gradeRaw <= 5) {
            return parseFloat(gradeRaw.toFixed(2));
        }
    }

    if (typeof gradeRaw === 'string') {
        const upperCaseGrade = gradeRaw.toUpperCase();
        if (GRADE_MAP[upperCaseGrade] !== undefined) {
            return GRADE_MAP[upperCaseGrade];
        }

        const numericValue = parseFloat(upperCaseGrade);
        if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 5) {
            return parseFloat(numericValue.toFixed(2));
        }
    }

    // Return null or throw error if grade is invalid
    throw new Error(`Invalid grade format: ${gradeRaw}`);
};

const calculateCgpaFromCourses = (courses) => {
    const latestCourses = new Map();

    // Sort by created_at to ensure the latest course is processed last
    courses.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    for (const course of courses) {
        // If a course is marked as a retake, it supersedes any previous entry.
        // If it's not a retake, it's the first time, so add it.
        // If multiple non-retakes exist, the latest one will overwrite previous ones in the map.
        latestCourses.set(course.course_code, course);
    }

    const finalCourses = Array.from(latestCourses.values());

    let totalQualityPoints = 0;
    let totalUnits = 0;

    for (const course of finalCourses) {
        totalQualityPoints += course.units * course.grade_point;
        totalUnits += course.units;
    }

    if (totalUnits === 0) {
        return {
            gpa: 0.00,
            totalUnits: 0,
            totalQualityPoints: 0,
            courseCount: 0,
        };
    }

    const gpa = totalQualityPoints / totalUnits;

    return {
        gpa: parseFloat(gpa.toFixed(2)),
        totalUnits,
        totalQualityPoints,
        courseCount: finalCourses.length,
    };
};


module.exports = { normalizeGrade, calculateCgpaFromCourses };
