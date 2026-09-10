const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
            index: true
        },

        certificateId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },

        issuedAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Certificate",
    certificateSchema
);