const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../utils/upload");
const auth = require("../middleware/auth");

const {
    doubleCsrfProtection
} = require("../middleware/csrf");

const {
    loginLimiter,
    registrationLimiter,
    passwordResetLimiter
} = require("../middleware/rateLimiter");

const {
    registrationValidation,
    loginValidation,
    profileUpdateValidation,
    changeEmailValidation,
    changePasswordValidation,
    passwordResetValidation,
    handleValidationErrors
} = require("../middleware/validation");


// ==========================================
// REGISTRATION
// ==========================================

router.get(
    "/registration",
    userController.showRegister
);

router.post(
    "/registration",
    registrationLimiter,
    doubleCsrfProtection,
    registrationValidation,
    handleValidationErrors,
    userController.registerUser
);


// ==========================================
// LOGIN
// ==========================================

router.get(
    "/login",
    userController.showLogin
);

router.post(
    "/login",
    loginLimiter,
    doubleCsrfProtection,
    loginValidation,
    handleValidationErrors,
    userController.loginUser
);

// ==========================================
// PASSWORD RESET
// ==========================================

router.get(
    "/forgot-password",
    userController.showForgotPassword
);

router.post(
    "/forgot-password",
    passwordResetLimiter,
    doubleCsrfProtection,
    userController.forgotPassword
);

router.get(
    "/reset-password/:token",
    userController.showResetPassword
);

router.post(
    "/reset-password/:token",
    doubleCsrfProtection,
    passwordResetValidation,
    handleValidationErrors,
    userController.resetPassword
);


// ==========================================
// DASHBOARD
// ==========================================

router.get(
    "/dashboard",
    auth.isLoggedIn,
    userController.dashboard
);


// ==========================================
// PROFILE
// ==========================================

router.get(
    "/profile",
    auth.isLoggedIn,
    userController.profile
);


// ==========================================
// UPDATE PROFILE
// ==========================================

router.post(
    "/profile/update",
    auth.isLoggedIn,
    upload.single("profileImage"),
    doubleCsrfProtection,
    profileUpdateValidation,
    handleValidationErrors,
    userController.updateProfile
);


// ==========================================
// CHANGE EMAIL
// ==========================================

router.post(
    "/profile/change-email",
    auth.isLoggedIn,
    doubleCsrfProtection,
    changeEmailValidation,
    handleValidationErrors,
    userController.changeEmail
);


// ==========================================
// CHANGE PASSWORD
// ==========================================

router.post(
    "/profile/change-password",
    auth.isLoggedIn,
    doubleCsrfProtection,
    changePasswordValidation,
    handleValidationErrors,
    userController.changePassword
);


// ==========================================
// LOGOUT
// ==========================================

router.post(
    "/logout",
    auth.isLoggedIn,
    doubleCsrfProtection,
    userController.logout
);


module.exports = router;