const rateLimit = require("express-rate-limit");


// ==========================================
// LOGIN RATE LIMITER
// ==========================================

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login attempts. Please try again after 15 minutes.",
    standardHeaders: true,
    legacyHeaders: false
});


// ==========================================
// REGISTRATION RATE LIMITER
// ==========================================

const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many registration attempts. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});

// ==========================================
// PASSWORD RESET RATE LIMITER
// ==========================================

const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many password reset requests. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});


module.exports = {
    loginLimiter,
    registrationLimiter,
    passwordResetLimiter
};