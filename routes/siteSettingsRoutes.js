const express = require("express");

const router = express.Router();

const controller =
    require("../controllers/siteSettingsController");

const auth =
    require("../middleware/auth");

const upload =
    require("../utils/upload");

const {
    doubleCsrfProtection
} = require("../middleware/csrf");


// ==========================================
// ADMIN - WEBSITE SETTINGS
// ==========================================

router.get(
    "/admin/site-settings",
    auth.isAdmin,
    controller.settingsPage
);


// ==========================================
// ADMIN - UPDATE WEBSITE SETTINGS
// ==========================================

router.post(
    "/admin/site-settings",
    auth.isAdmin,
    upload.fields([
        {
            name: "heroImage",
            maxCount: 1
        },
        {
            name: "storyImage",
            maxCount: 1
        }
    ]),
    doubleCsrfProtection,
    controller.updateSettings
);


module.exports = router;