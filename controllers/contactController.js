const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");


// ==========================================
// SHOW CONTACT PAGE
// ==========================================

exports.showContact = (req, res) => {

    try {

        const contactInfo = {

            address:
                "Govt. Graduate College, College Road, Farid Town, Sahiwal, Pakistan",

            phone:
                "(040) 9200428 | +92 301 4823746",

            email:
                "ali@ggcs.edu.pk | info@technova.com",

            hours:
                "Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed"

        };


        const faqs = [

            {
                question:
                    "How do I enroll in a course?",

                answer:
                    "Visit the Services page, choose your desired course, open its details and click Enroll Now. You must be logged in to enroll."
            },


            {
                question:
                    "Do you offer flexible payment plans?",

                answer:
                    "Our team can provide information about available payment options and enrollment arrangements. Contact us for the latest details."
            },


            {
                question:
                    "What is your refund policy?",

                answer:
                    "Refund conditions depend on the course and enrollment arrangement. Please contact TechNova support before making a payment if you need clarification."
            },


            {
                question:
                    "Do you provide career guidance?",

                answer:
                    "Yes. TechNova is designed to support practical skill development and career growth through courses, projects and learning resources."
            },


            {
                question:
                    "Can I contact TechNova about a partnership?",

                answer:
                    "Yes. Select Partnership in the contact form and provide details about your proposal. Our team will review your request."
            }

        ];


        const querySuccess =
            req.query.success === "1";


        res.render(
            "contact",
            {

                user:
                    req.session.user || null,

                contactInfo,

                faqs,

                querySuccess

            }
        );


    } catch (error) {

        console.error(
            "CONTACT PAGE ERROR:",
            error
        );


        res.status(500).send(
            "Unable to load contact page."
        );

    }

};


// ==========================================
// SAVE CONTACT FORM
// ==========================================

exports.saveContact = async (req, res) => {

    try {

        console.log("===== FORM DATA =====");

        console.log(req.body);


        const contact =
            await Contact.create(req.body);


        console.log("===== SAVED =====");

        console.log(contact);


        res.redirect(
            "/contact?success=1"
        );


    } catch (error) {

        console.log("===== ERROR =====");

        console.error(error);


        res.status(500).send(
            error.message
        );

    }

};


// ==========================================
// CONTACT FORM - EXISTING FUNCTION
// ==========================================

exports.submitContact = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            subject,
            message
        } = req.body;


        await Contact.create({

            name,
            email,
            phone,
            subject,
            message

        });


        res.redirect(
            "/contact?success=1"
        );


    } catch (error) {

        console.error(
            "CONTACT FORM ERROR:",
            error
        );


        res.status(500).send(
            "Unable to send message."
        );

    }

};

// ==========================================
// ADMIN - ALL MESSAGES
// ==========================================

exports.adminMessages = async (req, res) => {

    try {

        // ==========================================
        // GET FILTER
        // ==========================================

        const filter =
            req.query.filter || "all";


        // ==========================================
        // GET SEARCH
        // ==========================================

        const search =
            req.query.search
                ? req.query.search.trim()
                : "";


        // ==========================================
        // GET PAGE
        // ==========================================

        let page =
            parseInt(req.query.page, 10) || 1;


        if (page < 1) {
            page = 1;
        }


        // ==========================================
        // ITEMS PER PAGE
        // ==========================================

        const limit = 8;


        // ==========================================
        // BUILD SEARCH QUERY
        // ==========================================

        let query = {};


        if (search) {

            query.$or = [

                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    email: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    subject: {
                        $regex: search,
                        $options: "i"
                    }
                }

            ];

        }


        // ==========================================
        // APPLY REPLY STATUS FILTER
        // ==========================================

        if (filter === "replied") {

            query["replies.0"] = {
                $exists: true
            };

        }


        if (filter === "waiting") {

            query["replies.0"] = {
                $exists: false
            };

        }

        // ==========================================
        // TOTAL MESSAGE COUNT
        // ==========================================

        const totalMessages =
            await Contact.countDocuments();


        // ==========================================
        // TOTAL REPLIED
        // ==========================================

        const repliedMessages =
            await Contact.countDocuments({

                "replies.0": {
                    $exists: true
                }

            });


        // ==========================================
        // TOTAL WAITING
        // ==========================================

        const waitingMessages =
            await Contact.countDocuments({

                "replies.0": {
                    $exists: false
                }

            });

        // ==========================================
        // LATEST MESSAGE
        // ==========================================

        const latestMessage =
            await Contact
                .findOne()
                .sort({
                    createdAt: -1
                })
                .lean();


        // ==========================================
        // TOTAL MATCHING RESULTS
        // ==========================================

        const matchingMessages =
            await Contact.countDocuments(
                query
            );


        // ==========================================
        // TOTAL PAGES
        // ==========================================

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    matchingMessages / limit
                )
            );


        // ==========================================
        // PREVENT INVALID PAGE
        // ==========================================

        if (page > totalPages) {

            page = totalPages;

        }


        // ==========================================
        // CALCULATE SKIP
        // ==========================================

        const skip =
            (page - 1) * limit;


        // ==========================================
        // GET MESSAGES
        // ==========================================

        const messages =
            await Contact
                .find(query)
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(limit)
                .lean();


        // ==========================================
        // ADD REPLY STATUS
        // ==========================================

        messages.forEach(message => {

            message.replies =
                Array.isArray(message.replies)
                    ? message.replies
                    : [];


            message.replyCount =
                message.replies.length;


            message.isReplied =
                message.replyCount > 0;

        });


        // ==========================================
        // FIRST / LAST DISPLAY NUMBER
        // ==========================================

        const startItem =
            matchingMessages > 0
                ? skip + 1
                : 0;


        const endItem =
            Math.min(
                skip + messages.length,
                matchingMessages
            );


        // ==========================================
        // DEBUG
        // ==========================================

        console.log("================================");
        console.log("ADMIN MESSAGES");
        console.log("TOTAL:", totalMessages);
        console.log("REPLIED:", repliedMessages);
        console.log("WAITING:", waitingMessages);
        console.log("FILTER:", filter);
        console.log("SEARCH:", search || "none");
        console.log("MATCHING:", matchingMessages);
        console.log("PAGE:", page);
        console.log("TOTAL PAGES:", totalPages);
        console.log("SHOWING:", messages.length);
        console.log("================================");


        // ==========================================
        // RENDER
        // ==========================================

        res.render(
            "admin/messages",
            {

                user: req.session.user,

                messages,

                totalMessages,

                repliedMessages,

                waitingMessages,

                latestMessage,

                filter,

                search,

                page,

                totalPages,

                matchingMessages,

                startItem,

                endItem

            }
        );


    } catch (error) {

        console.error(
            "ADMIN MESSAGES ERROR:",
            error
        );


        res.status(500).send(
            "Unable to load messages."
        );

    }

};

// ==========================================
// ADMIN - VIEW SINGLE MESSAGE
// ==========================================

exports.viewMessage = async (req, res) => {

    try {

        const message =
            await Contact.findById(
                req.params.id
            );


        if (!message) {

            return res.status(404).send(
                "Message not found."
            );

        }


        // Make sure old documents have an array

        const replies =
            message.replies || [];


        res.render(
            "admin/viewMessage",
            {
                user: req.session.user,
                message,
                replies
            }
        );


    } catch (error) {

        console.error(
            "VIEW MESSAGE ERROR:",
            error
        );


        res.status(500).send(
            "Unable to open message."
        );

    }

};


// ==========================================
// ADMIN - REPLY TO MESSAGE
// ==========================================

exports.replyToMessage = async (req, res) => {

    try {

        // ==========================================
        // CHECK ADMIN SESSION
        // ==========================================

        if (!req.session.user) {

            return res.redirect(
                "/login"
            );

        }


        // ==========================================
        // GET ORIGINAL MESSAGE
        // ==========================================

        const message =
            await Contact.findById(
                req.params.id
            );


        if (!message) {

            return res.status(404).send(
                "Message not found."
            );

        }


        // ==========================================
        // GET REPLY
        // ==========================================

        const replyMessage =
            req.body.replyMessage
                ? req.body.replyMessage.trim()
                : "";


        if (!replyMessage) {

            return res.status(400).send(
                "Reply message is required."
            );

        }


        // ==========================================
        // SMTP TRANSPORTER
        // ==========================================

        const transporter =
            nodemailer.createTransport({

                host:
                    process.env.MAIL_HOST,

                port:
                    Number(
                        process.env.MAIL_PORT || 587
                    ),

                secure:
                    String(
                        process.env.MAIL_SECURE
                    ).toLowerCase() === "true",

                auth: {

                    user:
                        process.env.MAIL_USER,

                    pass:
                        process.env.MAIL_PASS

                }

            });


        // ==========================================
        // VERIFY SMTP
        // ==========================================

        await transporter.verify();


        // ==========================================
        // SEND EMAIL
        // ==========================================

        await transporter.sendMail({

            from:
                process.env.MAIL_FROM ||
                process.env.MAIL_USER,

            to:
                message.email,

            subject:
                `Re: ${message.subject}`,

            text:
                replyMessage,

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 30px;
                    background: #f8fafc;
                    color: #1e293b;
                ">

                    <div style="
                        background: #ffffff;
                        padding: 30px;
                        border-radius: 12px;
                        border: 1px solid #e2e8f0;
                    ">

                        <h2 style="
                            margin-top: 0;
                            color: #2563eb;
                        ">
                            TechNova Support
                        </h2>

                        <p>
                            Dear
                            <strong>
                                ${message.name}
                            </strong>,
                        </p>

                        <p style="
                            white-space: pre-line;
                            line-height: 1.7;
                        ">
                            ${replyMessage}
                        </p>

                        <hr style="
                            border: none;
                            border-top: 1px solid #e2e8f0;
                            margin: 25px 0;
                        ">

                        <p style="
                            color: #64748b;
                            font-size: 13px;
                        ">
                            Replying to:
                            <strong>
                                ${message.subject}
                            </strong>
                        </p>

                        <p style="
                            color: #64748b;
                            font-size: 13px;
                            margin-bottom: 0;
                        ">
                            Regards,<br>
                            <strong>
                                TechNova Support Team
                            </strong>
                        </p>

                    </div>

                </div>
            `

        });


        // ==========================================
        // INITIALIZE REPLY ARRAY
        // ==========================================

        if (!Array.isArray(message.replies)) {

            message.replies = [];

        }


        // ==========================================
        // GET ADMIN NAME
        // ==========================================

        const adminFirstName =
            req.session.user.firstName || "";

        const adminLastName =
            req.session.user.lastName || "";


        const adminName =
            `${adminFirstName} ${adminLastName}`
                .trim() ||
            "TechNova Support";


        // ==========================================
        // ADD REPLY
        // ==========================================

        message.replies.push({

            message:
                replyMessage,

            sentAt:
                new Date(),

            sentBy:
                req.session.user._id || null,

            sentByName:
                adminName

        });


        // ==========================================
        // SAVE CONTACT DOCUMENT
        // ==========================================

        await message.save();


        // ==========================================
        // VERIFY DATABASE SAVE
        // ==========================================

        const savedMessage =
            await Contact.findById(
                message._id
            ).lean();


        const savedReplies =
            savedMessage &&
            Array.isArray(
                savedMessage.replies
            )
                ? savedMessage.replies
                : [];


        console.log(
            "================================"
        );

        console.log(
            "REPLY EMAIL SENT SUCCESSFULLY"
        );

        console.log(
            "MESSAGE ID:",
            message._id.toString()
        );

        console.log(
            "RECIPIENT:",
            message.email
        );

        console.log(
            "REPLY COUNT AFTER SAVE:",
            savedReplies.length
        );

        console.log(
            "LATEST REPLY:",
            savedReplies[
                savedReplies.length - 1
            ]
        );

        console.log(
            "================================"
        );


        // ==========================================
        // VERIFY SAVE FAILED
        // ==========================================

        if (savedReplies.length === 0) {

            console.error(
                "WARNING: EMAIL SENT BUT REPLY WAS NOT SAVED."
            );

            return res.status(500).send(
                "Email was sent, but the reply could not be saved in the database."
            );

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.redirect(
            `/admin/messages/view/${message._id}?reply=success`
        );


    } catch (error) {

        console.error(
            "================================"
        );

        console.error(
            "REPLY MESSAGE ERROR"
        );

        console.error(error);

        console.error(
            "================================"
        );


        return res.status(500).send(
            "Unable to send reply: " +
            error.message
        );

    }

};


// ==========================================
// ADMIN - DELETE MESSAGE
// ==========================================

exports.deleteMessage = async (req, res) => {

    try {

        const message =
            await Contact.findById(
                req.params.id
            );


        if (!message) {

            return res.status(404).send(
                "Message not found."
            );

        }


        await Contact.findByIdAndDelete(
            req.params.id
        );


        res.redirect(
            "/admin/messages"
        );


    } catch (error) {

        console.error(
            "DELETE MESSAGE ERROR:",
            error
        );


        res.status(500).send(
            "Unable to delete message."
        );

    }

};