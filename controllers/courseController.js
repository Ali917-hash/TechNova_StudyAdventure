const mongoose = require("mongoose");

const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// ==========================================
// VALIDATE MONGODB OBJECT ID
// ==========================================

function isValidObjectId(id) {

    return mongoose.Types.ObjectId.isValid(id);

}


// Show Add Course Page

exports.showAddCourse = (req, res) => {

    res.render("admin/addCourse", {

        user: req.session.user

    });

};


// ==========================================
// PUBLIC COURSES PAGE
// ==========================================

exports.showCourses = async (req, res) => {

    try {

        const courses =
            await Course.find()
                .sort({ createdAt: -1 });


        res.render("services", {

            courses,

            user:
                req.session.user || null

        });


    } catch (err) {

        console.error(
            "SHOW COURSES ERROR:"
        );

        console.error(err);


        res.status(500).send(
            "Unable to load courses."
        );

    }

};


// ==========================================
// COURSE DETAILS
// ==========================================

exports.courseDetails = async (req, res) => {

    try {

        const course =
            await Course.findById(
                req.params.id
            );


        if (!course) {

            return res.status(404).send(
                "Course not found"
            );

        }


        let enrollment = null;

        if (req.session.user) {
            enrollment = await Enrollment.findOne({
                student: req.session.user._id,
                course: course._id
            }).lean();
        }

        const enrollmentMessage =
            req.query.enrollment === "pending"
                ? "Your enrollment request is pending admin approval. We will notify you when your access is approved."
                : req.query.enrollment === "already"
                    ? "You have already requested this course. Your current enrollment is pending approval."
                    : "";

        res.render(
            "courseDetails",
            {

                course,

                user:
                    req.session.user || null,

                enrollment,

                enrollmentMessage

            }
        );


    } catch (err) {

        console.error(
            "COURSE DETAILS ERROR:"
        );

        console.error(err);


        res.status(500).send(
            "Unable to load course details."
        );

    }

};


exports.enrollCourse = async (req, res) => {

    try {

        // Check login

        if (!req.session.user) {

            return res.redirect(
                "/login"
            );

        }


        const studentId =
            req.session.user._id;

        const courseId =
            req.params.id;


        // Check course

        const course =
            await Course.findById(
                courseId
            );


        if (!course) {

            return res.send(
                "Course not found"
            );

        }


        // Check existing enrollment

        const existingEnrollment =
            await Enrollment.findOne({

                student: studentId,

                course: courseId

            });


        if (existingEnrollment) {

            return res.send(
                `You have already enrolled in this course. Current status: ${existingEnrollment.status}`
            );

        }


        // Create enrollment

        await Enrollment.create({

            student: studentId,

            course: courseId,

            status: "pending",

            progress: 0,

            learningHours: 0,

            certificateIssued: false

        });


        console.log(
            "================================"
        );

        console.log(
            "ENROLLMENT CREATED"
        );

        console.log(
            "STUDENT:",
            studentId
        );

        console.log(
            "COURSE:",
            courseId
        );

        console.log(
            "STATUS: pending"
        );

        console.log(
            "================================"
        );


        res.redirect(
            "/dashboard"
        );


    } catch (err) {

        console.error(
            "ENROLLMENT ERROR:"
        );

        console.error(err);


        res.status(500).send(
            "Enrollment failed: " +
            err.message
        );

    }

};


// ==========================================
// ADD COURSE
// ==========================================

exports.addCourse = async (req, res) => {

    try {

        // ==========================================
        // COURSE THUMBNAIL
        // ==========================================

        const imageFile =
            req.files &&
            req.files.image &&
            req.files.image[0]
                ? req.files.image[0]
                : null;


        // ==========================================
        // COURSE MATERIAL FILES
        // ==========================================

        const contentFiles =
            req.files &&
            req.files.content
                ? req.files.content
                : [];


        // ==========================================
        // PREPARE COURSE DATA
        // ==========================================

        const courseData = {

            title:
                req.body.title,

            instructor:
                req.body.instructor,

            category:
                req.body.category,

            price:
                req.body.price || 0,

            duration:
                req.body.duration,

            level:
                req.body.level,

            description:
                req.body.description,

            image:
                imageFile
                    ? imageFile.filename
                    : "default-course.png",


            // ======================================
            // COURSE MATERIAL
            // ======================================

            contentFiles:
                contentFiles.map(file => ({

                    filename:
                        file.filename,

                    originalName:
                        file.originalname,

                    path:
                        file.path,

                    mimetype:
                        file.mimetype,

                    size:
                        file.size

                }))

        };


        // ==========================================
        // CREATE COURSE
        // ==========================================

        const course =
            await Course.create(
                courseData
            );


        // ==========================================
        // DEBUG
        // ==========================================

        console.log(
            "================================"
        );

        console.log(
            "COURSE CREATED SUCCESSFULLY"
        );

        console.log(
            "COURSE ID:",
            course._id
        );

        console.log(
            "TITLE:",
            course.title
        );

        console.log(
            "MATERIAL FILES:",
            contentFiles.length
        );

        console.log(
            "================================"
        );


        res.redirect(
            "/admin/courses"
        );


    } catch (err) {

        console.error(
            "COURSE ADD ERROR:"
        );

        console.error(err);


        res.status(500).send(
            "Unable to add course: " +
            err.message
        );

    }

};


// Show All Courses (Admin)

exports.adminCourses = async (req, res) => {

    try {

        const courses =
            await Course.find()
                .sort({
                    createdAt: -1
                });


        res.render(
            "admin/allCourses",
            {

                user:
                    req.session.user,

                courses

            }
        );


    } catch (err) {

        console.log(err);

        res.send(
            err.message
        );

    }

};


// Show Edit Course Page

exports.showEditCourse = async (req, res) => {

    try {

        const courseId = req.params.id;

        if (!isValidObjectId(courseId)) {

            return res.status(400).send(
                "Invalid course ID."
            );

        }

        const course =
            await Course.findById(courseId);

        if (!course) {

            return res.status(404).send(
                "Course not found."
            );

        }

        return res.render(
            "admin/editCourse",
            {

                user:
                    req.session.user,

                course,

                enrollment,

                enrollmentMessage

            }
        );

    } catch (err) {

        console.error(
            "EDIT COURSE ERROR:",
            err
        );

        return res.status(500).send(
            "Unable to open course."
        );

    }

};

// exports.showEditCourse = async (req, res) => {

//     try {

//         const course =
//             await Course.findById(
//                 req.params.id
//             );


//         if (!course) {

//             return res.send(
//                 "Course not found"
//             );

//         }


//         res.render(
//             "admin/editCourse",
//             {

//                 user:
//                     req.session.user,

//                 course

//             }
//         );


//     } catch (err) {

//         console.log(err);

//         res.send(
//             err.message
//         );

//     }

// };


// ==========================================
// UPDATE COURSE
// ==========================================

exports.updateCourse = async (req, res) => {

    try {

        const courseId =
            req.params.id;

        if (!isValidObjectId(courseId)) {

            return res.status(400).send(
                "Invalid course ID."
            );

        }


        // ==========================================
        // FIND EXISTING COURSE
        // ==========================================

        const course =
            await Course.findById(
                courseId
            );


        if (!course) {

            return res.status(404).send(
                "Course not found."
            );

        }


        // ==========================================
        // UPDATE COURSE INFORMATION
        // ==========================================

        course.title =
            req.body.title;

        course.instructor =
            req.body.instructor;

        course.category =
            req.body.category;

        course.price =
            req.body.price;

        course.duration =
            req.body.duration;

        course.level =
            req.body.level;

        course.description =
            req.body.description;


        // ==========================================
        // UPDATE COURSE THUMBNAIL
        // ==========================================

        if (
            req.files &&
            req.files.image &&
            req.files.image[0]
        ) {

            course.image =
                req.files.image[0].filename;

        }


        // ==========================================
        // UPDATE COURSE LEARNING MATERIAL
        // ==========================================

        if (
            req.files &&
            req.files.content &&
            req.files.content.length > 0
        ) {

            course.contentFiles =
                req.files.content.map(
                    file => ({

                        filename:
                            file.filename,

                        originalName:
                            file.originalname,

                        path:
                            file.path,

                        mimetype:
                            file.mimetype,

                        size:
                            file.size

                    })
                );

        }


        // ==========================================
        // SAVE COURSE
        // ==========================================

        await course.save();


        // ==========================================
        // DEBUG
        // ==========================================

        console.log(
            "================================"
        );

        console.log(
            "COURSE UPDATED SUCCESSFULLY"
        );

        console.log(
            "COURSE ID:",
            course._id
        );

        console.log(
            "TITLE:",
            course.title
        );

        console.log(
            "INSTRUCTOR:",
            course.instructor
        );

        console.log(
            "CATEGORY:",
            course.category
        );

        console.log(
            "PRICE:",
            course.price
        );

        console.log(
            "IMAGE:",
            course.image
        );

        console.log(
            "MATERIAL FILES:",
            course.contentFiles.length
        );

        console.log(
            "================================"
        );


        // ==========================================
        // BACK TO ALL COURSES
        // ==========================================

        res.redirect(
            "/admin/courses"
        );


    } catch (err) {

        console.error(
            "COURSE UPDATE ERROR:",
            err
        );


        res.status(500).send(
            err.message
        );

    }

};


// Delete Course

// ==========================================
// DELETE COURSE
// ==========================================

exports.deleteCourse = async (
    req,
    res
    ) => {

    try {

        const courseId =
            req.params.id;


        if (!isValidObjectId(courseId)) {

            return res.status(400).send(
                "Invalid course ID."
            );

        }


        const course =
            await Course.findById(
                courseId
            );


        if (!course) {

            return res.status(404).send(
                "Course not found."
            );

        }


        await Course.findByIdAndDelete(
            courseId
        );


        return res.redirect(
            "/admin/courses"
        );

    } catch (error) {

        console.error(
            "DELETE COURSE ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to delete course."
        );

    }

};

// Public Courses Page

exports.showCourses = async (req, res) => {

    try {

        const courses =
            await Course.find()
                .sort({
                    createdAt: -1
                });


        res.render(
            "services",
            {

                courses,

                user:
                    req.session.user || null

            }
        );


    } catch (err) {

        console.log(err);

        res.status(500).send(
            err.message
        );

    }

};


// ==========================================
// USER - ALL AVAILABLE COURSES
// ==========================================

exports.userCourses = async (req, res) => {

    try {

        // Check login

        if (!req.session.user) {

            return res.redirect(
                "/login"
            );

        }


        // Get all courses

        const courses =
            await Course.find()
                .sort({
                    createdAt: -1
                });


        console.log(
            "USER COURSES FOUND:",
            courses.length
        );


        // Render user courses page

        res.render(
            "user/courses",
            {

                user:
                    req.session.user,

                courses

            }
        );


    } catch (err) {

        console.error(
            "USER COURSES ERROR:"
        );

        console.error(err);


        res.status(500).send(
            err.message
        );

    }

};