const mongoose = require("mongoose");
const progressSchema = new mongoose.Schema(
    {
        // ==========================================
        // STUDENT
        // ==========================================

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        // ==========================================
        // COURSE
        // ==========================================

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },


        // ==========================================
        // OLD LESSON SYSTEM
        // ==========================================

        completedLessons: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Lesson"
            }
        ],


        // ==========================================
        // NEW COURSE MATERIAL SYSTEM
        // ==========================================

        completedMaterials: [
            {
                type: String
            }
        ],


        // Currently opened/learning material
        currentMaterial: {
            type: String,
            default: ""
        },


        // Last learning activity
        lastAccessedAt: {
            type: Date,
            default: Date.now
        },


        // ==========================================
        // COURSE PROGRESS
        // ==========================================

        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },


        // ==========================================
        // COURSE COMPLETION
        // ==========================================

        completed: {
            type: Boolean,
            default: false
        },


        // ==========================================
        // COMPLETION DATE
        // ==========================================

        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);


// ==========================================
// ONE PROGRESS RECORD PER USER + COURSE
// ==========================================

progressSchema.index(
    {
        user: 1,
        course: 1
    },
    {
        unique: true
    }
);


module.exports = mongoose.model(
    "Progress",
    progressSchema
);