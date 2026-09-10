const User = require("../models/User");
const Course = require("../models/Course");
const Certificate = require("../models/Certificate");
const Blog = require("../models/Blog");
const Portfolio = require("../models/Portfolio");


// ==========================================
// HOME PAGE
// ==========================================

exports.home = async (req, res) => {

    try {

        // ==========================================
        // PLATFORM STATISTICS
        // ==========================================

        const totalStudents =
            await User.countDocuments({
                role: "user"
            });


        const totalCourses =
            await Course.countDocuments();


        const totalCertificates =
            await Certificate.countDocuments();


        const instructors =
            await Course.distinct(
                "instructor"
            );


        const totalInstructors =
            instructors.filter(
                instructor =>
                    instructor &&
                    instructor.trim() !== ""
            ).length;


        // ==========================================
        // FEATURED COURSES
        // ==========================================

        const featuredCourses =
            await Course
                .find()
                .sort({
                    createdAt: -1
                })
                .limit(3)
                .lean();


        // ==========================================
        // FEATURED PROJECTS
        // ==========================================

        const featuredProjects =
            await Portfolio
                .find({
                    isPublished: true
                })
                .sort({
                    isFeatured: -1,
                    order: 1,
                    createdAt: -1
                })
                .limit(3)
                .lean();


        // ==========================================
        // LATEST BLOGS
        // ==========================================

        const latestBlogs =
            await Blog
                .find({
                    isPublished: true
                })
                .sort({
                    createdAt: -1
                })
                .limit(3)
                .lean();


        // ==========================================
        // DEBUG
        // ==========================================

        console.log("================================");
        console.log("TECHNOVA HOME PAGE");
        console.log("STUDENTS:", totalStudents);
        console.log("INSTRUCTORS:", totalInstructors);
        console.log("COURSES:", totalCourses);
        console.log("CERTIFICATES:", totalCertificates);
        console.log(
            "FEATURED COURSES:",
            featuredCourses.length
        );
        console.log(
            "FEATURED PROJECTS:",
            featuredProjects.length
        );
        console.log(
            "LATEST BLOGS:",
            latestBlogs.length
        );
        console.log("================================");


        // ==========================================
        // RENDER
        // ==========================================

        res.render("index", {

            user:
                req.session.user || null,

            totalStudents,

            totalInstructors,

            totalCourses,

            totalCertificates,

            featuredCourses,

            featuredProjects,

            latestBlogs

        });


    } catch (error) {

        console.error(
            "HOME PAGE ERROR:",
            error
        );


        res.status(500).send(
            "Unable to load TechNova home page."
        );

    }

};