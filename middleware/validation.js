// const { body, validationResult } = require("express-validator");
const { body, param, validationResult } = require("express-validator");

// =====================================================
// CONTACT VALIDATION
// =====================================================

const contactValidation = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required.")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters."),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail()
        .withMessage("Please enter a valid email address.")
        .normalizeEmail(),

    body("phone")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ min: 7, max: 30 })
        .withMessage("Phone number must be between 7 and 30 characters."),

    body("subject")
        .trim()
        .notEmpty()
        .withMessage("Subject is required."),

    body("message")
        .trim()
        .notEmpty()
        .withMessage("Message is required.")
        .isLength({ min: 10, max: 2000 })
        .withMessage("Message must be at least 10 characters long.")

];


// =====================================================
// REGISTRATION VALIDATION
// =====================================================

const registrationValidation = [

    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required.")
        .isLength({ max: 50 })
        .withMessage("First name must not exceed 50 characters.")
        .matches(/^[A-Za-z\s'-]+$/)
        .withMessage("First name contains invalid characters."),

    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required.")
        .isLength({ max: 50 })
        .withMessage("Last name must not exceed 50 characters.")
        .matches(/^[A-Za-z\s'-]+$/)
        .withMessage("Last name contains invalid characters."),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email address.")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 6, max: 128 })
        .withMessage(
            "Password must be between 6 and 128 characters."
        ),

    body("confirmPassword")
        .notEmpty()
        .withMessage("Please confirm your password.")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error(
                    "Passwords do not match."
                );
            }

            return true;
        }),

    body("gender")
        .isIn([
            "male",
            "female",
            "other"
        ])
        .withMessage("Invalid gender selected."),

    body("dob")
        .notEmpty()
        .withMessage("Date of birth is required.")
        .isISO8601()
        .withMessage("Please enter a valid date."),

];


// =====================================================
// LOGIN VALIDATION
// =====================================================

const loginValidation = [

    body("email")
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email address.")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required.")
        .isLength({ max: 128 })
        .withMessage(
            "Password is too long."
        ),

];


// =====================================================
// HANDLE VALIDATION ERRORS
// =====================================================

const handleValidationErrors = (
    req,
    res,
    next
) => {

    const errors =
        validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).send(
            errors.array()[0].msg
        );

    }

    next();

};

// =====================================================
// PROFILE UPDATE VALIDATION
// =====================================================

const profileUpdateValidation = [

    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required.")
        .isLength({ max: 50 })
        .withMessage(
            "First name must not exceed 50 characters."
        )
        .matches(/^[A-Za-z\s'-]+$/)
        .withMessage(
            "First name contains invalid characters."
        ),

    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required.")
        .isLength({ max: 50 })
        .withMessage(
            "Last name must not exceed 50 characters."
        )
        .matches(/^[A-Za-z\s'-]+$/)
        .withMessage(
            "Last name contains invalid characters."
        ),

    body("gender")
        .isIn([
            "male",
            "female",
            "other"
        ])
        .withMessage(
            "Invalid gender selected."
        ),

    body("dob")
        .notEmpty()
        .withMessage(
            "Date of birth is required."
        )
        .isISO8601()
        .withMessage(
            "Please enter a valid date."
        )

];


// =====================================================
// CHANGE EMAIL VALIDATION
// =====================================================

const changeEmailValidation = [

    body("newEmail")
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email address.")
        .normalizeEmail(),

    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required.")
        .isLength({ max: 128 })
        .withMessage("Password is too long.")
];


// =====================================================
// CHANGE PASSWORD VALIDATION
// =====================================================

const changePasswordValidation = [

    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required.")
        .isLength({ max: 128 })
        .withMessage("Password is too long."),

    body("newPassword")
        .isLength({
            min: 6,
            max: 128
        })
        .withMessage(
            "New password must be between 6 and 128 characters."
        ),

    body("confirmPassword")
        .notEmpty()
        .withMessage(
            "Please confirm your new password."
        )
        .custom((value, { req }) => {

            if (
                value !==
                req.body.newPassword
            ) {

                throw new Error(
                    "New password and confirm password do not match."
                );

            }

            return true;

        })

];

// =====================================================
// COURSE ENROLLMENT VALIDATION
// =====================================================
const enrollmentValidation = [
    param("id")
        .trim()
        .notEmpty()
        .withMessage("Course ID is required.")
        .isMongoId()
        .withMessage("Invalid Course ID format.")
];

// =====================================================
// COURSE  VALIDATION
// ====================================================
const courseValidationRules = () => {
    return [

        body("title")
            .trim()
            .notEmpty()
            .withMessage("Course title is required.")
            .isLength({ max: 150 })
            .withMessage(
                "Title cannot exceed 150 characters."
            ),

        body("instructor")
            .trim()
            .notEmpty()
            .withMessage(
                "Instructor name is required."
            )
            .isLength({ max: 100 })
            .withMessage(
                "Instructor name cannot exceed 100 characters."
            ),

        body("category")
            .trim()
            .notEmpty()
            .withMessage(
                "Course category is required."
            )
            .isLength({ max: 100 })
            .withMessage(
                "Course category cannot exceed 100 characters."
            ),

        body("price")
            .optional({ checkFalsy: true })
            .isNumeric()
            .withMessage(
                "Price must be a valid number."
            )
            .isFloat({ min: 0 })
            .withMessage(
                "Price cannot be negative."
            ),

        body("duration")
            .trim()
            .notEmpty()
            .withMessage(
                "Course duration is required. (e.g., '4 Weeks')"
            )
            .isLength({ max: 50 })
            .withMessage(
                "Course duration cannot exceed 50 characters."
            ),

        body("level")
            .trim()
            .notEmpty()
            .withMessage(
                "Course level is required. (e.g., 'Beginner')"
            )
            .isLength({ max: 50 })
            .withMessage(
                "Course level cannot exceed 50 characters."
            ),

        body("description")
            .trim()
            .notEmpty()
            .withMessage(
                "Course description is required."
            )
            .isLength({ max: 5000 })
            .withMessage(
                "Course description cannot exceed 5000 characters."
            )
    ];
};

const passwordResetValidation = [

    body("password")
        .isLength({ min: 6, max: 128 })
        .withMessage(
            "Password must be between 6 and 128 characters."
        ),

    body("confirmPassword")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match.");
            }

            return true;
        })
        .withMessage("Passwords do not match.")

];

module.exports = {
    registrationValidation,
    loginValidation,
    contactValidation,
    profileUpdateValidation,
    changeEmailValidation,
    changePasswordValidation,
    enrollmentValidation,
    courseValidationRules,
    passwordResetValidation,
    handleValidationErrors
};