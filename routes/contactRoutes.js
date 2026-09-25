const express = require("express");

const router = express.Router();

const contactController =
    require("../controllers/contactController");

const auth =
    require("../middleware/auth");

const {
    doubleCsrfProtection
} = require("../middleware/csrf");
const {
    contactValidation,
    handleValidationErrors
} = require("../middleware/validation");

// ==========================================
// PUBLIC - CONTACT PAGE
// ==========================================

router.get(
    "/contact",
    contactController.showContact
);


// ==========================================
// PUBLIC - SUBMIT CONTACT
// ==========================================

router.post(
    "/contact",
    doubleCsrfProtection,
    contactValidation,
    handleValidationErrors,
    contactController.submitContact
);


// ==========================================
// ADMIN - ALL MESSAGES
// ==========================================

router.get(
    "/admin/messages",
    auth.isAdmin,
    contactController.adminMessages
);


// ==========================================
// ADMIN - VIEW MESSAGE
// ==========================================

router.get(
    "/admin/messages/view/:id",
    auth.isAdmin,
    contactController.viewMessage
);


// ==========================================
// ADMIN - REPLY TO MESSAGE
// ==========================================

router.post(
    "/admin/messages/reply/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    contactController.replyToMessage
);


// ==========================================
// ADMIN - DELETE MESSAGE
// ==========================================

router.post(
    "/admin/messages/delete/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    contactController.deleteMessage
);


module.exports = router;