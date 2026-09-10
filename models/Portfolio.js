const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
    {
        // ==========================================
        // PROJECT TITLE
        // ==========================================

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },


        // ==========================================
        // SLUG
        // ==========================================

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },


        // ==========================================
        // CATEGORY
        // ==========================================

        category: {
            type: String,
            required: true,
            trim: true
        },


        // ==========================================
        // DESCRIPTION
        // ==========================================

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },


        // ==========================================
        // FULL PROJECT DETAILS
        // ==========================================

        content: {
            type: String,
            default: ""
        },


        // ==========================================
        // PROJECT IMAGE
        // ==========================================

        image: {
            type: String,
            default: "default-project.jpg"
        },


        // ==========================================
        // TECHNOLOGIES
        // ==========================================

        technologies: [
            {
                type: String,
                trim: true
            }
        ],


        // ==========================================
        // STUDENT / CLIENT NAME
        // ==========================================

        studentName: {
            type: String,
            trim: true,
            default: ""
        },


        // ==========================================
        // STUDENT / CLIENT ROLE
        // ==========================================

        studentRole: {
            type: String,
            trim: true,
            default: ""
        },


        // ==========================================
        // SUCCESS STORY / QUOTE
        // ==========================================

        quote: {
            type: String,
            trim: true,
            default: ""
        },


        // ==========================================
        // PROJECT URL
        // ==========================================

        projectUrl: {
            type: String,
            trim: true,
            default: ""
        },


        // ==========================================
        // GITHUB URL
        // ==========================================

        githubUrl: {
            type: String,
            trim: true,
            default: ""
        },


        // ==========================================
        // PUBLISHED
        // ==========================================

        isPublished: {
            type: Boolean,
            default: true
        },


        // ==========================================
        // FEATURED
        // ==========================================

        isFeatured: {
            type: Boolean,
            default: false
        },


        // ==========================================
        // PROJECT TYPE
        // ==========================================

        type: {
            type: String,
            enum: [
                "project",
                "success-story"
            ],
            default: "project"
        },


        // ==========================================
        // DISPLAY ORDER
        // ==========================================

        order: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);


// ==========================================
// INDEXES
// ==========================================

portfolioSchema.index({
    title: "text",
    description: "text",
    category: "text",
    technologies: "text"
});

portfolioSchema.index({
    createdAt: -1
});

portfolioSchema.index({
    isPublished: 1,
    isFeatured: 1
});

portfolioSchema.index({
    type: 1
});


module.exports = mongoose.model(
    "Portfolio",
    portfolioSchema
);