const mongoose = require("mongoose");

const visitActivitySchema = new mongoose.Schema(
    {
        visitorId: {
            type: String,
            required: true,
            index: true
        },

        path: {
            type: String,
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

        visitedAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true
    }
);

visitActivitySchema.index({ visitedAt: -1 });
visitActivitySchema.index({ visitorId: 1, visitedAt: -1 });

module.exports = mongoose.model("VisitActivity", visitActivitySchema);
