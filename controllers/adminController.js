const mongoose = require("mongoose");

const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Contact = require("../models/Contact");
const Blog = require("../models/Blog");
const Progress = require("../models/Progress");
const Certificate = require("../models/Certificate");
const LoginActivity = require("../models/LoginActivity");
const VisitActivity = require("../models/VisitActivity");
const nodemailer = require("nodemailer");
const getAppUrl = require("../utils/appUrl");

// ==========================================
// VALIDATE MONGODB OBJECT ID
// ==========================================

function isValidObjectId(id) {

    return mongoose.Types.ObjectId.isValid(id);

}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

exports.dashboard = async (req, res) => {

    try {

        // ==========================================
        // CHECK LOGIN
        // ==========================================

        if (!req.session.user) {

            return res.redirect("/login");

        }


        // ==========================================
        // CHECK ADMIN
        // ==========================================

        if (req.session.user.role !== "admin") {

            return res.redirect("/dashboard");

        }


        // ==========================================
        // EXISTING DASHBOARD STATISTICS
        // DO NOT REMOVE THESE
        // ==========================================

        const totalCourses =
            await Course.countDocuments();


        const totalStudents =
            await User.countDocuments({
                role: "user"
            });


        const totalMessages =
            await Contact.countDocuments();


        const totalEnrollments =
            await Enrollment.countDocuments();


        // ==========================================
        // NEW ANALYTICS
        // ==========================================

        const pendingEnrollments =
            await Enrollment.countDocuments({
                status: "pending"
            });


        const approvedEnrollments =
            await Enrollment.countDocuments({
                status: "approved"
            });


        const rejectedEnrollments =
            await Enrollment.countDocuments({
                status: "rejected"
            });


        const completedCourses =
            await Progress.countDocuments({
                completed: true
            });


        const certificatesIssued =
            await Certificate.countDocuments();


        // ==========================================
        // TOP COURSES
        // ==========================================

        const topCourses =
            await Enrollment.aggregate([

                {
                    $group: {

                        _id: "$course",

                        students: {
                            $sum: 1
                        }

                    }
                },


                {
                    $sort: {
                        students: -1
                    }
                },


                {
                    $limit: 5
                },


                {
                    $lookup: {

                        from: "courses",

                        localField: "_id",

                        foreignField: "_id",

                        as: "course"

                    }
                },


                {
                    $unwind: {

                        path: "$course",

                        preserveNullAndEmptyArrays: true

                    }
                },


                {
                    $project: {

                        _id: 1,

                        students: 1,

                        title: "$course.title",

                        category: "$course.category"

                    }
                }

            ]);


        // ==========================================
        // RECENT ENROLLMENTS
        // ==========================================

        const recentEnrollments =
            await Enrollment.find()

                .populate(
                    "student",
                    "firstName lastName email"
                )

                .populate(
                    "course",
                    "title"
                )

                .sort({
                    createdAt: -1
                })

                .limit(5)

                .lean();


        // ==========================================
        // RECENT STUDENTS
        // ==========================================

        const recentStudents =
            await User.find({
                role: "user"
            })

                .select(
                    "firstName lastName email createdAt"
                )

                .sort({
                    createdAt: -1
                })

                .limit(5)

                .lean();

        // ==========================================
        // RECENT CERTIFICATES
        // ==========================================

        const recentCertificates =
            await Certificate.find()

                .populate(
                    "user",
                    "firstName lastName"
                )

                .populate(
                    "course",
                    "title"
                )

                .sort({
                    issuedAt: -1
                })

                .limit(5)

                .lean();

        // ==========================================
        // RECENT MESSAGES
        // ==========================================

        const recentMessages =
            await Contact.find()

                .sort({
                    createdAt: -1
                })

                .limit(5)

                .lean();

        const recentLogins =
            await LoginActivity.find()
                .populate(
                    "user",
                    "firstName lastName email role"
                )
                .sort({
                    loggedInAt: -1
                })
                .limit(5)
                .lean();

        const platformHealth = {
            database: mongoose.connection.readyState === 1,
            email: Boolean(
                process.env.MAIL_HOST &&
                process.env.MAIL_USER &&
                process.env.MAIL_PASS
            ),
            storage: process.env.VERCEL
                ? "Cloud storage"
                : "Local storage"
        };

        // ==========================================
        // COURSE PERFORMANCE ANALYTICS
        // ==========================================

        const coursePerformance =
            await Course.aggregate([

                // Get all courses
                {
                    $project: {
                        title: 1,
                        category: 1
                    }
                },

                // Find enrollments for each course
                {
                    $lookup: {
                        from: "enrollments",
                        localField: "_id",
                        foreignField: "course",
                        as: "enrollments"
                    }
                },

                // Find progress records for each course
                {
                    $lookup: {
                        from: "progresses",
                        localField: "_id",
                        foreignField: "course",
                        as: "progressRecords"
                    }
                },

                // Calculate statistics
                {
                    $project: {

                        title: 1,

                        category: 1,

                        enrolledStudents: {
                            $size: "$enrollments"
                        },

                        completedStudents: {
                            $size: {
                                $filter: {
                                    input: "$progressRecords",
                                    as: "progress",
                                    cond: {
                                        $eq: [
                                            "$$progress.completed",
                                            true
                                        ]
                                    }
                                }
                            }
                        }

                    }
                },

                // Calculate completion percentage
                {
                    $addFields: {

                        completionPercentage: {

                            $cond: [

                                {
                                    $gt: [
                                        "$enrolledStudents",
                                        0
                                    ]
                                },

                                {
                                    $round: [

                                        {
                                            $multiply: [

                                                {
                                                    $divide: [

                                                        "$completedStudents",

                                                        "$enrolledStudents"

                                                    ]
                                                },

                                                100

                                            ]
                                        },

                                        0

                                    ]
                                },

                                0

                            ]

                        }

                    }
                },

                // Most enrolled first
                {
                    $sort: {
                        enrolledStudents: -1
                    }
                },

                // Keep top 5
                {
                    $limit: 5
                }

            ]);

        // ==========================================
        // STUDENT LEARNING ENGAGEMENT ANALYTICS
        // ==========================================

        const approvedEnrollmentCount =
            await Enrollment.countDocuments({
                status: "approved"
            });


        // ==========================================
        // COMPLETED COURSES
        // ==========================================

        const completedLearning =
            await Progress.countDocuments({
                completed: true
            });


        // ==========================================
        // IN-PROGRESS STUDENTS
        // ==========================================

        const inProgressLearning =
            await Progress.countDocuments({

                completed: false,

                progress: {
                    $gt: 0,
                    $lt: 100
                }

            });


        // ==========================================
        // NOT STARTED
        // ==========================================

        const startedLearning =
            await Progress.countDocuments({

                progress: {
                    $gt: 0
                }

            });


        const notStartedLearning =
            Math.max(
                0,
                approvedEnrollmentCount -
                startedLearning
            );


        // ==========================================
        // AVERAGE PROGRESS
        // ==========================================

        const progressStats =
            await Progress.aggregate([

                {
                    $group: {

                        _id: null,

                        averageProgress: {
                            $avg: "$progress"
                        }

                    }

                }

            ]);


        const averageLearningProgress =
            progressStats.length > 0
                ? Math.round(
                    progressStats[0].averageProgress || 0
                )
                : 0;


        // ==========================================
        // DEBUG
        // ==========================================

        if (process.env.NODE_ENV !== "production") {
            console.log("STUDENT LEARNING ANALYTICS", {
                approvedEnrollments: approvedEnrollmentCount,
                notStarted: notStartedLearning,
                inProgress: inProgressLearning,
                completed: completedLearning,
                averageProgress: averageLearningProgress + "%"
            });
        }

        // ==========================================
        // DEBUG
        // ==========================================

        if (process.env.NODE_ENV !== "production") {
            console.log("ADMIN DASHBOARD", {
                totalCourses,
                totalStudents,
                totalMessages,
                totalEnrollments,
                pendingEnrollments,
                approvedEnrollments,
                rejectedEnrollments,
                completedCourses,
                certificatesIssued,
                topCourses: topCourses.length,
                recentEnrollments: recentEnrollments.length,
                recentStudents: recentStudents.length,
                recentCertificates: recentCertificates.length,
                recentMessages: recentMessages.length,
                coursePerformance: coursePerformance.length
            });
        }



        // ==========================================
        // RENDER DASHBOARD
        // ==========================================

        res.render("admin/dashboard", {

            user: req.session.user,


            // Existing cards

            totalCourses,

            totalStudents,

            totalMessages,

            totalEnrollments,


            // New analytics

            pendingEnrollments,
            approvedEnrollments,
            rejectedEnrollments,
            completedCourses,
            certificatesIssued,
            recentMessages,
            recentLogins,
            platformHealth,
            coursePerformance,


            // Dashboard sections

            topCourses,

            recentEnrollments,

            recentStudents,

            recentCertificates,


            approvedEnrollmentCount,
            notStartedLearning,
            inProgressLearning,
            completedLearning,
            averageLearningProgress,

        });


    } catch (error) {

        console.error(
            "ADMIN DASHBOARD ERROR:"
        );

        console.error(error);


        res.status(500).send(
            "Unable to load admin dashboard."
        );

    }

};


// ==========================================
// LOGIN ACTIVITY
// ==========================================

exports.loginActivity = async (req, res) => {

    try {

        const now = new Date();
        const defaultStart = new Date(now);
        defaultStart.setDate(defaultStart.getDate() - 30);

        const from = req.query.from
            ? new Date(`${req.query.from}T00:00:00`)
            : defaultStart;

        const to = req.query.to
            ? new Date(`${req.query.to}T23:59:59.999`)
            : now;

        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
            return res.status(400).send("Invalid date filter.");
        }

        const search = String(req.query.search || "")
            .trim()
            .slice(0, 100);
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const pageSize = 10;
        const role = ["user", "admin"].includes(req.query.role)
            ? req.query.role
            : "all";

        const query = {
            loggedInAt: {
                $gte: from,
                $lte: to
            }
        };

        if (role !== "all") {
            query.role = role;
        }

        if (search) {
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );
            query.$or = [
                { email: { $regex: escapedSearch, $options: "i" } },
                { ipAddress: { $regex: escapedSearch, $options: "i" } }
            ];
        }

        const registrationQuery = {
            role: "user",
            createdAt: {
                $gte: from,
                $lte: to
            }
        };

        if (search) {
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );
            registrationQuery.$or = [
                { email: { $regex: escapedSearch, $options: "i" } },
                { firstName: { $regex: escapedSearch, $options: "i" } },
                { lastName: { $regex: escapedSearch, $options: "i" } }
            ];
        }

        const visitQuery = {
            visitedAt: {
                $gte: from,
                $lte: to
            }
        };

        const [
            activities,
            totalLogins,
            userLogins,
            adminLogins,
            recentLogins,
            registrations,
            registrationCount,
            totalVisits,
            uniqueVisitors,
            recentVisitors
        ] =
            await Promise.all([
                LoginActivity.find(query)
                    .populate("user", "firstName lastName email role")
                    .sort({ loggedInAt: -1 })
                    .skip((page - 1) * pageSize)
                    .limit(pageSize)
                    .lean(),
                LoginActivity.countDocuments(query),
                LoginActivity.countDocuments({ ...query, role: "user" }),
                LoginActivity.countDocuments({ ...query, role: "admin" }),
                LoginActivity.find({ loggedInAt: { $gte: defaultStart, $lte: now } })
                    .sort({ loggedInAt: -1 })
                    .limit(5)
                    .populate("user", "firstName lastName email role")
                    .lean(),
                User.find(registrationQuery)
                    .select("firstName lastName email createdAt")
                    .sort({ createdAt: -1 })
                    .limit(pageSize)
                    .lean(),
                User.countDocuments(registrationQuery),
                VisitActivity.countDocuments(visitQuery),
                VisitActivity.aggregate([
                    { $match: visitQuery },
                    { $group: { _id: "$visitorId" } },
                    { $count: "total" }
                ]),
                VisitActivity.find(visitQuery)
                    .populate("user", "firstName lastName email")
                    .sort({ visitedAt: -1 })
                    .limit(10)
                    .lean()
            ]);

        return res.render("admin/loginActivity", {
            user: req.session.user,
            currentPage: "login-activity",
            activities,
            recentLogins,
            totalLogins,
            userLogins,
            adminLogins,
            registrations,
            registrationCount,
            totalVisits,
            uniqueVisitors: uniqueVisitors[0]?.total || 0,
            recentVisitors,
            loginPage: page,
            loginPageCount: Math.max(1, Math.ceil(totalLogins / pageSize)),
            filters: {
                search,
                role,
                from: req.query.from || defaultStart.toISOString().slice(0, 10),
                to: req.query.to || now.toISOString().slice(0, 10)
            }
        });

    } catch (error) {
        console.error("LOGIN ACTIVITY ERROR:", error);
        return res.status(500).send("Unable to load login activity.");
    }

};

// ==========================================
// VISITOR ACTIVITY
// ==========================================

exports.visitors = async (req, res) => {
    try {
        const now = new Date();
        const defaultStart = new Date(now);
        defaultStart.setDate(defaultStart.getDate() - 30);
        const from = req.query.from ? new Date(`${req.query.from}T00:00:00`) : defaultStart;
        const to = req.query.to ? new Date(`${req.query.to}T23:59:59.999`) : now;
        const search = String(req.query.search || "").trim().slice(0, 100);
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const pageSize = 10;

        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
            return res.status(400).send("Invalid date filter.");
        }

        const query = { visitedAt: { $gte: from, $lte: to } };
        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const matchingUsers = await User.find({
                $or: [
                    { firstName: { $regex: escapedSearch, $options: "i" } },
                    { lastName: { $regex: escapedSearch, $options: "i" } },
                    { email: { $regex: escapedSearch, $options: "i" } }
                ]
            }).select("_id").lean();

            query.$or = [
                { visitorId: { $regex: escapedSearch, $options: "i" } },
                { ipAddress: { $regex: escapedSearch, $options: "i" } },
                { path: { $regex: escapedSearch, $options: "i" } },
                { deviceName: { $regex: escapedSearch, $options: "i" } },
                { browser: { $regex: escapedSearch, $options: "i" } },
                { operatingSystem: { $regex: escapedSearch, $options: "i" } },
                { user: { $in: matchingUsers.map(matchingUser => matchingUser._id) } }
            ];
        }

        const [visitors, totalVisitors, uniqueVisitors] = await Promise.all([
            VisitActivity.find(query)
                .populate("user", "firstName lastName email")
                .sort({ visitedAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .lean(),
            VisitActivity.countDocuments(query),
            VisitActivity.aggregate([
                { $match: query },
                { $group: { _id: "$visitorId" } },
                { $count: "total" }
            ])
        ]);

        return res.render("admin/visitors", {
            user: req.session.user,
            currentPage: "visitors",
            visitors,
            totalVisitors,
            uniqueVisitors: uniqueVisitors[0]?.total || 0,
            page,
            pageCount: Math.max(1, Math.ceil(totalVisitors / pageSize)),
            filters: {
                search,
                from: req.query.from || defaultStart.toISOString().slice(0, 10),
                to: req.query.to || now.toISOString().slice(0, 10)
            }
        });
    } catch (error) {
        console.error("VISITOR ACTIVITY ERROR:", error);
        return res.status(500).send("Unable to load visitor activity.");
    }
};


// ==========================================
// REGISTRATION ACTIVITY
// ==========================================

exports.registrations = async (req, res) => {

    try {

        const now = new Date();
        const defaultStart = new Date(now);
        defaultStart.setDate(defaultStart.getDate() - 30);

        const from = req.query.from
            ? new Date(`${req.query.from}T00:00:00`)
            : defaultStart;

        const to = req.query.to
            ? new Date(`${req.query.to}T23:59:59.999`)
            : now;

        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
            return res.status(400).send("Invalid date filter.");
        }

        const search = String(req.query.search || "")
            .trim()
            .slice(0, 100);

        const query = {
            role: "user",
            createdAt: {
                $gte: from,
                $lte: to
            }
        };

        if (search) {
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );
            query.$or = [
                { email: { $regex: escapedSearch, $options: "i" } },
                { firstName: { $regex: escapedSearch, $options: "i" } },
                { lastName: { $regex: escapedSearch, $options: "i" } }
            ];
        }

        const [registrations, registrationCount] = await Promise.all([
            User.find(query)
                .select("firstName lastName email gender dob isActive createdAt")
                .sort({ createdAt: -1 })
                .limit(200)
                .lean(),
            User.countDocuments(query)
        ]);

        return res.render("admin/registrations", {
            user: req.session.user,
            currentPage: "registrations",
            registrations,
            registrationCount,
            filters: {
                search,
                from: req.query.from || defaultStart.toISOString().slice(0, 10),
                to: req.query.to || now.toISOString().slice(0, 10)
            }
        });

    } catch (error) {
        console.error("REGISTRATION ACTIVITY ERROR:", error);
        return res.status(500).send("Unable to load registrations.");
    }

};


// ==========================================
// ADMIN PROFILE
// ==========================================

exports.profile = (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "admin") {
        return res.redirect("/dashboard");
    }

    res.render("admin/profile", {
        user: req.session.user,
        currentPage: "profile"
    });

};


// ==========================================
// UPDATE ADMIN PROFILE
// ==========================================

exports.updateProfile = async (req, res) => {

    try {

        // ==========================================
        // CHECK SESSION
        // ==========================================

        if (
            !req.session ||
            !req.session.user
        ) {

            return res.redirect("/login");

        }


        // ==========================================
        // CHECK ADMIN ROLE
        // ==========================================

        if (
            req.session.user.role !== "admin"
        ) {

            return res.redirect("/dashboard");

        }


        const adminId =
            req.session.user._id;


        // ==========================================
        // VALIDATE ADMIN ID
        // ==========================================

        if (
            !adminId ||
            !require("mongoose")
                .Types
                .ObjectId
                .isValid(adminId)
        ) {

            req.session.destroy(() => {});

            return res.redirect("/login");

        }


        // ==========================================
        // GET ADMIN FROM DATABASE
        // ==========================================

        const admin =
            await User.findOne({

                _id: adminId,

                role: "admin",

                isActive: true

            });


        if (!admin) {

            req.session.destroy(() => {});

            return res.redirect(
                "/login?error=unauthorized"
            );

        }


        // ==========================================
        // NORMALIZE INPUT
        // ==========================================

        const firstName =
            req.body.firstName
                ? req.body.firstName.trim()
                : "";

        const lastName =
            req.body.lastName
                ? req.body.lastName.trim()
                : "";

        const email =
            req.body.email
                ? req.body.email
                    .trim()
                    .toLowerCase()
                : "";


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !firstName ||
            !lastName ||
            !email
        ) {

            return res.status(400).send(
                "First name, last name and email are required."
            );

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(email)
        ) {

            return res.status(400).send(
                "Please enter a valid email address."
            );

        }


        // ==========================================
        // CHECK DUPLICATE EMAIL
        // ==========================================

        const existingUser =
            await User.findOne({

                email,

                _id: {
                    $ne: adminId
                }

            });


        if (existingUser) {

            return res.status(400).send(
                "This email address is already registered."
            );

        }


        // ==========================================
        // UPDATE ADMIN
        // ==========================================

        admin.firstName =
            firstName;

        admin.lastName =
            lastName;

        admin.email =
            email;


        // ==========================================
        // UPDATE PROFILE IMAGE
        // ==========================================

        if (req.file) {

            admin.profileImage =
                req.file.filename;

        }


        await admin.save();


        // ==========================================
        // UPDATE SESSION
        // ==========================================

        req.session.user.firstName =
            admin.firstName;

        req.session.user.lastName =
            admin.lastName;

        req.session.user.email =
            admin.email;

        req.session.user.profileImage =
            admin.profileImage || "";


        // ==========================================
        // SAVE SESSION
        // ==========================================

        req.session.save(
            (err) => {

                if (err) {

                    console.error(
                        "ADMIN PROFILE SESSION ERROR:",
                        err
                    );

                    return res.status(500).send(
                        "Profile updated but session could not be saved."
                    );

                }


                return res.redirect(
                    "/admin/profile"
                );

            }
        );


    } catch (error) {

        console.error(
            "ADMIN PROFILE UPDATE ERROR:",
            error
        );


        // Duplicate MongoDB unique-index error

        if (
            error &&
            error.code === 11000
        ) {

            return res.status(400).send(
                "This email address is already registered."
            );

        }


        return res.status(500).send(
            "Unable to update profile."
        );

    }

};

// ==========================================
// ADD COURSE PAGE
// ==========================================

exports.showAddCourse = (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "admin") {
        return res.redirect("/dashboard");
    }

    res.render("admin/addCourse", {
        user: req.session.user,
        currentPage: "add-course"
    });

};

// ==========================================
// ADMIN - STUDENTS
// ==========================================

exports.students = async (req, res) => {

    try {

        const User = require("../models/User");

        /*
        |------------------------------------------
        | Search
        |------------------------------------------
        */

        const search = req.query.search
            ? req.query.search.trim().slice(0, 100)
            : "";

        /*
        |------------------------------------------
        | Status Filter
        |------------------------------------------
        */

        const status = req.query.status || "all";


        /*
        |------------------------------------------
        | Build Query
        |------------------------------------------
        */

        let query = {
            role: "user"
        };


        // Search by name or email

        if (search) {

            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            query.$or = [

                {
                    firstName: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                },

                {
                    lastName: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                },

                {
                    email: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                }

            ];

        }


        // Status filter

        if (status === "active") {

            query.isActive = true;

        }

        if (status === "inactive") {

            query.isActive = false;

        }


        /*
        |------------------------------------------
        | Get Students
        |------------------------------------------
        */

        const students = await User
            .find(query)
            .select("-password")
            .sort({
                createdAt: -1
            });


        /*
        |------------------------------------------
        | Statistics
        |------------------------------------------
        */

        const totalStudents = await User.countDocuments({
            role: "user"
        });


        const activeStudents = await User.countDocuments({
            role: "user",
            isActive: true
        });


        const inactiveStudents = await User.countDocuments({
            role: "user",
            isActive: false
        });


        /*
        |------------------------------------------
        | Recently Registered
        |------------------------------------------
        */

        const recentStudents = await User.countDocuments({
            role: "user",
            createdAt: {
                $gte: new Date(
                    Date.now() - 30 * 24 * 60 * 60 * 1000
                )
            }
        });


        /*
        |------------------------------------------
        | Render
        |------------------------------------------
        */

        res.render("admin/students", {

            user: req.session.user,

            students,

            totalStudents,

            activeStudents,

            inactiveStudents,

            recentStudents,

            search,

            status,

            currentPage: "students"

        });


    } catch (error) {

        console.error(
            "ADMIN STUDENTS ERROR:",
            error
        );

        res.status(500).send(
            "Unable to load students."
        );

    }

};

// ==========================================
// ADMIN - TOGGLE STUDENT STATUS
// ==========================================

// ==========================================
// ADMIN - TOGGLE STUDENT STATUS
// ==========================================

exports.toggleStudentStatus = async (req, res) => {

    try {

        const studentId =
            req.params.id;


        // ==========================================
        // VALIDATE ID
        // ==========================================

        if (!isValidObjectId(studentId)) {

            return res.status(400).send(
                "Invalid student ID."
            );

        }


        // ==========================================
        // FIND ONLY NORMAL USER
        // ==========================================

        const student =
            await User.findOne({

                _id: studentId,

                role: "user"

            });


        if (!student) {

            return res.status(404).send(
                "Student not found."
            );

        }


        // ==========================================
        // TOGGLE STATUS
        // ==========================================

        student.isActive =
            !student.isActive;


        await student.save();


        return res.redirect(
            "/admin/students"
        );


    } catch (error) {

        console.error(
            "STUDENT STATUS ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to change student status."
        );

    }

};
// ==========================================
// ADMIN - ALL ENROLLMENTS
// ==========================================

exports.enrollments = async (req, res) => {

    try {

        const enrollments = await Enrollment.find()
            .populate("student", "firstName lastName email profileImage")
            .populate(
                "course",
                "title instructor price category level"
            )
            .sort({ createdAt: -1 });

        res.render("admin/enrollments", {
            user: req.session.user,
            enrollments,
            currentPage: "enrollments"
        });

    } catch (error) {

        console.error("ENROLLMENT PAGE ERROR:");
        console.error(error);

        res.status(500).send(
            "Unable to load enrollments."
        );

    }

};

// ==========================================
// ADMIN - LEARNING ACTIVITY
// ==========================================

exports.learningActivity = async (req, res) => {

    try {

        const search = String(req.query.search || "")
            .trim()
            .slice(0, 100);
        const status = ["all", "pending", "approved", "rejected"]
            .includes(req.query.status)
            ? req.query.status
            : "all";
        const progressState = ["all", "not-started", "in-progress", "completed"]
            .includes(req.query.progress)
            ? req.query.progress
            : "all";

        const query = {};

        if (status !== "all") {
            query.status = status;
        }

        if (search) {
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );
            const [students, courses] = await Promise.all([
                User.find({
                    role: "user",
                    $or: [
                        { firstName: { $regex: escapedSearch, $options: "i" } },
                        { lastName: { $regex: escapedSearch, $options: "i" } },
                        { email: { $regex: escapedSearch, $options: "i" } }
                    ]
                }).select("_id").lean(),
                Course.find({
                    title: { $regex: escapedSearch, $options: "i" }
                }).select("_id").lean()
            ]);

            query.$or = [
                { student: { $in: students.map(student => student._id) } },
                { course: { $in: courses.map(course => course._id) } }
            ];
        }

        const enrollments = await Enrollment.find(query)
            .populate("student", "firstName lastName email profileImage")
            .populate("course", "title instructor category")
            .sort({ updatedAt: -1 })
            .limit(500)
            .lean();

        const progressRecords = await Progress.find({
            $or: enrollments.map(enrollment => ({
                user: enrollment.student?._id,
                course: enrollment.course?._id
            }))
        }).lean();

        const progressMap = new Map(
            progressRecords.map(progress => [
                `${progress.user}:${progress.course}`,
                progress
            ])
        );

        const activity = enrollments
            .map(enrollment => {
                const progress = progressMap.get(
                    `${enrollment.student?._id}:${enrollment.course?._id}`
                ) || {
                    progress: 0,
                    completed: false,
                    lastAccessedAt: null,
                    completedMaterials: []
                };

                return {
                    ...enrollment,
                    learningProgress: progress
                };
            })
            .filter(enrollment => {
                const progress = enrollment.learningProgress;
                if (progressState === "completed") return progress.completed || progress.progress >= 100;
                if (progressState === "in-progress") return !progress.completed && progress.progress > 0 && progress.progress < 100;
                if (progressState === "not-started") return !progress.completed && progress.progress === 0;
                return true;
            });

        const counts = {
            total: activity.length,
            completed: activity.filter(item => item.learningProgress.completed || item.learningProgress.progress >= 100).length,
            inProgress: activity.filter(item => !item.learningProgress.completed && item.learningProgress.progress > 0 && item.learningProgress.progress < 100).length,
            notStarted: activity.filter(item => !item.learningProgress.completed && item.learningProgress.progress === 0).length
        };

        return res.render("admin/learningActivity", {
            user: req.session.user,
            currentPage: "learning-activity",
            activity,
            counts,
            filters: {
                search,
                status,
                progress: progressState
            }
        });

    } catch (error) {
        console.error("LEARNING ACTIVITY ERROR:", error);
        return res.status(500).send("Unable to load learning activity.");
    }

};

// ==========================================
// APPROVE ENROLLMENT
// ==========================================

// ==========================================
// APPROVE ENROLLMENT
// ==========================================

exports.approveEnrollment = async (
    req,
    res
) => {

    try {

        const enrollmentId =
            req.params.id;


        // ==========================================
        // VALIDATE ID
        // ==========================================

        if (!isValidObjectId(enrollmentId)) {

            return res.status(400).send(
                "Invalid enrollment ID."
            );

        }


        const enrollment =
            await Enrollment.findById(
                enrollmentId
            );


        if (!enrollment) {

            return res.status(404).send(
                "Enrollment not found."
            );

        }


        // ==========================================
        // ONLY APPROVE PENDING ENROLLMENTS
        // ==========================================

        if (
            enrollment.status !== "pending"
        ) {

            return res.status(400).send(
                "Only pending enrollments can be approved."
            );

        }


        enrollment.status =
            "approved";


        await enrollment.save();

        const enrollmentDetails =
            await Enrollment.findById(enrollment._id)
                .populate("student", "firstName lastName email")
                .populate("course", "title instructor duration")
                .lean();

        const student = enrollmentDetails?.student;
        const course = enrollmentDetails?.course;

        if (student?.email && course?.title) {

            try {

                const transporter =
                    nodemailer.createTransport({
                        host: process.env.MAIL_HOST,
                        port: Number(process.env.MAIL_PORT || 587),
                        secure: process.env.MAIL_SECURE === "true",
                        auth: {
                            user: process.env.MAIL_USER,
                            pass: process.env.MAIL_PASS
                        }
                    });

                const dashboardLink =
                    `${getAppUrl()}/dashboard`;

                await transporter.sendMail({
                    from:
                        process.env.MAIL_FROM ||
                        process.env.MAIL_USER,
                    to: student.email,
                    subject: `Enrollment approved: ${course.title}`,
                    text:
                        `Hello ${student.firstName || "Student"},\n\n` +
                        `Your enrollment request for "${course.title}" has been approved. ` +
                        `You can now access the course from your dashboard:\n${dashboardLink}\n\n` +
                        "Regards,\nTechNova"
                });

            } catch (mailError) {

                console.error(
                    "ENROLLMENT APPROVAL EMAIL ERROR:",
                    mailError
                );

            }

        }


        console.log(
            "ENROLLMENT APPROVED:",
            enrollment._id
        );


        return res.redirect(
            "/admin/enrollments"
        );


    } catch (error) {

        console.error(
            "APPROVE ENROLLMENT ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to approve enrollment."
        );

    }

};

// ==========================================
// REJECT ENROLLMENT
// ==========================================

// ==========================================
// REJECT ENROLLMENT
// ==========================================

exports.rejectEnrollment = async (
    req,
    res
) => {

    try {

        const enrollmentId =
            req.params.id;


        // ==========================================
        // VALIDATE ID
        // ==========================================

        if (!isValidObjectId(enrollmentId)) {

            return res.status(400).send(
                "Invalid enrollment ID."
            );

        }


        const enrollment =
            await Enrollment.findById(
                enrollmentId
            );


        if (!enrollment) {

            return res.status(404).send(
                "Enrollment not found."
            );

        }


        // ==========================================
        // ONLY REJECT PENDING ENROLLMENTS
        // ==========================================

        if (
            enrollment.status !== "pending"
        ) {

            return res.status(400).send(
                "Only pending enrollments can be rejected."
            );

        }


        enrollment.status =
            "rejected";


        await enrollment.save();


        console.log(
            "ENROLLMENT REJECTED:",
            enrollment._id
        );


        return res.redirect(
            "/admin/enrollments"
        );


    } catch (error) {

        console.error(
            "REJECT ENROLLMENT ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to reject enrollment."
        );

    }

};
// ==========================================
// DELETE ENROLLMENT
// ==========================================

// ==========================================
// DELETE ENROLLMENT
// ==========================================

exports.deleteEnrollment = async (
    req,
    res
) => {

    try {

        const enrollmentId =
            req.params.id;


        // ==========================================
        // VALIDATE ID
        // ==========================================

        if (!isValidObjectId(enrollmentId)) {

            return res.status(400).send(
                "Invalid enrollment ID."
            );

        }


        const enrollment =
            await Enrollment.findById(
                enrollmentId
            );


        if (!enrollment) {

            return res.status(404).send(
                "Enrollment not found."
            );

        }


        // ==========================================
        // DELETE ENROLLMENT
        // ==========================================

        await Enrollment.findByIdAndDelete(
            enrollmentId
        );

        await Progress.deleteOne({
            user: enrollment.student,
            course: enrollment.course
        });


        return res.redirect(
            "/admin/enrollments"
        );


    } catch (error) {

        console.error(
            "DELETE ENROLLMENT ERROR:",
            error
        );

        return res.status(500).send(
            "Unable to delete enrollment."
        );

    }

};


// ==========================================
// ADMIN - HELP & SYSTEM INFORMATION
// ==========================================

exports.help = (req, res) => {

    try {

        if (!req.session.user) {

            return res.redirect("/login");

        }

        if (req.session.user.role !== "admin") {

            return res.redirect("/dashboard");

        }

        res.render("admin/help", {

            user: req.session.user,

            currentPage: "help"

        });

    } catch (error) {

        console.error(
            "ADMIN HELP ERROR:",
            error
        );

        res.status(500).send(
            "Unable to load admin help page."
        );

    }

};
