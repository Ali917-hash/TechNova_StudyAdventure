const Course = require("../models/Course");
const User = require("../models/User");
const Certificate = require("../models/Certificate");
const Portfolio = require("../models/Portfolio");
const Progress = require("../models/Progress");


// ==========================================
// SERVICES PAGE
// ==========================================

exports.services = async (req, res) => {

    try {

        console.log("================================");
        console.log("SERVICES CONTROLLER CALLED");
        console.log("================================");


        // ==========================================
        // COURSES
        // ==========================================

        const courses = await Course
            .find()
            .sort({
                createdAt: -1
            })
            .lean();


        // ==========================================
        // STATISTICS
        // ==========================================

        const totalCourses =
            await Course.countDocuments();


        const totalStudents =
            await User.countDocuments({
                role: "user"
            });


        const totalProjects =
            await Portfolio.countDocuments({
                isPublished: true
            });


        const totalCertificates =
            await Certificate.countDocuments();


        // ==========================================
        // DEBUG
        // ==========================================

        console.log("COURSES:", totalCourses);
        console.log("STUDENTS:", totalStudents);
        console.log("PROJECTS:", totalProjects);
        console.log("CERTIFICATES:", totalCertificates);


        // ==========================================
        // RENDER
        // ==========================================

        return res.render(
            "services",
            {

                user:
                    req.session.user || null,

                courses,

                totalCourses,

                totalStudents,

                totalProjects,

                totalCertificates

            }
        );


    } catch (error) {

        console.error(
            "SERVICES CONTROLLER ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to load services page."
        );

    }

};