const mongoose = require("mongoose");

const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Contact = require("../models/Contact");
const Blog = require("../models/Blog");
const Progress = require("../models/Progress");
const Certificate = require("../models/Certificate");

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
            ? req.query.search.trim()
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

            query.$or = [

                {
                    firstName: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    lastName: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    email: {
                        $regex: search,
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
