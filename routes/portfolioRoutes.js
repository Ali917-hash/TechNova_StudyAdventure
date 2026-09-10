const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const auth = require("../middleware/auth");
const upload = require("../utils/upload");
const { doubleCsrfProtection } = require("../middleware/csrf");

// ==========================================
// PUBLIC - PORTFOLIO
// ==========================================

router.get(
    "/portfolio",
    portfolioController.portfolio
);


// ==========================================
// PUBLIC - PROJECT DETAILS
// ==========================================

router.get(
    "/portfolio/project/:slug",
    portfolioController.projectDetails
);


// ==========================================
// ADMIN - ALL PORTFOLIO
// ==========================================

router.get(
    "/admin/portfolio",
    auth.isAdmin,
    portfolioController.adminPortfolio
);


// ==========================================
// ADMIN - ADD PROJECT PAGE
// ==========================================

router.get(
    "/admin/portfolio/add",
    auth.isAdmin,
    portfolioController.showAddPortfolio
);


// ==========================================
// ADMIN - ADD PROJECT
// ==========================================

router.post(
    "/admin/portfolio/add",
    auth.isAdmin,
    upload.single("image"),
    doubleCsrfProtection,
    portfolioController.addPortfolio
);


// ==========================================
// ADMIN - EDIT PROJECT PAGE
// ==========================================

router.get(
    "/admin/portfolio/edit/:id",
    auth.isAdmin,
    portfolioController.showEditPortfolio
);


// ==========================================
// ADMIN - UPDATE PROJECT
// ==========================================

router.post(
    "/admin/portfolio/update/:id",
    auth.isAdmin,
    upload.single("image"),
    doubleCsrfProtection,
    portfolioController.updatePortfolio
);


// ==========================================
// ADMIN - DELETE PROJECT
// ==========================================

router.post(
    "/admin/portfolio/delete/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    portfolioController.deletePortfolio
);


// ==========================================
// ADMIN - TOGGLE PUBLISHED
// ==========================================

router.post(
    "/admin/portfolio/toggle-published/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    portfolioController.togglePublished
);


// ==========================================
// ADMIN - TOGGLE FEATURED
// ==========================================

router.post(
    "/admin/portfolio/toggle-featured/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    portfolioController.toggleFeatured
);


module.exports = router;