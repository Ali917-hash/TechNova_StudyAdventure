require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const mongoose = require("mongoose");
const {
    PAKISTAN_TIME_ZONE,
    formatPakistanDateTime
} = require("./utils/pakistanTime");
const {
    generateCsrfToken
} = require("./middleware/csrf");
const trackPublicVisit = require("./middleware/visitorTracker");

const app = express();
const path = require("path");

app.locals.pakistanTimeZone = PAKISTAN_TIME_ZONE;
app.locals.formatPakistanDateTime = formatPakistanDateTime;

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
// SERVICE HEALTH CHECK
// ==========================================

app.get("/health", (req, res) => {

    const databaseConnected =
        mongoose.connection.readyState === 1;

    const emailConfigured = Boolean(
        process.env.MAIL_HOST &&
        process.env.MAIL_USER &&
        process.env.MAIL_PASS
    );

    return res.status(databaseConnected ? 200 : 503).json({
        status: databaseConnected ? "ok" : "degraded",
        services: {
            database: databaseConnected ? "connected" : "disconnected",
            email: emailConfigured ? "configured" : "not-configured",
            storage: process.env.VERCEL ? "cloud" : "local"
        },
        timestamp: new Date().toISOString(),
        pakistanTime: formatPakistanDateTime(new Date())
    });

});

// ==========================================
// SECURE SESSION CONFIGURATION
// ==========================================

app.set("trust proxy", 1);

const userSessionLifetime =
    1000 * 60 * 60 * 24 * 30;

const adminSessionLifetime =
    1000 * 60 * 60 * 12;

app.use(
    session({

        // Secret must come from .env
        secret: process.env.SESSION_SECRET,

        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions",
            ttl: 60 * 60 * 24 * 30
        }),

        // Save only changed sessions while allowing the cookie to roll forward.
        resave: false,

        rolling: true,

        // CSRF tokens are bound to the anonymous session ID before login.
        saveUninitialized: true,

        cookie: {

            // Prevent JavaScript access to session cookie
            httpOnly: true,

            // Helps protect against CSRF
            sameSite: "lax",

            // Session lifetime
            maxAge:
                userSessionLifetime,

            // HTTPS only in production
            secure:
                process.env.NODE_ENV === "production"

        }

    })
);

app.use((req, res, next) => {

    if (req.session?.user?.role === "admin") {
        req.session.cookie.maxAge =
            adminSessionLifetime;
    } else if (req.session) {
        req.session.cookie.maxAge =
            userSessionLifetime;
    }

    next();

});

app.use(trackPublicVisit);

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

const renderErrorPage = (
    req,
    res,
    {
        code,
        label,
        title,
        message,
        icon
    }
) => {
    return res.status(code).render("error", {
        code,
        label,
        title,
        message,
        icon,
        requestId: crypto.randomBytes(6).toString("hex")
    });
};

// ==========================================
// NOT FOUND
// ==========================================

app.use((req, res) => {
    return renderErrorPage(req, res, {
        code: 404,
        label: "Page not found",
        title: "That page took a wrong turn.",
        message: "The page may have moved, or the address may be incomplete. Let us get you back to TechNova.",
        icon: "fa-compass"
    });
});

// ==========================================
// CENTRALIZED ERROR HANDLING
// ==========================================

app.use((error, req, res, next) => {

    console.error("REQUEST ERROR:", {
        method: req.method,
        path: req.originalUrl,
        code: error.code,
        name: error.name,
        message: error.message,
        stack: error.stack
    });

    if (res.headersSent) {
        return next(error);
    }

    if (error.code === "LIMIT_FILE_SIZE") {
        return renderErrorPage(req, res, {
            code: 413,
            label: "Upload too large",
            title: "That file is too big.",
            message: "Please choose a smaller file or split the course material into manageable parts.",
            icon: "fa-file-arrow-up"
        });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
        return renderErrorPage(req, res, {
            code: 413,
            label: "Upload limit reached",
            title: "Too many files at once.",
            message: "Please reduce the number of files in this upload and try again.",
            icon: "fa-layer-group"
        });
    }

    if (error.code === "LIMIT_PART_COUNT") {
        return renderErrorPage(req, res, {
            code: 413,
            label: "Request too large",
            title: "There is too much in this request.",
            message: "Please simplify the form submission and try again.",
            icon: "fa-boxes-stacked"
        });
    }

    if (error.code === "LIMIT_FIELD_COUNT") {
        return renderErrorPage(req, res, {
            code: 413,
            label: "Form limit reached",
            title: "Too many form fields.",
            message: "Please remove extra fields and submit the form again.",
            icon: "fa-list-check"
        });
    }

    if (error.code === "EBADCSRFTOKEN") {
        return renderErrorPage(req, res, {
            code: 403,
            label: "Security check",
            title: "Your request could not be verified.",
            message: "Refresh the page and try again. Your session may have expired.",
            icon: "fa-shield-halved"
        });
    }

    if (
        error.name === "BlobError" ||
        error.message?.includes("BLOB_READ_WRITE_TOKEN")
    ) {
        return renderErrorPage(req, res, {
            code: 503,
            label: "Storage unavailable",
            title: "File storage is taking a pause.",
            message: "The service is temporarily unable to process uploaded files. Please try again shortly.",
            icon: "fa-cloud-arrow-up"
        });
    }

    if (
        error.name === "MongoNetworkError" ||
        error.message?.includes("ENOTFOUND") ||
        error.message?.includes("MongoDB")
    ) {
        return renderErrorPage(req, res, {
            code: 503,
            label: "Database unavailable",
            title: "The database connection is offline.",
            message: "TechNova could not reach MongoDB. Please verify the Atlas connection string in the environment settings and try again.",
            icon: "fa-database"
        });
    }

    return renderErrorPage(req, res, {
        code: 500,
        label: "Unexpected error",
        title: "Something needs our attention.",
        message: "We could not complete that request. Please try again, and contact support if the problem continues.",
        icon: "fa-triangle-exclamation"
    });
});


// Server

const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL) {
    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server Running On Port ${PORT}`);
            });
        })
        .catch(() => {
            process.exitCode = 1;
        });
} else {
    connectDB().catch(() => {
        process.exitCode = 1;
    });
}

module.exports = app;

