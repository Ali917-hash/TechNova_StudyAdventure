const express = require("express");
const router = express.Router();
const courseUpload = require("../utils/courseUpload");
const courseController = require("../controllers/courseController");
const enrollmentController = require("../controllers/enrollmentController");
const auth = require("../middleware/auth");
const { doubleCsrfProtection } = require("../middleware/csrf");

const {
    enrollmentValidation,
    courseValidationRules,
    handleValidationErrors
} = require("../middleware/validation");

// ======================================================
// ADMIN - ADD COURSE
// ======================================================

router.post(
    "/admin/course/add",
    auth.isAdmin,
    // 1. Multer processes the files and populates req.body
    courseUpload.fields([
        { 
            name: 'image', 
            maxCount: 1 
        }, 
        { 
            name: 'content', 
            maxCount: 1000 
        }
    ]),
    doubleCsrfProtection,
    // 2. Express-validator checks req.body
    courseValidationRules(),
    // 3. Error handler catches any mistakes
    handleValidationErrors,
    // 4. Controller saves to DB
    courseController.addCourse
);

// ======================================================
// ADMIN - ALL COURSES
// ======================================================

router.get(
    "/admin/courses",
    auth.isAdmin,
    courseController.adminCourses
);


// ======================================================
// ADMIN - EDIT COURSE
// ======================================================

router.get(
    "/admin/course/edit/:id",
    auth.isAdmin,
    courseController.showEditCourse
);


router.post(
    "/admin/course/update/:id",
    auth.isAdmin,
    // 1. Multer processes the files and populates req.body
    courseUpload.fields([
        { 
            name: 'image', 
            maxCount: 1 
        }, 
        { 
            name: 'content', 
            maxCount: 1000 
        }
    ]),
    doubleCsrfProtection,
    // 2. Express-validator checks req.body
    courseValidationRules(),
    // 3. Error handler catches any mistakes
    handleValidationErrors,
    // 4. Controller saves to DB
    courseController.updateCourse
);


// ======================================================
// ADMIN - DELETE COURSE
// ======================================================

router.post(
    "/admin/course/delete/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    courseController.deleteCourse
);


// ======================================================
// PUBLIC - ALL COURSES
// ======================================================

router.get(
    "/services",
    courseController.showCourses
);


// ======================================================
// USER - COURSES
// ======================================================

router.get(
    "/courses",
    auth.isLoggedIn,
    courseController.userCourses
);


// ======================================================
// COURSE DETAILS
// ======================================================

router.get(
    "/course/:id",
    courseController.courseDetails
);


// ======================================================
// ENROLL IN COURSE
// ======================================================

router.post(
    "/course/enroll/:id",
    auth.isLoggedIn,
    doubleCsrfProtection,
    enrollmentValidation,
    handleValidationErrors,
    enrollmentController.enrollCourse
);


module.exports = router;