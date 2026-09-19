require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const {
    generateCsrfToken
} = require("./middleware/csrf");

const app = express();
const path = require("path");

app.locals.uploadUrl = image => {

    if (!image) {
        return "";
    }

    return /^https?:\/\//i.test(image)
        ? image
        : "/uploads/" + image;

};

app.disable("x-powered-by");

const requiredEnvironment = [
    "SESSION_SECRET",
    "CSRF_SECRET",
    "MONGO_URI"
];

const missingEnvironment =
    requiredEnvironment.filter(
        name => !process.env[name]
    );

if (missingEnvironment.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missingEnvironment.join(", ")}`
    );
}

if (
    process.env.NODE_ENV === "production" &&
    (
        process.env.SESSION_SECRET.length < 32 ||
        process.env.CSRF_SECRET.length < 32
    )
) {
    throw new Error(
        "Production session and CSRF secrets must each be at least 32 characters."
    );
}
// ==========================================
// SECURITY HEADERS
// ==========================================

app.use((req, res, next) => {
    res.locals.cspNonce = crypto
        .randomBytes(16)
        .toString("base64");

    next();
});

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
                objectSrc: ["'none'"],
                frameAncestors: ["'self'"],
                imgSrc: [
                    "'self'",
                    "data:",
                    "blob:",
                    "https://*.public.blob.vercel-storage.com"
                ],
                mediaSrc: [
                    "'self'",
                    "blob:",
                    "https://*.public.blob.vercel-storage.com"
                ],
                fontSrc: [
                    "'self'",
                    "https://cdnjs.cloudflare.com",
                    "https://fonts.gstatic.com"
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://cdnjs.cloudflare.com",
                    "https://fonts.googleapis.com"
                ],
                scriptSrc: [
                    "'self'",
                    (req, res) => `'nonce-${res.locals.cspNonce}'`,
                    "https://cdnjs.cloudflare.com"
                ],
                connectSrc: ["'self'"],
                frameSrc: ["'self'"],
                manifestSrc: ["'self'"],
                workerSrc: ["'self'", "blob:"]
            }
        }
    })
);

// ==========================================
// BLOCK DIRECT PUBLIC ACCESS TO COURSE FILES
// ==========================================

app.use((req, res, next) => {

    if (
        req.path.startsWith(
            "/uploads/course-materials/"
        )
    ) {

        return res.status(403).send(
            "Direct access to course materials is not allowed."
        );

    }

    next();

});


// ==========================================
// PUBLIC STATIC FILES
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

app.use(
    "/uploads",
    express.static(
        process.env.VERCEL
            ? "/tmp/uploads"
            : path.join(__dirname, "public/uploads")
    )
);

const nodemailer = require("nodemailer");
const connectDB = require("./config/db");

// Connect Database
connectDB();

// Middleware
app.use(express.urlencoded({
    extended: true,
    limit: "1mb"
}));
app.use(express.json({
    limit: "1mb"
}));
app.use(methodOverride("_method"));

// ==========================================
// SECURE SESSION CONFIGURATION
// ==========================================

app.set("trust proxy", 1);

app.use(
    session({

        // Secret must come from .env
        secret: process.env.SESSION_SECRET,

        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions",
            ttl: 60 * 60 * 24
        }),

        // Don't save sessions that haven't changed
        resave: false,

        // CSRF tokens are bound to the anonymous session ID before login.
        saveUninitialized: true,

        cookie: {

            // Prevent JavaScript access to session cookie
            httpOnly: true,

            // Helps protect against CSRF
            sameSite: "lax",

            // Session lifetime
            maxAge:
                1000 * 60 * 60 * 24, // 24 hours

            // HTTPS only in production
            secure:
                process.env.NODE_ENV === "production"

        }

    })
);

// ==========================================
// COOKIE PARSER
// ==========================================

app.use(cookieParser());

// ==========================================
// GLOBAL CSRF TOKEN
// ==========================================

app.use(
    (req, res, next) => {

        try {

            if (
                req.method === "GET" ||
                req.method === "HEAD"
            ) {
                res.locals.csrfToken =
                    generateCsrfToken(req, res);
            }

            next();

        } catch (error) {

            next(error);

        }

    }
);


// ==========================================
// GLOBAL CURRENT PAGE
// ==========================================

app.use((req, res, next) => {

    res.locals.currentPage = req.path;

    next();

});

const SiteSettings =
    require("./models/SiteSettings");


// ==========================================
// GLOBAL WEBSITE SETTINGS
// ==========================================

app.use(
    async (req, res, next) => {

        try {

            let settings =
                await SiteSettings
                    .findOne()
                    .lean();


            // Create default settings if none exist

            if (!settings) {

                const createdSettings =
                    await SiteSettings.create({});

                settings =
                    createdSettings.toObject();

            }


            // ==========================================
            // CREATE NAVIGATION ITEMS
            // ==========================================

            const navItems =
                (settings.navigation || [])
                    .filter(
                        item => item.visible === true
                    )
                    .sort(
                        (a, b) =>
                            a.order - b.order
                    );


            // ==========================================
            // MAKE AVAILABLE TO ALL EJS FILES
            // ==========================================

            res.locals.siteSettings =
                settings;

            res.locals.navItems =
                navItems;


            next();


        } catch (error) {

            console.error(
                "GLOBAL SITE SETTINGS ERROR:",
                error
            );


            // ==========================================
            // FALLBACK SETTINGS
            // ==========================================

            const fallbackSettings = {

                heroTitle:
                    "Elevate Your Business with",

                heroHighlight:
                    "Next-Gen Technology Solutions",

                heroDescription:
                    "Technology solutions for a digital future.",

                heroButtonText:
                    "Get Started",

                heroButtonLink:
                    "/registration",

                heroImage:
                    "",

                missionTitle:
                    "Our Mission",

                missionText:
                    "",

                visionTitle:
                    "Our Vision",

                visionText:
                    "",

                coreValues:
                    [],

                navigation: [
                    {
                        label: "Home",
                        path: "/",
                        visible: true,
                        order: 1
                    },
                    {
                        label: "About Us",
                        path: "/about",
                        visible: true,
                        order: 2
                    },
                    {
                        label: "Services",
                        path: "/services",
                        visible: true,
                        order: 3
                    },
                    {
                        label: "Portfolio",
                        path: "/portfolio",
                        visible: true,
                        order: 4
                    },
                    {
                        label: "Blog",
                        path: "/blog",
                        visible: true,
                        order: 5
                    },
                    {
                        label: "Contact",
                        path: "/contact",
                        visible: true,
                        order: 6
                    }
                ],

                footerTitle:
                    "TechNova",

                footerDescription:
                    "",

                footerAddress:
                    "",

                footerPhone:
                    "",

                footerEmail:
                    "",

                facebookUrl:
                    "",

                twitterUrl:
                    "",

                linkedinUrl:
                    "",

                instagramUrl:
                    ""

            };


            const fallbackNavItems =
                fallbackSettings.navigation
                    .filter(
                        item => item.visible === true
                    )
                    .sort(
                        (a, b) =>
                            a.order - b.order
                    );


            res.locals.siteSettings =
                fallbackSettings;

            res.locals.navItems =
                fallbackNavItems;


            next();

        }

    }
);


// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home Route
const homeRoutes = require("./routes/homeRoutes");
app.use(homeRoutes);

// About Route
const aboutRoutes = require("./routes/aboutRoutes");
app.use(aboutRoutes);

// Service Route
const serviceRoutes = require("./routes/serviceRoutes");
app.use(serviceRoutes);

// Portfolio Route
const portfolioRoutes = require("./routes/portfolioRoutes");
app.use(portfolioRoutes);

// Blog Routes
const blogRoutes = require("./routes/blogRoutes");
app.use(blogRoutes);

// Contact Routes
const contactRoutes=require("./routes/contactRoutes");
app.use(contactRoutes);

// Registration Route
const userRoutes = require("./routes/userRoutes");
app.use(userRoutes);

// Enrollment Routes
const enrollmentRoutes = require("./routes/enrollmentRoutes");
app.use(enrollmentRoutes);

// Course Routes
const courseRoutes = require("./routes/courseRoutes");
app.use(courseRoutes);

// Certificate Routes
const certificateRoutes = require("./routes/certificateRoutes");
app.use(certificateRoutes);

// Admin Routes
const adminRoutes = require("./routes/adminRoutes");
app.use(adminRoutes);

// Progress Routes
const progressRoutes = require("./routes/progressRoutes");
app.use(progressRoutes);

// Learning Routes
const learningRoutes = require("./routes/learningRoutes");
app.use(learningRoutes);

// Site Settings Routes
const siteSettingsRoutes = require("./routes/siteSettingsRoutes");
app.use(siteSettingsRoutes);

// ==========================================
// CENTRALIZED ERROR HANDLING
// ==========================================

app.use((error, req, res, next) => {

    console.error("REQUEST ERROR:", error);

    if (res.headersSent) {
        return next(error);
    }

    if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).send(
            "The image is too large. Each image must be 10 MB or smaller."
        );
    }

    if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(413).send(
            "Too many files were uploaded in one request."
        );
    }

    if (error.code === "LIMIT_PART_COUNT") {
        return res.status(413).send(
            "The form contains too many fields or files."
        );
    }

    if (error.code === "LIMIT_FIELD_COUNT") {
        return res.status(413).send(
            "The form contains too many fields."
        );
    }

    if (error.code === "EBADCSRFTOKEN") {
        return res.status(403).send(
            "Invalid security token. Please refresh and try again."
        );
    }

    if (
        error.name === "BlobError" ||
        error.message?.includes("BLOB_READ_WRITE_TOKEN")
    ) {
        return res.status(503).send(
            "Image storage is not configured. Connect a Vercel Blob store and redeploy."
        );
    }

    return res.status(500).send(
        "An unexpected error occurred."
    );
});


// Server

const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server Running On Port ${PORT}`);
    });
}

module.exports = app;

