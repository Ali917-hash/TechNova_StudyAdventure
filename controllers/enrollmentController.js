const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");
const Course = require("../models/Course");


// ==========================================
// ENROLL STUDENT IN COURSE
// ==========================================

exports.enrollCourse = async (req, res) => {

    try {

        // ==========================================
        // CHECK LOGIN
        // ==========================================

        if (
            !req.session ||
            !req.session.user
        ) {

            return res.redirect("/login");

        }


        // ==========================================
        // GET LOGGED-IN STUDENT
        // ==========================================

        const studentId =
            req.session.user._id ||
            req.session.user.id;


        const courseId =
            req.params.id;


        // ==========================================
        // VALIDATE SESSION
        // ==========================================

        if (!studentId) {

            return res.status(401).send(
                "User session is invalid. Please login again."
            );

        }


        // ==========================================
        // VALIDATE COURSE ID
        // ==========================================

        if (!courseId) {

            return res.status(400).send(
                "Course ID is missing."
            );

        }


        if (
            !mongoose.Types.ObjectId.isValid(
                studentId
            )
        ) {

            return res.status(401).send(
                "Invalid user session. Please login again."
            );

        }


        if (
            !mongoose.Types.ObjectId.isValid(
                courseId
            )
        ) {

            return res.status(400).send(
                "Invalid course ID."
            );

        }


        // ==========================================
        // CHECK COURSE
        // ==========================================

        const course =
            await Course.findById(courseId).lean();


        if (!course) {

            return res.status(404).send(
                "Course not found."
            );

        }


        // ==========================================
        // CHECK EXISTING ENROLLMENT
        // ==========================================

        const existingEnrollment =
            await Enrollment.findOne({

                student: studentId,

                course: courseId

            });


        if (existingEnrollment) {

            return res.redirect(
                `/course/${courseId}?enrollment=${existingEnrollment.status === "approved" ? "approved" : "already"}`
            );

        }


        // ==========================================
        // CREATE ENROLLMENT
        // ==========================================

        const enrollment =
            await Enrollment.create({

                student: studentId,

                course: courseId,

                status: "pending"

            });


        if (process.env.NODE_ENV !== "production") {
            console.log("ENROLLMENT CREATED", {
                enrollmentId: enrollment._id.toString(),
                studentId,
                courseId,
                status: enrollment.status
            });
        }


        // ==========================================
        // CREATE INITIAL PROGRESS
        // ==========================================

        const existingProgress =
            await Progress.findOne({

                user: studentId,

                course: courseId

            });


        if (!existingProgress) {

            const progress =
                await Progress.create({

                    user: studentId,

                    course: courseId,

                    completedLessons: [],

                    progress: 0,

                    completed: false

                });


            console.log(
                "PROGRESS CREATED:",
                progress._id.toString()
            );

        }

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

            await transporter.sendMail({
                from:
                    process.env.MAIL_FROM ||
                    process.env.MAIL_USER,
                to: "technova.platform@gmail.com",
                subject: `New enrollment request: ${course.title}`,
                text:
                    "A new course enrollment request is waiting for approval.\n\n" +
                    `Student: ${req.session.user.email || "Unknown"}\n` +
                    `Course: ${course.title}\n` +
                    `Enrollment ID: ${enrollment._id}\n` +
                    `Requested at: ${new Date().toISOString()}\n\n` +
                    "Review it in the TechNova admin dashboard."
            });

        } catch (mailError) {

            console.error(
                "ENROLLMENT ADMIN NOTIFICATION ERROR:",
                mailError
            );

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.redirect(
            `/course/${courseId}?enrollment=pending`
        );


    } catch (error) {

        console.error(
            "================================"
        );

        console.error(
            "ENROLLMENT ERROR:"
        );

        console.error(
            error
        );

        console.error(
            "================================"
        );


        // Duplicate enrollment protection
        if (error.code === 11000) {

            return res.redirect(
                "/dashboard"
            );

        }


        return res.status(500).send(
            "Unable to enroll in this course."
        );

    }

};