const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            required: true
        },

        ipAddress: {
            type: String,
            default: "unknown"
        },

        userAgent: {
            type: String,
            default: "unknown"
        },

        loggedInAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true
    }
);

loginActivitySchema.index({ loggedInAt: -1 });
loginActivitySchema.index({ email: 1, loggedInAt: -1 });

module.exports = mongoose.model("LoginActivity", loginActivitySchema);
