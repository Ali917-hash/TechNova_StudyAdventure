const express = require("express");
const router = express.Router();
// const courseUpload = require("../utils/courseUpload");
const courseController = require("../controllers/courseController");
// const enrollmentController = require("../controllers/enrollmentController");
const auth = require("../middleware/auth");
const { doubleCsrfProtection } = require("../middleware/csrf");

const {
    // enrollmentValidation,
    // courseValidationRules,
    // handleValidationErrors
} = require("../middleware/validation");

// ======================================================
// ADMIN - ADD COURSE
// ======================================================

/* Unused: this route is already registered in adminRoutes.js.
router.post(
    "/admin/course/add",
    auth.isAdmin,
    courseUpload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'content', maxCount: 1000 }
    ]),
    doubleCsrfProtection,
    courseValidationRules(),
    handleValidationErrors,
    courseController.addCourse
);
*/

// ======================================================
// ADMIN - ALL COURSES
// ======================================================

/* Unused: this route is already registered in adminRoutes.js.
router.get(
    "/admin/courses",
    auth.isAdmin,
    courseController.adminCourses
);
*/


// ======================================================
// ADMIN - EDIT COURSE
// ======================================================

/* Unused: this route is already registered in adminRoutes.js.
router.get(
    "/admin/course/edit/:id",
    auth.isAdmin,
    courseController.showEditCourse
);
*/


/* Unused: this route is already registered in adminRoutes.js.
router.post(
    "/admin/course/update/:id",
    auth.isAdmin,
    courseUpload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'content', maxCount: 1000 }
    ]),
    doubleCsrfProtection,
    courseValidationRules(),
    handleValidationErrors,
    courseController.updateCourse
);
*/


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

/* Unused: this route is already registered in serviceRoutes.js.
router.get(
    "/services",
    courseController.showCourses
);
*/


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

/* Unused: this route is already registered in enrollmentRoutes.js.
router.post(
    "/course/enroll/:id",
    auth.isLoggedIn,
    doubleCsrfProtection,
    enrollmentValidation,
    handleValidationErrors,
    enrollmentController.enrollCourse
);
*/


module.exports = router;