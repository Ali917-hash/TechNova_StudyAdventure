const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const CourseLesson = require("../models/CourseLesson");
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");

// ==========================================
// COURSE LEARNING PAGE
// ==========================================

exports.learnCourse = async (req, res) => {

    try {

        // ==========================================
        // CHECK LOGIN
        // ==========================================

        if (!req.session.user) {

            return res.redirect("/login");

        }


        // ==========================================
        // USER + COURSE
        // ==========================================

        const studentId =
            req.session.user._id;

        const courseId =
            req.params.id;


        // ==========================================
        // CHECK COURSE
        // ==========================================

        const course =
            await Course.findById(courseId);

        if (!course) {

            return res.status(404).send(
                "Course not found."
            );

        }


        // ==========================================
        // CHECK APPROVED ENROLLMENT
        // ==========================================

        const enrollment =
            await Enrollment.findOne({

                student: studentId,

                course: courseId,

                status: "approved"

            });


        if (!enrollment) {

            return res.status(403).send(
                "You are not approved for this course."
            );

        }


        // ==========================================
        // GET COURSE LESSONS
        // ==========================================

        const lessons =
            await CourseLesson.find({

                course: courseId,

                isPublished: true

            })
            .sort({
                order: 1
            });


        // ==========================================
        // GET UPLOADED COURSE MATERIALS
        // ==========================================

        const materials =
            course.contentFiles || [];


        // ==========================================
        // GET STUDENT PROGRESS
        // ==========================================

        const progress =
            await Progress.findOne({

                user: studentId,

                course: courseId

            }).lean();


        // ==========================================
        // CURRENT MATERIAL
        // ==========================================

        const currentMaterial =
            progress &&
            progress.currentMaterial
                ? progress.currentMaterial
                : "";


        // ==========================================
        // COMPLETED MATERIALS
        // ==========================================

        const completedMaterials =
            progress &&
            Array.isArray(progress.completedMaterials)
                ? progress.completedMaterials
                : [];


        // ==========================================
        // COURSE PROGRESS
        // ==========================================

        const courseProgress =
            progress
                ? progress.progress
                : 0;


        // ==========================================
        // DEBUG
        // ==========================================

        if (process.env.NODE_ENV !== "production") {
            console.log("COURSE LEARNING PAGE", {
                studentId,
                courseId,
                materialCount: materials.length,
                currentMaterial: currentMaterial || "FIRST MATERIAL",
                completedMaterialCount: completedMaterials.length,
                progress: courseProgress + "%"
            });
        }


        // ==========================================
        // RENDER
        // ==========================================

        res.render("user/learnCourse", {

            user: req.session.user,

            course,

            enrollment,

            lessons,

            materials,

            currentMaterial,

            completedMaterials,

            courseProgress

        });


    } catch (error) {

        console.error(
            "LEARNING PAGE ERROR:",
            error
        );

        res.status(500).send(
            "Unable to load course learning page."
        );

    }

};

// ==========================================
// SECURE COURSE MATERIAL DELIVERY
// ==========================================

exports.getCourseMaterial = async (req,res) => {

    try {

        // ======================================
        // CHECK LOGIN
        // ======================================

        if (!req.session.user) {

            return res.status(401).send(
                "You must be logged in."
            );

        }


        const studentId =
            req.session.user._id;

        const courseId =
            req.params.courseId;

        const materialIndex =
            Number(req.params.materialIndex);


        // ======================================
        // VALIDATE COURSE ID
        // ======================================

        if (
            !mongoose.Types.ObjectId.isValid(
                courseId
            )
        ) {

            return res.status(400).send(
                "Invalid course ID."
            );

        }


        // ======================================
        // VALIDATE MATERIAL INDEX
        // ======================================

        if (
            !Number.isInteger(materialIndex) ||
            materialIndex < 0
        ) {

            return res.status(400).send(
                "Invalid material."
            );

        }


        // ======================================
        // CHECK APPROVED ENROLLMENT
        // ======================================

        const enrollment =
            await Enrollment.findOne({

                student: studentId,

                course: courseId,

                status: "approved"

            }).lean();


        if (!enrollment) {

            return res.status(403).send(
                "You are not approved for this course."
            );

        }


        // ======================================
        // GET COURSE
        // ======================================

        const course =
            await Course.findById(
                courseId
            ).lean();


        if (!course) {

            return res.status(404).send(
                "Course not found."
            );

        }


        const materials =
            Array.isArray(
                course.contentFiles
            )
                ? course.contentFiles
                : [];


        // ======================================
        // CHECK MATERIAL
        // ======================================

        if (
            materialIndex >=
            materials.length
        ) {

            return res.status(404).send(
                "Course material not found."
            );

        }


        const material =
            materials[materialIndex];


        if (
            !material ||
            !material.filename
        ) {

            return res.status(404).send(
                "Course material not found."
            );

        }


        // ======================================
        // BUILD SAFE FILE PATH
        // ======================================

        const materialDirectory = process.env.VERCEL
            ? path.join("/tmp", "uploads", "course-materials")
            : path.resolve(
                __dirname,
                "../public/uploads/course-materials"
            );

        const filePath =
            path.join(
                materialDirectory,
                material.filename
            );


        // Prevent path traversal
        if (
            !filePath.startsWith(
                materialDirectory +
                path.sep
            )
        ) {

            return res.status(403).send(
                "Invalid material path."
            );

        }


        // ======================================
        // CHECK FILE EXISTS
        // ======================================

        if (
            !fs.existsSync(
                filePath
            )
        ) {

            return res.status(404).send(
                "Material file not found."
            );

        }


        // ======================================
        // FILE INFORMATION
        // ======================================

        const stat =
            fs.statSync(filePath);

        const fileSize =
            stat.size;

        const contentType =
            material.mimetype ||
            "application/octet-stream";


        // ======================================
        // SUPPORT VIDEO RANGE REQUESTS
        // ======================================

        const range =
            req.headers.range;


        if (range) {

            const parts =
                range
                    .replace(
                        /bytes=/,
                        ""
                    )
                    .split("-");


            const start =
                parseInt(
                    parts[0],
                    10
                );


            const end =
                parts[1]
                    ? parseInt(
                        parts[1],
                        10
                    )
                    : fileSize - 1;


            if (
                isNaN(start) ||
                start < 0 ||
                start >= fileSize ||
                end < start
            ) {

                return res.status(416).send(
                    "Invalid range."
                );

            }


            const chunkSize =
                end - start + 1;


            res.status(206);


            res.set({

                "Content-Range":
                    `bytes ${start}-${end}/${fileSize}`,

                "Accept-Ranges":
                    "bytes",

                "Content-Length":
                    chunkSize,

                "Content-Type":
                    contentType

            });


            return fs
                .createReadStream(
                    filePath,
                    {
                        start,
                        end
                    }
                )
                .pipe(res);

        }


        // ======================================
        // NORMAL FILE RESPONSE
        // ======================================

        res.set({

            "Content-Type":
                contentType,

            "Content-Length":
                fileSize,

            "Accept-Ranges":
                "bytes",

            "X-Content-Type-Options":
                "nosniff"

        });


        return fs
            .createReadStream(
                filePath
            )
            .pipe(res);


    } catch (error) {

        console.error(
            "SECURE COURSE MATERIAL ERROR:",
            error
        );

        return res.status(500).send(
            "Unable to deliver course material."
        );

    }

};