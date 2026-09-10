const mongoose = require("mongoose");
const Progress = require("../models/Progress");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Certificate = require("../models/Certificate");


// ==========================================
// GET CURRENT USER ID
// ==========================================

function getUserId(req) {

    return (
        req.session?.user?._id ||
        req.session?.user?.id ||
        null
    );

}


// ==========================================
// VALIDATE OBJECT ID
// ==========================================

function isValidObjectId(id) {

    return mongoose.Types.ObjectId.isValid(id);

}


// ==========================================
// CHECK APPROVED ENROLLMENT
// ==========================================

async function getApprovedEnrollment(
    userId,
    courseId
) {

    return await Enrollment.findOne({

        student: userId,

        course: courseId,

        status: "approved"

    });

}


// ==========================================
// SET CURRENT MATERIAL
// ==========================================

exports.setCurrentMaterial = async (
    req,
    res
) => {

    try {

        // ==========================================
        // CHECK LOGIN
        // ==========================================

        const userId =
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Not logged in."

            });

        }


        const courseId =
            req.params.courseId;


        const materialIndex =
            Number(
                req.params.materialIndex
            );


        // ==========================================
        // VALIDATE IDS
        // ==========================================

        if (!isValidObjectId(userId)) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid user session."

            });

        }


        if (!isValidObjectId(courseId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid course ID."

            });

        }


        // ==========================================
        // FIND COURSE
        // ==========================================

        const course =
            await Course.findById(courseId);


        if (!course) {

            return res.status(404).json({

                success: false,

                message:
                    "Course not found."

            });

        }


        // ==========================================
        // CHECK MATERIAL INDEX
        // ==========================================

        if (
            !Number.isInteger(materialIndex) ||
            materialIndex < 0 ||
            materialIndex >=
                course.contentFiles.length
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Material not found."

            });

        }


        // ==========================================
        // CHECK APPROVED ENROLLMENT
        // ==========================================

        const enrollment =
            await getApprovedEnrollment(
                userId,
                courseId
            );


        if (!enrollment) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not approved for this course."

            });

        }


        // ==========================================
        // GET MATERIAL
        // ==========================================

        const material =
            course.contentFiles[
                materialIndex
            ];


        if (
            !material ||
            !material.filename
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Course material is unavailable."

            });

        }


        // ==========================================
        // FIND / CREATE PROGRESS
        // ==========================================

        let progress =
            await Progress.findOne({

                user: userId,

                course: courseId

            });


        if (!progress) {

            progress =
                await Progress.create({

                    user: userId,

                    course: courseId

                });

        }


        // ==========================================
        // SAVE CURRENT MATERIAL
        // ==========================================

        progress.currentMaterial =
            material.filename;


        progress.lastAccessedAt =
            new Date();


        await progress.save();


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.json({

            success: true,

            currentMaterial:
                material.filename

        });


    } catch (error) {

        console.error(
            "SET CURRENT MATERIAL ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to save current material."

        });

    }

};


// ==========================================
// MARK MATERIAL AS COMPLETE
// ==========================================

exports.completeMaterial = async (
    req,
    res
) => {

    try {

        // ==========================================
        // CHECK LOGIN
        // ==========================================

        const userId =
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Not logged in."

            });

        }


        const courseId =
            req.params.courseId;


        const materialIndex =
            Number(
                req.params.materialIndex
            );


        // ==========================================
        // VALIDATE IDS
        // ==========================================

        if (!isValidObjectId(userId)) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid user session."

            });

        }


        if (!isValidObjectId(courseId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid course ID."

            });

        }


        // ==========================================
        // FIND COURSE
        // ==========================================

        const course =
            await Course.findById(courseId);


        if (!course) {

            return res.status(404).json({

                success: false,

                message:
                    "Course not found."

            });

        }


        // ==========================================
        // CHECK MATERIAL INDEX
        // ==========================================

        if (
            !Number.isInteger(materialIndex) ||
            materialIndex < 0 ||
            materialIndex >=
                course.contentFiles.length
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Course material not found."

            });

        }


        // ==========================================
        // CHECK APPROVED ENROLLMENT
        // ==========================================

        const enrollment =
            await getApprovedEnrollment(
                userId,
                courseId
            );


        if (!enrollment) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not approved for this course."

            });

        }


        // ==========================================
        // GET MATERIAL
        // ==========================================

        const material =
            course.contentFiles[
                materialIndex
            ];


        if (
            !material ||
            !material.filename
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Course material is unavailable."

            });

        }


        const materialKey =
            material.filename;


        // ==========================================
        // FIND / CREATE PROGRESS
        // ==========================================

        let progress =
            await Progress.findOne({

                user: userId,

                course: courseId

            });


        if (!progress) {

            progress =
                await Progress.create({

                    user: userId,

                    course: courseId,

                    completedMaterials: [],

                    progress: 0,

                    completed: false

                });

        }


        // ==========================================
        // CURRENT MATERIAL
        // ==========================================

        progress.currentMaterial =
            materialKey;


        progress.lastAccessedAt =
            new Date();


        // ==========================================
        // ADD TO COMPLETED MATERIALS
        // ==========================================

        if (
            !Array.isArray(
                progress.completedMaterials
            )
        ) {

            progress.completedMaterials = [];

        }


        const alreadyCompleted =
            progress.completedMaterials.includes(
                materialKey
            );


        if (!alreadyCompleted) {

            progress.completedMaterials.push(
                materialKey
            );

        }


        // ==========================================
        // CALCULATE PROGRESS
        // ==========================================

        const totalMaterials =
            course.contentFiles.length;


        const completedMaterials =
            progress.completedMaterials.length;


        if (totalMaterials > 0) {

            progress.progress =
                Math.min(
                    100,
                    Math.round(
                        (
                            completedMaterials /
                            totalMaterials
                        ) * 100
                    )
                );

        } else {

            progress.progress = 0;

        }


        // ==========================================
        // COURSE COMPLETION
        // ==========================================

        if (progress.progress >= 100) {

            progress.progress = 100;

            progress.completed = true;

            progress.completedAt =
                progress.completedAt ||
                new Date();


            // ======================================
            // CHECK EXISTING CERTIFICATE
            // ======================================

            const existingCertificate =
                await Certificate.findOne({

                    user: userId,

                    course: courseId

                });


            // ======================================
            // CREATE CERTIFICATE
            // ======================================

            if (!existingCertificate) {

                const certificateId =
                    "TN-" +
                    Date.now()
                        .toString(36)
                        .toUpperCase() +
                    "-" +
                    Math.random()
                        .toString(36)
                        .substring(2, 7)
                        .toUpperCase();


                await Certificate.create({

                    user: userId,

                    course: courseId,

                    certificateId

                });

            }

        }


        // ==========================================
        // SAVE
        // ==========================================

        await progress.save();


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.json({

            success: true,

            progress:
                progress.progress,

            completed:
                progress.completed,

            material:
                materialKey

        });


    } catch (error) {

        console.error(
            "COMPLETE MATERIAL ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to complete course material."

        });

    }

};


// ==========================================
// GET COURSE PROGRESS
// ==========================================

// exports.getCourseProgress = async (
//     req,
//     res
// ) => {

//     try {

//         // ==========================================
//         // CHECK LOGIN
//         // ==========================================

//         const userId =
//             getUserId(req);


//         if (!userId) {

//             return res.status(401).json({

//                 success: false,

//                 message:
//                     "Not logged in."

//             });

//         }


//         const courseId =
//             req.params.courseId;


//         // ==========================================
//         // VALIDATE IDS
//         // ==========================================

//         if (!isValidObjectId(userId)) {

//             return res.status(401).json({

//                 success: false,

//                 message:
//                     "Invalid user session."

//             });

//         }


//         if (!isValidObjectId(courseId)) {

//             return res.status(400).json({

//                 success: false,

//                 message:
//                     "Invalid course ID."

//             });

//         }


//         // ==========================================
//         // CHECK APPROVED ENROLLMENT
//         // ==========================================

//         const enrollment =
//             await getApprovedEnrollment(
//                 userId,
//                 courseId
//             );


//         if (!enrollment) {

//             return res.status(403).json({

//                 success: false,

//                 message:
//                     "You are not approved for this course."

//             });

//         }


//         // ==========================================
//         // GET PROGRESS
//         // ==========================================

//         const progress =
//             await Progress.findOne({

//                 user: userId,

//                 course: courseId

//             }).lean();


//         // ==========================================
//         // NO PROGRESS YET
//         // ==========================================

//         if (!progress) {

//             return res.json({

//                 success: true,

//                 progress: 0,

//                 completed: false,

//                 completedMaterials: [],

//                 currentMaterial: ""

//             });

//         }


//         // ==========================================
//         // RESPONSE
//         // ==========================================

//         return res.json({

//             success: true,

//             progress:
//                 progress.progress,

//             completed:
//                 progress.completed,

//             completedMaterials:
//                 progress.completedMaterials || [],

//             currentMaterial:
//                 progress.currentMaterial || ""

//         });


//     } catch (error) {

//         console.error(
//             "GET PROGRESS ERROR:",
//             error
//         );


//         return res.status(500).json({

//             success: false,

//             message:
//                 "Unable to get progress."

//         });

//     }

// };

// ==========================================
// GET COURSE PROGRESS
// ==========================================

exports.getCourseProgress = async (
    req,
    res
) => {

    try {

        // ==========================================
        // CHECK LOGIN
        // ==========================================

        if (
            !req.session ||
            !req.session.user
        ) {

            return res.status(401).json({

                success: false,

                message: "Not logged in."

            });

        }


        const userId =
            req.session.user._id;

        const courseId =
            req.params.courseId;


        // ==========================================
        // VALIDATE COURSE ID
        // ==========================================

        if (
            !mongoose.Types.ObjectId.isValid(
                courseId
            )
        ) {

            return res.status(400).json({

                success: false,

                message: "Invalid course ID."

            });

        }


        // ==========================================
        // CHECK APPROVED ENROLLMENT
        // ==========================================

        const enrollment =
            await Enrollment.findOne({

                student: userId,

                course: courseId,

                status: "approved"

            }).lean();


        if (!enrollment) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not approved for this course."

            });

        }


        // ==========================================
        // GET PROGRESS
        // ==========================================

        const progress =
            await Progress.findOne({

                user: userId,

                course: courseId

            }).lean();


        // ==========================================
        // NO PROGRESS YET
        // ==========================================

        if (!progress) {

            return res.json({

                success: true,

                progress: 0,

                completed: false,

                completedMaterials: [],

                currentMaterial: ""

            });

        }


        // ==========================================
        // RETURN PROGRESS
        // ==========================================

        return res.json({

            success: true,

            progress:
                progress.progress || 0,

            completed:
                progress.completed === true,

            completedMaterials:
                progress.completedMaterials || [],

            currentMaterial:
                progress.currentMaterial || ""

        });


    } catch (error) {

        console.error(
            "GET PROGRESS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to get progress."

        });

    }

};