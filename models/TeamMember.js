const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
    {
        // ==========================================
        // NAME
        // ==========================================

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },


        // ==========================================
        // JOB TITLE
        // ==========================================

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },


        // ==========================================
        // EXPERIENCE
        // ==========================================

        experience: {
            type: String,
            trim: true,
            default: ""
        },


        // ==========================================
        // PROFILE IMAGE
        // ==========================================

        image: {
            type: String,
            default: "default-profile.png"
        },


        // ==========================================
        // LINKEDIN
        // ==========================================

        linkedin: {
            type: String,
            trim: true,
            default: ""
        },


        // ==========================================
        // INSTAGRAM
        // ==========================================

        instagram: {
            type: String,
            trim: true,
            default: ""
        },


        // ==========================================
        // SHORT BIO
        // ==========================================

        bio: {
            type: String,
            trim: true,
            maxlength: 500,
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


teamMemberSchema.index({
    isPublished: 1,
    order: 1
});


module.exports = mongoose.model(
    "TeamMember",
    teamMemberSchema
);