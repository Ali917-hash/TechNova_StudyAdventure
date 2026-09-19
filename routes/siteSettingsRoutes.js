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

router.get(
    "/admin/site-settings/:page",
    auth.isAdmin,
    controller.pageSettings
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
        },
    ]),
    doubleCsrfProtection,
    controller.updateSettings
);

router.post(
    "/admin/site-settings/:page",
    auth.isAdmin,
    upload.fields([
        {
            name: "heroImage",
            maxCount: 1
        },
        {
            name: "storyImage",
            maxCount: 1
        },
        {
            name: "brandLogo",
            maxCount: 1
        }
    ]),
    doubleCsrfProtection,
    controller.updatePageSettings
);


module.exports = router;