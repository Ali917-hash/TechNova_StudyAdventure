const mongoose = require("mongoose");

const blogViewSchema = new mongoose.Schema(
    {
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            required: true
        },

        visitorKey: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

blogViewSchema.index(
    { blog: 1, visitorKey: 1 },
    { unique: true }
);

module.exports = mongoose.model("BlogView", blogViewSchema);
