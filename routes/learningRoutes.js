const express = require("express");

const router = express.Router();

const learningController = require("../controllers/learningController");

const auth = require("../middleware/auth");


// ==========================================
// CONTINUE LEARNING
// ==========================================

router.get(
    "/learn/course/:id",
    auth.isLoggedIn,
    learningController.learnCourse
);

// ==========================================
// SECURE COURSE MATERIAL
// ==========================================

router.get(
    "/learn/course/:courseId/material/:materialIndex",
    auth.isLoggedIn,
    learningController.getCourseMaterial
);


module.exports = router;