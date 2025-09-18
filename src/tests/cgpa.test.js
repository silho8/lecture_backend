const { calculateCgpaFromCourses } = require('../utils/cgpaUtil');

describe('CGPA Calculation Utility', () => {
    it('should return 0.00 for an empty course list', () => {
        const courses = [];
        const result = calculateCgpaFromCourses(courses);
        expect(result.gpa).toBe(0.00);
        expect(result.totalUnits).toBe(0);
    });

    it('should calculate the correct GPA for a simple list of courses', () => {
        const courses = [
            { course_code: 'MTH101', units: 3, grade_point: 5.0, created_at: '2023-01-01' }, // A
            { course_code: 'PHY101', units: 4, grade_point: 4.0, created_at: '2023-01-02' }, // B
            { course_code: 'CHM101', units: 3, grade_point: 3.0, created_at: '2023-01-03' }, // C
        ];
        // Total Quality Points = (3*5) + (4*4) + (3*3) = 15 + 16 + 9 = 40
        // Total Units = 3 + 4 + 3 = 10
        // GPA = 40 / 10 = 4.0
        const result = calculateCgpaFromCourses(courses);
        expect(result.gpa).toBe(4.00);
        expect(result.totalUnits).toBe(10);
    });

    it('should correctly handle a retake course, using only the latest attempt', () => {
        const courses = [
            // Original attempt
            { course_code: 'MTH101', units: 3, grade_point: 1.0, created_at: '2023-01-01' }, // E
            // Other courses
            { course_code: 'PHY101', units: 4, grade_point: 4.0, created_at: '2023-01-02' }, // B
            // Retake attempt
            { course_code: 'MTH101', units: 3, grade_point: 5.0, created_at: '2023-06-01', is_retake: true }, // A
        ];
        // The first MTH101 should be ignored.
        // Total Quality Points = (4*4) + (3*5) = 16 + 15 = 31
        // Total Units = 4 + 3 = 7
        // GPA = 31 / 7 = 4.428...
        const result = calculateCgpaFromCourses(courses);
        expect(result.gpa).toBe(4.43);
        expect(result.totalUnits).toBe(7);
        expect(result.courseCount).toBe(2);
    });

    it('should handle multiple courses and retakes correctly', () => {
         const courses = [
            { course_code: 'MTH101', units: 3, grade_point: 1.0, created_at: '2023-01-01' }, // E, retaken
            { course_code: 'PHY101', units: 4, grade_point: 4.0, created_at: '2023-01-02' }, // B
            { course_code: 'ENG101', units: 2, grade_point: 2.0, created_at: '2023-01-03' }, // D, retaken
            { course_code: 'MTH101', units: 3, grade_point: 4.0, created_at: '2023-06-01', is_retake: true }, // B
            { course_code: 'ENG101', units: 2, grade_point: 5.0, created_at: '2023-06-02', is_retake: true }, // A
        ];
        // Final courses: PHY101(B), MTH101(B), ENG101(A)
        // TQP = (4*4) + (3*4) + (2*5) = 16 + 12 + 10 = 38
        // TU = 4 + 3 + 2 = 9
        // GPA = 38 / 9 = 4.222...
        const result = calculateCgpaFromCourses(courses);
        expect(result.gpa).toBe(4.22);
        expect(result.totalUnits).toBe(9);
    });
});
