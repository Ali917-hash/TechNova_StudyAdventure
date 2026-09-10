const mongoose = require("mongoose");
const User = require("../models/User");

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
// CHECK: USER MUST BE LOGGED IN
// =====================================================

exports.isLoggedIn = async (req, res, next) => {

    try {

        // ==========================================
        // CHECK SESSION
        // ==========================================

        const userId =
            getUserId(req);


        if (!userId) {

            return res.redirect("/login");

        }


        // ==========================================
        // VALIDATE USER ID
        // ==========================================

        if (
            !mongoose.Types.ObjectId.isValid(
                userId
            )
        ) {

            req.session.destroy(() => {});

            return res.redirect("/login");

        }


        // ==========================================
        // VERIFY USER STILL EXISTS
        // ==========================================

        const user =
            await User.findById(userId)
                .select("_id role isActive")
                .lean();


        if (!user) {

            req.session.destroy(() => {});

            return res.redirect("/login");

        }

        // ==========================================
        // CHECK ACCOUNT STATUS
        // ==========================================

        if (!user.isActive) {

            req.session.destroy(() => {});

            return res.redirect(
                "/login?error=inactive"
            );

        }


        // ==========================================
        // KEEP SESSION ROLE IN SYNC
        // ==========================================

        req.session.user.role =
            user.role;


        next();


    } catch (error) {

        console.error(
            "AUTHENTICATION MIDDLEWARE ERROR:",
            error
        );

        return res.status(500).send(
            "Authentication check failed."
        );

    }

};


// =====================================================
// CHECK: USER MUST BE ADMIN
// =====================================================

exports.isAdmin = async (req, res, next) => {

    try {

        // ==========================================
        // CHECK SESSION
        // ==========================================

        const userId =
            getUserId(req);


        if (!userId) {

            return res.redirect("/login");

        }


        // ==========================================
        // VALIDATE USER ID
        // ==========================================

        if (
            !mongoose.Types.ObjectId.isValid(
                userId
            )
        ) {

            req.session.destroy(() => {});

            return res.redirect("/login");

        }


        // ==========================================
        // VERIFY USER + ADMIN ROLE
        // ==========================================

        const user =
            await User.findById(userId)
                .select("_id role isActive")
                .lean();


        if (!user) {

            req.session.destroy(() => {});

            return res.redirect("/login");

        }


        // ==========================================
        // ACCOUNT STATUS
        // ==========================================

        if (!user.isActive) {

            req.session.destroy(() => {});

            return res.redirect(
                "/login?error=inactive"
            );

        }


        // ==========================================
        // ADMIN CHECK
        // ==========================================

        if (user.role !== "admin") {

            return res.redirect(
                "/dashboard"
            );

        }


        // ==========================================
        // KEEP SESSION ROLE IN SYNC
        // ==========================================

        req.session.user.role =
            user.role;


        next();


    } catch (error) {

        console.error(
            "ADMIN AUTHORIZATION ERROR:",
            error
        );

        return res.status(500).send(
            "Authorization check failed."
        );

    }

};