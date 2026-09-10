const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true
        },

        instructor: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            default: 0
        },

        duration: {
            type: String
        },

        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner"
        },

        // Course Thumbnail
        image: {
            type: String,
            default: "default-course.png"
        },

        // Course Description
        description: {
            type: String,
            required: true
        },

        // ==========================================
        // COURSE LEARNING MATERIAL
        // ==========================================

        contentFile: {
            type: String,
            default: ""
        },

        contentType: {
            type: String,
            default: ""
        },

        contentOriginalName: {
            type: String,
            default: ""
        },

        // ==========================================
        // MULTIPLE COURSE MATERIAL FILES
        // ==========================================

        contentFiles: [
            {
                filename: {
                    type: String,
                    required: true
                },

                originalName: {
                    type: String,
                    required: true
                },

                path: {
                    type: String,
                    required: true
                },

                mimetype: {
                    type: String,
                    default: ""
                },

                size: {
                    type: Number,
                    default: 0
                }
            }
        ],

        // ==========================================
        // STUDENTS
        // ==========================================

        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Course", courseSchema);