const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        // ==========================================
        // BLOG TITLE
        // ==========================================

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },


        // ==========================================
        // URL SLUG
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
        // AUTHOR
        // ==========================================

        author: {
            type: String,
            required: true,
            trim: true,
            default: "TechNova"
        },


        // ==========================================
        // BLOG IMAGE
        // ==========================================

        image: {
            type: String,
            default: "default-blog.jpg"
        },


        // ==========================================
        // EXCERPT
        // ==========================================

        excerpt: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },


        // ==========================================
        // FULL CONTENT
        // ==========================================

        content: {
            type: String,
            required: true
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
        // VIEWS
        // ==========================================

        views: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);


// ==========================================
// INDEXES
// ==========================================

blogSchema.index({
    title: "text",
    excerpt: "text",
    content: "text",
    category: "text"
});

blogSchema.index({
    createdAt: -1
});

blogSchema.index({
    isPublished: 1,
    isFeatured: 1
});


module.exports = mongoose.model(
    "Blog",
    blogSchema
);