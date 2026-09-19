const mongoose = require("mongoose");

const blogReactionSchema = new mongoose.Schema(
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
        },

        reaction: {
            type: String,
            enum: ["like", "insightful", "helpful"],
            required: true
        }
    },
    {
        timestamps: true
    }
);

blogReactionSchema.index(
    { blog: 1, visitorKey: 1 },
    { unique: true }
);

module.exports = mongoose.model("BlogReaction", blogReactionSchema);
