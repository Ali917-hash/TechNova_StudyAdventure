const mongoose = require("mongoose");

const courseLessonSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        content: {
            type: String,
            trim: true
        },

        video: {
            type: String,
            default: ""
        },

        pdf: {
            type: String,
            default: ""
        },

        order: {
            type: Number,
            default: 1
        },

        isPublished: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "CourseLesson",
    courseLessonSchema
);