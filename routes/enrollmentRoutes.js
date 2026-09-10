const express = require("express");

const router = express.Router();

const enrollmentController =
    require("../controllers/enrollmentController");

const auth =
    require("../middleware/auth");

const {
    doubleCsrfProtection
} = require("../middleware/csrf");


// ==========================================
// ENROLL IN COURSE
// ==========================================

router.post(
    "/course/enroll/:id",
    auth.isLoggedIn,
    doubleCsrfProtection,
    enrollmentController.enrollCourse
);


module.exports = router;