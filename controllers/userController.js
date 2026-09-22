const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const getAppUrl = require("../utils/appUrl");
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");
const Certificate = require("../models/Certificate");
const LoginActivity = require("../models/LoginActivity");


// =====================================================
// GET CURRENT USER ID
// =====================================================

function getUserId(req) {

    return (
        req.session?.user?._id ||
        req.session?.user?.id ||
        null
    );

}


// =====================================================
// VALIDATE OBJECT ID
// =====================================================

function isValidObjectId(id) {

    return mongoose.Types.ObjectId.isValid(id);

}


// =====================================================
// BUILD SAFE SESSION USER
// =====================================================

function createSessionUser(user) {

    return {

        _id: user._id.toString(),

        firstName:
            user.firstName,

        lastName:
            user.lastName,

        email:
            user.email,

        gender:
            user.gender,

        dob:
            user.dob,

        profileImage:
            user.profileImage || "",

        role:
            user.role,

        isActive:
            user.isActive

    };

}


// =====================================================
// USER DASHBOARD
// =====================================================

exports.dashboard = async (req, res) => {

    try {

        const studentId =
            getUserId(req);


        if (!studentId) {

            return res.redirect("/login");

        }


        if (!isValidObjectId(studentId)) {

            req.session.destroy(() => {});

            return res.redirect("/login");

        }


        // ==========================================
        // VERIFY ACCOUNT STILL EXISTS
        // ==========================================

        const currentUser =
            await User.findById(studentId)
                .select("_id isActive role")
                .lean();


        if (!currentUser) {

            req.session.destroy(() => {});

            return res.redirect("/login");

        }


        // ==========================================
        // CHECK ACCOUNT STATUS
        // ==========================================

        if (!currentUser.isActive) {

            req.session.destroy(() => {});

            return res.redirect(
                "/login?error=inactive"
            );

        }


        // ==========================================
        // GET ALL ENROLLMENTS SO PENDING REQUESTS REMAIN VISIBLE
        // ==========================================

        const enrollments =
            await Enrollment.find({
                student: studentId
            })
            .populate("course")
            .sort({
                createdAt: -1
            })
            .lean();


        // ==========================================
        // ATTACH PROGRESS
        // ==========================================

        for (const enrollment of enrollments) {

            if (!enrollment.course) {

                enrollment.progress = 0;

                enrollment.completed = false;

                continue;

            }


            const progress =
                await Progress.findOne({

                    user: studentId,

                    course:
                        enrollment.course._id

                }).lean();


            enrollment.progress =
                progress
                    ? progress.progress
                    : 0;


            enrollment.completed =
                progress
                    ? progress.completed
                    : false;

        }


        // ==========================================
        // STATISTICS
        // ==========================================

        const enrolledCourses =
            enrollments.filter(
                enrollment => enrollment.status === "approved"
            ).length;


        const completedCourses =
            enrollments.filter(
                enrollment =>
                    enrollment.completed === true
            ).length;


        const certificates =
            await Certificate.countDocuments({

                user: studentId

            });


        const learningHours = 0;


        // ==========================================
        // RENDER
        // ==========================================

        return res.render(
            "user/dashboard",
            {

                user:
                    req.session.user,

                myCourses:
                    enrollments,

                enrolledCourses,

                completedCourses,

                certificates,

                learningHours

            }
        );


    } catch (error) {

        console.error(
            "USER DASHBOARD ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to load user dashboard."
        );

    }

};


// =====================================================
// SHOW REGISTRATION PAGE
// =====================================================

exports.showRegister = (
    req,
    res
) => {

    const courseId =
        req.query.course || "";

    const returnTo =
        typeof req.query.returnTo === "string" &&
        req.query.returnTo.startsWith("/") &&
        !req.query.returnTo.startsWith("//")
            ? req.query.returnTo
            : "/";


    return res.render(
        "registration",
        {

            courseId,

            returnTo

        }
    );

};


// =====================================================
// SHOW LOGIN PAGE
// =====================================================

exports.showLogin = (
    req,
    res
) => {

    const courseId =
        req.query.course || "";

    const returnTo =
        typeof req.query.returnTo === "string" &&
        req.query.returnTo.startsWith("/") &&
        !req.query.returnTo.startsWith("//")
            ? req.query.returnTo
            : "/";


    return res.render(
        "login",
        {

            courseId,

            returnTo

        }
    );

};


// =====================================================
// REGISTER USER
// =====================================================

exports.registerUser = async (
    req,
    res
) => {

    try {

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            gender,
            dob,
            courseId
        } = req.body;


        // ==========================================
        // REQUIRED FIELDS
        // ==========================================

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !gender ||
            !dob
        ) {

            return res.status(400).send(
                "Please fill all required fields."
            );

        }


        // ==========================================
        // NORMALIZE EMAIL
        // ==========================================

        const normalizedEmail =
            email.trim().toLowerCase();


        // ==========================================
        // PASSWORD MATCH
        // ==========================================

        if (
            password !==
            confirmPassword
        ) {

            return res.status(400).send(
                "Passwords do not match."
            );

        }


        // ==========================================
        // BASIC PASSWORD VALIDATION
        // ==========================================

        if (password.length < 6) {

            return res.status(400).send(
                "Password must be at least 6 characters long."
            );

        }


        // ==========================================
        // CHECK EXISTING USER
        // ==========================================

        const existingUser =
            await User.findOne({

                email:
                    normalizedEmail

            });


        if (existingUser) {

            return res.status(400).send(
                "Email already exists."
            );

        }


        // ==========================================
        // HASH PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ==========================================
        // CREATE USER
        // ==========================================

        await User.create({

            firstName:
                firstName.trim(),

            lastName:
                lastName.trim(),

            email:
                normalizedEmail,

            password:
                hashedPassword,

            gender,

            dob,

            role: "user",

            isActive: true

        });


        // ==========================================
        // REDIRECT
        // ==========================================

        return res.redirect(

            courseId
                ? `/login?course=${encodeURIComponent(courseId)}`
                : "/login"

        );


    } catch (error) {

        console.error(
            "REGISTER USER ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to create account."
        );

    }

};


// =====================================================
// LOGIN USER
// =====================================================

exports.loginUser = async (
    req,
    res
) => {

    try {

        const {
            email,
            password,
            courseId,
            returnTo
        } = req.body;


        // ==========================================
        // VALIDATE INPUT
        // ==========================================

        if (!email || !password) {

            return res.status(400).send(
                "Email and password are required."
            );

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await User.findOne({

                email:
                    normalizedEmail

            });


        if (!user) {

            return res.status(401).send(
                "Email not registered."
            );

        }


        // ==========================================
        // CHECK ACCOUNT STATUS
        // ==========================================

        if (!user.isActive) {

            return res.status(403).send(
                "Your account is inactive. Please contact the administrator."
            );

        }


        // ==========================================
        // CHECK PASSWORD
        // ==========================================

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(401).send(
                "Incorrect password."
            );

        }


        // ==========================================
        // REGENERATE SESSION
        // ==========================================

        req.session.regenerate(
            (sessionError) => {

                if (sessionError) {

                    console.error(
                        "SESSION REGENERATE ERROR:",
                        sessionError
                    );

                    return res.status(500).send(
                        "Could not create login session."
                    );

                }


                // ======================================
                // CREATE SAFE SESSION
                // ======================================

                req.session.user =
                    createSessionUser(user);


                req.session.save(
                    (saveError) => {

                        if (saveError) {

                            console.error(
                                "SESSION SAVE ERROR:",
                                saveError
                            );

                            return res.status(500).send(
                                "Could not create login session."
                            );

                        }

                        const loginDetails = {
                            user: user._id,
                            email: user.email,
                            role: user.role,
                            ipAddress: req.ip || req.socket.remoteAddress || "unknown",
                            userAgent: req.get("user-agent") || "unknown"
                        };

                        LoginActivity.create(loginDetails)
                            .then(() => {
                                return nodemailer
                                    .createTransport({
                                        host: process.env.MAIL_HOST,
                                        port: Number(process.env.MAIL_PORT || 587),
                                        secure: process.env.MAIL_SECURE === "true",
                                        auth: {
                                            user: process.env.MAIL_USER,
                                            pass: process.env.MAIL_PASS
                                        }
                                    })
                                    .sendMail({
                                        from: process.env.MAIL_FROM || process.env.MAIL_USER,
                                        to: "technova.platform@gmail.com",
                                        subject: `TechNova login: ${user.email}`,
                                        text: [
                                            "A user logged in to TechNova.",
                                            `Email: ${user.email}`,
                                            `Role: ${user.role}`,
                                            `IP address: ${loginDetails.ipAddress}`,
                                            `Time: ${new Date().toISOString()}`,
                                            `User agent: ${loginDetails.userAgent}`
                                        ].join("\n")
                                    });
                            })
                            .catch((loginNotificationError) => {
                                console.error(
                                    "LOGIN ACTIVITY NOTIFICATION ERROR:",
                                    loginNotificationError
                                );
                            });


                        // ==================================
                        // ADMIN REDIRECT
                        // ==================================

                        if (
                            user.role === "admin"
                        ) {

                            return res.redirect(
                                "/admin/dashboard"
                            );

                        }


                        // ==================================
                        // COURSE LOGIN FLOW
                        // ==================================

                        if (courseId) {

                            return res.redirect(
                                "/course/" +
                                encodeURIComponent(
                                    courseId
                                )
                            );

                        }


                        // ==================================
                        // NORMAL USER
                        // ==================================

                        return res.redirect(
                            returnTo &&
                            returnTo.startsWith("/") &&
                            !returnTo.startsWith("//")
                                ? returnTo
                                : "/"
                        );

                    }
                );

            }
        );

    } catch (error) {

        console.error(
            "LOGIN USER ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to login."
        );

    }

};

// =====================================================
//  FORGET PASSWORD PAGE
// =====================================================
exports.showForgotPassword = (req, res) => {
    res.render("auth/forgotPassword", { user: req.session.user || null });
};

// =====================================================
//  Handle Forgot Password Request (Generate Token)
// =====================================================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        const successMessage =
            "If that email exists, a password reset link has been sent.";

        if (!user) {
            // For security, don't reveal if the email exists or not
            return res.render("auth/forgotPassword", { 
                success: successMessage,
                csrfToken: req.csrfToken()
            });
        }

        // Generate a random secure token
        const token = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
        await user.save();

        const resetLink = `${getAppUrl()}/reset-password/${token}`;
        
        // --- EMAIL SENDING LOGIC ---
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT || 587),
            secure: process.env.MAIL_SECURE === "true",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.MAIL_USER,
            to: user.email,
            subject: "Reset your TechNova password",
            text: `Use this link to reset your TechNova password. It expires in one hour: ${resetLink}`
        });

        res.render("auth/forgotPassword", { 
            success: successMessage,
            csrfToken: req.csrfToken()
        });

    } catch (err) {
        console.error("FORGOT PASSWORD ERROR:", err);
        res.status(500).send("Something went wrong.");
    }
};

// 3. Render Reset Password Page (Verify Token)
exports.showResetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Check if token is not expired
        });

        if (!user) {
            return res.status(400).send("Password reset token is invalid or has expired.");
        }

        res.render("auth/resetPassword", { token, user: null });
    } catch (err) {
        console.error("SHOW RESET PAGE ERROR:", err);
        res.status(500).send("An error occurred.");
    }
};

// 4. Handle Password Update
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).send("Passwords do not match.");
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send("Password reset token is invalid or has expired.");
        }

        // Hash the new password (adjust according to how your user model hashes passwords)
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear out the reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        console.log("Password successfully reset for user:", user.email);
        res.redirect("/login");

    } catch (err) {
        console.error("RESET PASSWORD ERROR:", err);
        res.status(500).send("Unable to reset password.");
    }
};

// =====================================================
// SHOW USER PROFILE
// =====================================================

exports.profile = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);


        if (!userId) {

            return res.redirect("/login");

        }


        if (!isValidObjectId(userId)) {

            req.session.destroy(() => {});

            return res.redirect("/login");

        }


        const user =
            await User.findById(
                userId
            ).lean();


        if (!user) {

            req.session.destroy(() => {});

            return res.redirect("/login");

        }


        if (!user.isActive) {

            req.session.destroy(() => {});

            return res.redirect(
                "/login?error=inactive"
            );

        }


        return res.render(
            "user/profile",
            {

                user

            }
        );


    } catch (error) {

        console.error(
            "PROFILE ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to load profile."
        );

    }

};


// =====================================================
// UPDATE USER PROFILE
// =====================================================

exports.updateProfile = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);


        if (!userId) {

            return res.redirect("/login");

        }


        if (!isValidObjectId(userId)) {
            req.session.destroy(() => {});
            return res.redirect("/login");

        }

        const user =
            await User.findById(
                userId
            );

        if (!user) {
            req.session.destroy(() => {});
            return res.redirect("/login");
        }

        // ==========================================
        // CHECK ACTIVE ACCOUNT
        // ==========================================

        if (!user.isActive) {
            req.session.destroy(() => {});
            return res.redirect(
                "/login?error=inactive"
            );
        }

        // ==========================================
        // INPUT
        // ==========================================

        const firstName =
            req.body.firstName
                ? req.body.firstName.trim()
                : "";

        const lastName =
            req.body.lastName
                ? req.body.lastName.trim()
                : "";

        const gender = req.body.gender;
        const dob = req.body.dob;

        if (
            !firstName ||
            !lastName ||
            !gender ||
            !dob
        ) {

            return res.status(400).send(
                "Please fill all required fields."
            );

        }

        // ==========================================
        // UPDATE USER
        // ==========================================

        user.firstName = firstName;
        user.lastName = lastName;
        user.gender = gender;
        user.dob = dob;

        if (req.file) {
            user.profileImage = req.file.filename;
        }

        await user.save();

        // ==========================================
        // UPDATE SESSION
        // ==========================================

        req.session.user =
            createSessionUser(user);

        return req.session.save(
            (error) => {

                if (error) {

                    console.error(
                        "PROFILE SESSION SAVE ERROR:",
                        error
                    );

                    return res.status(500).send(
                        "Profile updated but session could not be saved."
                    );

                }


                return res.redirect(
                    "/profile"
                );

            }
        );


    } catch (error) {

        console.error(
            "PROFILE UPDATE ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to update profile."
        );

    }

};


// =====================================================
// CHANGE EMAIL
// =====================================================

exports.changeEmail = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);


        if (!userId) {

            return res.redirect("/login");

        }


        const newEmail =
            req.body.newEmail
                ? req.body.newEmail
                    .trim()
                    .toLowerCase()
                : "";

        const currentPassword =
            req.body.currentPassword || "";


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !newEmail ||
            !currentPassword
        ) {

            return res.status(400).send(
                "New email and current password are required."
            );

        }


        if (
            !isValidObjectId(userId)
        ) {

            req.session.destroy(() => {});

            return res.redirect("/login");

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(newEmail)
        ) {

            return res.status(400).send(
                "Please enter a valid email address."
            );

        }


        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await User.findById(
                userId
            );


        if (!user) {

            req.session.destroy(() => {});

            return res.redirect("/login");

        }


        if (!user.isActive) {

            req.session.destroy(() => {});

            return res.redirect(
                "/login?error=inactive"
            );

        }


        // ==========================================
        // CURRENT PASSWORD
        // ==========================================

        const passwordMatches =
            await bcrypt.compare(
                currentPassword,
                user.password
            );


        if (!passwordMatches) {

            return res.status(400).send(
                "Current password is incorrect."
            );

        }


        // ==========================================
        // SAME EMAIL
        // ==========================================

        if (
            user.email.toLowerCase() ===
            newEmail
        ) {

            return res.status(400).send(
                "The new email is the same as your current email."
            );

        }


        // ==========================================
        // DUPLICATE EMAIL
        // ==========================================

        const existingUser =
            await User.findOne({

                email: newEmail,

                _id: {
                    $ne: userId
                }

            });


        if (existingUser) {

            return res.status(400).send(
                "This email address is already registered."
            );

        }


        // ==========================================
        // SAVE
        // ==========================================

        user.email =
            newEmail;


        await user.save();


        // ==========================================
        // UPDATE SESSION
        // ==========================================

        req.session.user.email =
            user.email;


        return req.session.save(
            (error) => {

                if (error) {

                    console.error(
                        "EMAIL SESSION SAVE ERROR:",
                        error
                    );

                    return res.status(500).send(
                        "Email changed but session could not be updated."
                    );

                }


                return res.redirect(
                    "/profile"
                );

            }
        );


    } catch (error) {

        console.error(
            "CHANGE EMAIL ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to change email."
        );

    }

};


// =====================================================
// CHANGE PASSWORD
// =====================================================

exports.changePassword = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);


        if (!userId) {

            return res.redirect("/login");

        }


        if (
            !isValidObjectId(userId)
        ) {

            req.session.destroy(() => {});

            return res.redirect("/login");

        }


        const currentPassword =
            req.body.currentPassword || "";

        const newPassword =
            req.body.newPassword || "";

        const confirmPassword =
            req.body.confirmPassword || "";


        // ==========================================
        // REQUIRED FIELDS
        // ==========================================

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            return res.status(400).send(
                "Please fill all password fields."
            );

        }


        // ==========================================
        // MATCH
        // ==========================================

        if (
            newPassword !==
            confirmPassword
        ) {

            return res.status(400).send(
                "New password and confirm password do not match."
            );

        }


        // ==========================================
        // LENGTH
        // ==========================================

        if (
            newPassword.length < 6
        ) {

            return res.status(400).send(
                "New password must be at least 6 characters long."
            );

        }


        const user =
            await User.findById(
                userId
            );


        if (!user) {

            req.session.destroy(() => {});

            return res.redirect("/login");

        }


        if (!user.isActive) {

            req.session.destroy(() => {});

            return res.redirect(
                "/login?error=inactive"
            );

        }


        // ==========================================
        // CURRENT PASSWORD
        // ==========================================

        const passwordMatches =
            await bcrypt.compare(
                currentPassword,
                user.password
            );


        if (!passwordMatches) {

            return res.status(400).send(
                "Current password is incorrect."
            );

        }


        // ==========================================
        // SAME PASSWORD
        // ==========================================

        const samePassword =
            await bcrypt.compare(
                newPassword,
                user.password
            );


        if (samePassword) {

            return res.status(400).send(
                "New password must be different from your current password."
            );

        }


        // ==========================================
        // HASH
        // ==========================================

        user.password =
            await bcrypt.hash(
                newPassword,
                10
            );


        await user.save();


        // ==========================================
        // KEEP CURRENT SESSION
        // ==========================================

        return req.session.save(
            (error) => {

                if (error) {

                    console.error(
                        "PASSWORD SESSION SAVE ERROR:",
                        error
                    );

                    return res.status(500).send(
                        "Password changed but session could not be saved."
                    );

                }


                return res.redirect(
                    "/profile"
                );

            }
        );


    } catch (error) {

        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to change password."
        );

    }

};


// =====================================================
// LOGOUT
// =====================================================

exports.logout = (
    req,
    res
) => {

    req.session.destroy(
        (error) => {

            if (error) {

                console.error(
                    "LOGOUT ERROR:",
                    error
                );

                return res.status(500).send(
                    "Could not logout."
                );

            }


            res.clearCookie(
                "connect.sid"
            );


            return res.redirect(
                "/login"
            );

        }
    );

};