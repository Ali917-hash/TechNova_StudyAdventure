const express = require("express");

const router = express.Router();

const aboutController =
    require("../controllers/aboutController");

const auth =
    require("../middleware/auth");

const upload =
    require("../utils/upload");

const {
    doubleCsrfProtection
} = require("../middleware/csrf");


// ==========================================
// PUBLIC - ABOUT PAGE
// ==========================================

router.get(
    "/about",
    aboutController.about
);


// ==========================================
// ADMIN - TEAM
// ==========================================

router.get(
    "/admin/team",
    auth.isAdmin,
    aboutController.adminTeam
);


// ==========================================
// ADMIN - ADD TEAM MEMBER
// ==========================================

router.get(
    "/admin/team/add",
    auth.isAdmin,
    aboutController.showAddTeamMember
);


// ==========================================
// ADMIN - SAVE TEAM MEMBER
// ==========================================

router.post(
    "/admin/team/add",
    auth.isAdmin,
    upload.single("image"),
    doubleCsrfProtection,
    aboutController.addTeamMember
);


// ==========================================
// ADMIN - EDIT TEAM MEMBER
// ==========================================

router.get(
    "/admin/team/edit/:id",
    auth.isAdmin,
    aboutController.showEditTeamMember
);


// ==========================================
// ADMIN - UPDATE TEAM MEMBER
// ==========================================

router.post(
    "/admin/team/update/:id",
    auth.isAdmin,
    upload.single("image"),
    doubleCsrfProtection,
    aboutController.updateTeamMember
);


// ==========================================
// ADMIN - DELETE TEAM MEMBER
// ==========================================

router.post(
    "/admin/team/delete/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    aboutController.deleteTeamMember
);

// ==========================================
// ADMIN - TOGGLE VISIBILITY
// ==========================================

router.post(
    "/admin/team/toggle/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    aboutController.toggleTeamMember
);

module.exports = router;