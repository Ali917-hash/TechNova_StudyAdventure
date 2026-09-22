const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const courseUpload = require("../utils/courseUpload");
const adminController = require("../controllers/adminController");
const courseController = require("../controllers/courseController");
const auth = require("../middleware/auth");
const { doubleCsrfProtection } = require("../middleware/csrf");
const {
    courseValidationRules,
    handleValidationErrors
} = require("../middleware/validation");

// ==========================================
// ADMIN DASHBOARD
// ==========================================

router.get(
    "/admin/dashboard",
    auth.isAdmin,
    adminController.dashboard
);

// ==========================================
// ADMIN ADD COURSE
// ==========================================

// Show Add Course Page

router.get(
    "/admin/course/add",
    auth.isAdmin,
    adminController.showAddCourse
);

// Save New Course

router.post(
    "/admin/course/add",
    auth.isAdmin,
    courseUpload.fields([
        { name: "image", maxCount: 1 },
        { name: "content", maxCount: 1000 }
    ]),
    doubleCsrfProtection,
    courseValidationRules(),
    handleValidationErrors,
    courseController.addCourse
);

// ==========================================
// ADMIN ALL COURSES
// ==========================================

router.get(
    "/admin/courses",
    auth.isAdmin,
    courseController.adminCourses
);

// ==========================================
// ADMIN EDIT COURSE
// ==========================================

// Show Edit Course Page

router.get(
    "/admin/course/edit/:id",
    auth.isAdmin,
    courseController.showEditCourse
);


// Update Course

router.post(
    "/admin/course/update/:id",
    auth.isAdmin,
    courseUpload.fields([
        { name: "image", maxCount: 1 },
        { name: "content", maxCount: 1000 }
    ]),
    doubleCsrfProtection,
    courseValidationRules(),
    handleValidationErrors,
    courseController.updateCourse
);


// ==========================================
// ADMIN DELETE COURSE
// ==========================================

// ==========================================
// ADMIN PROFILE
// ==========================================

router.get(
    "/admin/profile",
    auth.isAdmin,
    adminController.profile
);


router.post(
    "/admin/profile/update",
    auth.isAdmin,
    upload.single("profileImage"),
    doubleCsrfProtection,
    adminController.updateProfile
);


// ==========================================
// ADMIN STUDENTS
// ==========================================

router.get(
    "/admin/students",
    auth.isAdmin,
    adminController.students
);

// ==========================================
// LOGIN ACTIVITY
// ==========================================

router.get(
    "/admin/login-activity",
    auth.isAdmin,
    adminController.loginActivity
);

router.post(
    "/admin/students/toggle/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    adminController.toggleStudentStatus
);


// ==========================================
// ADMIN ENROLLMENTS
// ==========================================

router.get(
    "/admin/enrollments",
    auth.isAdmin,
    adminController.enrollments
);


// ==========================================
// APPROVE ENROLLMENT
// ==========================================

router.post(
    "/admin/enrollments/approve/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    adminController.approveEnrollment
);


// ==========================================
// REJECT ENROLLMENT
// ==========================================

router.post(
    "/admin/enrollments/reject/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    adminController.rejectEnrollment
);


// ==========================================
// DELETE ENROLLMENT
// ==========================================

router.post(
    "/admin/enrollments/delete/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    adminController.deleteEnrollment
);


// ==========================================
// ADMIN HELP & SUPPORT
// ==========================================

router.get(
    "/admin/help",
    auth.isAdmin,
    adminController.help
);


module.exports = router;