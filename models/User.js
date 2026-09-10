const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
            required: true
        },

        dob: {
            type: Date,
            required: true
        },

        // Add these inside your UserSchema
        resetPasswordToken: { 
            type: String
        },
        resetPasswordExpires: {
            type: Date,
        },

        // Profile Picture
        profileImage: {
            type: String,
            default: ""
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);