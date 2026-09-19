const mongoose = require("mongoose");

const blogCommentSchema = new mongoose.Schema(
    {
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 80
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            maxlength: 160,
            default: ""
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },

        status: {
            type: String,
            enum: ["approved", "pending", "rejected"],
            default: "approved",
            index: true
        }
    },
    {
        timestamps: true
    }
);

blogCommentSchema.index({ blog: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("BlogComment", blogCommentSchema);
