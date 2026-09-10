// const mongoose = require("mongoose");

// const contactSchema = new mongoose.Schema(
// {
//     // ==========================================
//     // VISITOR INFORMATION
//     // ==========================================

//     name: {
//         type: String,
//         required: [true, "Name is required"],
//         trim: true,
//         minlength: 3,
//         maxlength: 50
//     },

//     email: {
//         type: String,
//         required: [true, "Email is required"],
//         trim: true,
//         lowercase: true
//     },

//     phone: {
//         type: String,
//         required: [true, "Phone number is required"],
//         trim: true
//     },

//     subject: {
//         type: String,
//         required: [true, "Subject is required"],
//         trim: true
//     },

//     message: {
//         type: String,
//         required: [true, "Message is required"],
//         trim: true,
//         minlength: 10
//     },


//     // ==========================================
//     // ADMIN REPLY HISTORY
//     // ==========================================

//     replies: [

//         {
//             message: {
//                 type: String,
//                 required: true,
//                 trim: true
//             },

//             sentAt: {
//                 type: Date,
//                 default: Date.now
//             },

//             sentBy: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: "User",
//                 default: null
//             },

//             sentByName: {
//                 type: String,
//                 default: "TechNova Support"
//             }
//         }

//     ]

// },
// {
//     timestamps: true
// });


// module.exports = mongoose.model(
//     "Contact",
//     contactSchema
// );

const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        // ==========================================
        // VISITOR INFORMATION
        // ==========================================

        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 3,
            maxlength: 50
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },

        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true
        },

        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            minlength: 10
        },

        // ==========================================
        // ADMIN REPLY HISTORY
        // ==========================================

        replies: {
            type: [
                {
                    message: {
                        type: String,
                        required: true,
                        trim: true
                    },

                    sentAt: {
                        type: Date,
                        default: Date.now
                    },

                    sentBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        default: null
                    },

                    sentByName: {
                        type: String,
                        default: "TechNova Support"
                    }
                }
            ],

            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Contact",
    contactSchema
);