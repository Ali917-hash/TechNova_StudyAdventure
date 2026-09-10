const express = require("express");

const router = express.Router();

const progressController =
    require("../controllers/progressController");

const auth =
    require("../middleware/auth");

const {
    doubleCsrfProtection
} = require("../middleware/csrf");


// ==========================================
// SAVE CURRENT MATERIAL
// ==========================================

router.post(
    "/course/:courseId/material/:materialIndex/open",
    auth.isLoggedIn,
    doubleCsrfProtection,
    progressController.setCurrentMaterial
);


// ==========================================
// COMPLETE COURSE MATERIAL
// ==========================================

router.post(
    "/course/:courseId/material/:materialIndex/complete",
    auth.isLoggedIn,
    doubleCsrfProtection,
    progressController.completeMaterial
);


// ==========================================
// GET COURSE PROGRESS
// ==========================================

router.get(
    "/course/:courseId/progress",
    auth.isLoggedIn,
    progressController.getCourseProgress
);


module.exports = router;