const SiteSettings =
    require("../models/SiteSettings");
const TeamMember =
    require("../models/TeamMember");


// =====================================================
// AVAILABLE HERO PAGES
// =====================================================

const HERO_PAGES = [
    "home",
    "about",
    "services",
    "portfolio",
    "blog",
    "contact"
];


// =====================================================
// BOOLEAN HELPER
// =====================================================

function parseBoolean(
    value,
    defaultValue = true
) {

    if (
        value === true ||
        value === "true" ||
        value === "1" ||
        value === "on"
    ) {
        return true;
    }


    if (
        value === false ||
        value === "false" ||
        value === "0" ||
        value === "off"
    ) {
        return false;
    }


    return defaultValue;
}


// =====================================================
// GET / CREATE SETTINGS
// =====================================================

async function getSettings() {

    let settings =
        await SiteSettings.findOne();


    if (!settings) {

        settings =
            await SiteSettings.create({});

    }


    return settings;
}


// =====================================================
// ADMIN - SETTINGS PAGE
// =====================================================

exports.settingsPage = async (
    req,
    res
) => {

    try {

        const settings =
            await getSettings();


        const success =
            req.query.success === "1";


        res.render(
            "admin/siteSettings",
            {

                user:
                    req.session.user,

                settings,

                success,

                currentPage:
                    "site-settings"

            }
        );


    } catch (error) {

        console.error(
            "SITE SETTINGS PAGE ERROR:",
            error
        );


        res.status(500).send(
            "Unable to load website settings."
        );

    }

};


// =====================================================
// ADMIN - UPDATE SETTINGS
// =====================================================

exports.updateSettings = async (
    req,
    res
) => {

    try {

        const {
            heroPage,
            heroBadge,
            heroTitle,
            heroHighlight,
            heroDescription,
            heroButtonText,
            heroButtonLink,
            heroEnabled,

            navHomeLabel,
            navHomeVisible,
            navAboutLabel,
            navAboutVisible,
            navServicesLabel,
            navServicesVisible,
            navPortfolioLabel,
            navPortfolioVisible,
            navBlogLabel,
            navBlogVisible,
            navContactLabel,
            navContactVisible,

            homeWhyChooseTitle,
            homeWhyChooseDescription,

            homeFeature1Icon,
            homeFeature1Title,
            homeFeature1Description,

            homeFeature2Icon,
            homeFeature2Title,
            homeFeature2Description,

            homeFeature3Icon,
            homeFeature3Title,
            homeFeature3Description,

            homeFeature4Icon,
            homeFeature4Title,
            homeFeature4Description,

            homeCtaTitle,
            homeCtaDescription,
            homeCtaButtonText,
            homeCtaButtonLink,

            storyTitle,
            storyText1,
            storyText2,
            storyText3,

            missionTitle,
            missionText,

            visionTitle,
            visionText,

            coreValue1Icon,
            coreValue1Title,
            coreValue1Description,
            coreValue2Icon,
            coreValue2Title,
            coreValue2Description,
            coreValue3Icon,
            coreValue3Title,
            coreValue3Description,

            servicesCtaTitle,
            servicesCtaDescription,
            servicesCtaPrimaryText,
            servicesCtaPrimaryLink,
            servicesCtaSecondaryText,
            servicesCtaSecondaryLink,

            portfolioCtaTitle,
            portfolioCtaDescription,
            portfolioCtaButtonText,
            portfolioCtaButtonLink,

            contactAddress,
            contactPhone,
            contactEmail,
            contactHours,

            faq1Question,
            faq1Answer,
            faq1Visible,

            faq2Question,
            faq2Answer,
            faq2Visible,

            faq3Question,
            faq3Answer,
            faq3Visible,

            faq4Question,
            faq4Answer,
            faq4Visible,

            footerTitle,
            footerDescription,
            footerAddress,
            footerPhone,
            footerEmail,

            facebookUrl,
            twitterUrl,
            linkedinUrl,
            instagramUrl

        } = req.body;


        const settings =
            await getSettings();

        // =================================================
        // HERO UPDATE
        // =================================================

        if (
            HERO_PAGES.includes(
                heroPage
            )
        ) {

            const currentHero =
                settings.heroes?.[heroPage]
                || {};


            const updatedHero = {

                badge:
                    heroBadge || "",

                title:
                    heroTitle || "",

                highlight:
                    heroHighlight || "",

                description:
                    heroDescription || "",

                buttonText:
                    heroButtonText ||
                    "Get Started",

                buttonLink:
                    heroButtonLink ||
                    "/registration",

                image:
                    currentHero.image || "",

                enabled:
                    parseBoolean(
                        heroEnabled,
                        true
                    )

            };

            // =================================================
            // HERO IMAGE
            // =================================================

            if (
                req.files &&
                req.files.heroImage &&
                req.files.heroImage.length > 0
            ) {

                updatedHero.image =
                    req.files.heroImage[0].filename;

            }

            settings.set(
                `heroes.${heroPage}`,
                updatedHero
            );

        }

        // =================================================
        // HOME - WHY CHOOSE TECHNOVA
        // =================================================

        settings.homeWhyChooseTitle =
            homeWhyChooseTitle ||
            "Why Choose TechNova?";

        settings.homeWhyChooseDescription =
            homeWhyChooseDescription ||
            "We provide everything you need to succeed in the tech industry.";

        settings.homeWhyChooseItems = [

            {
                icon:
                    homeFeature1Icon ||
                    "fas fa-book-open",

                title:
                    homeFeature1Title ||
                    "Expert-Led Courses",

                description:
                    homeFeature1Description ||
                    "Learn from industry professionals with real-world experience.",

                order: 1
            },

            {
                icon:
                    homeFeature2Icon ||
                    "fas fa-people-group",

                title:
                    homeFeature2Title ||
                    "Community Support",

                description:
                    homeFeature2Description ||
                    "Join a growing community of learners and technology enthusiasts.",

                order: 2
            },

            {
                icon:
                    homeFeature3Icon ||
                    "fa-solid fa-certificate",

                title:
                    homeFeature3Title ||
                    "Certified Programs",

                description:
                    homeFeature3Description ||
                    "Earn certificates that demonstrate your learning achievements.",

                order: 3
            },

            {
                icon:
                    homeFeature4Icon ||
                    "fa-solid fa-chart-line",

                title:
                    homeFeature4Title ||
                    "Career Growth",

                description:
                    homeFeature4Description ||
                    "Build practical skills and prepare yourself for the technology industry.",

                order: 4
            }

        ];


        // =================================================
        // HOME - CTA
        // =================================================

        settings.homeCtaTitle =
            homeCtaTitle ||
            "Ready to Start Your Journey?";

        settings.homeCtaDescription =
            homeCtaDescription ||
            "Join TechNova and start building practical technology skills for your future.";

        settings.homeCtaButtonText =
            homeCtaButtonText ||
            "Get Started Today";

        settings.homeCtaButtonLink =
            homeCtaButtonLink ||
            "/registration";

        // =================================================
        // ABOUT - OUR STORY
        // =================================================

        settings.storyTitle =
            storyTitle ||
            "Our Story";


        settings.storyText1 =
            storyText1 ||
            "";


        settings.storyText2 =
            storyText2 ||
            "";


        settings.storyText3 =
            storyText3 ||
            "";

        // =================================================
        // STORY IMAGE
        // =================================================

        if (
            req.files &&
            req.files.storyImage &&
            req.files.storyImage.length > 0
        ) {

            settings.storyImage =
                req.files.storyImage[0].filename;

        }

        // =================================================
        // MISSION
        // =================================================

        settings.missionTitle =
            missionTitle ||
            "Our Mission";


        settings.missionText =
            missionText ||
            "";


        // =================================================
        // VISION
        // =================================================

        settings.visionTitle =
            visionTitle ||
            "Our Vision";


        settings.visionText =
            visionText ||
            "";

        // =================================================
        // CORE VALUES
        // =================================================

        settings.coreValues = [

            {

                icon:
                    coreValue1Icon ||
                    "fa-solid fa-award",

                title:
                    coreValue1Title ||
                    "Excellence",

                description:
                    coreValue1Description ||
                    ""

            },


            {

                icon:
                    coreValue2Icon ||
                    "fa-solid fa-users",

                title:
                    coreValue2Title ||
                    "Community",

                description:
                    coreValue2Description ||
                    ""

            },


            {

                icon:
                    coreValue3Icon ||
                    "fa-solid fa-bullseye",

                title:
                    coreValue3Title ||
                    "Innovation",

                description:
                    coreValue3Description ||
                    ""

            }

        ];
        
        // =================================================
        // SERVICES - CTA
        // =================================================

        settings.servicesCtaTitle =
            servicesCtaTitle ||
            "Ready to Build Your Future in Technology?";


        settings.servicesCtaDescription =
            servicesCtaDescription ||
            "Choose a course, develop practical skills, complete your learning journey and earn certificates through TechNova.";

        settings.servicesCtaPrimaryText =
            servicesCtaPrimaryText ||
            "Create Account";

        settings.servicesCtaPrimaryLink =
            servicesCtaPrimaryLink ||
            "/registration";

        settings.servicesCtaSecondaryText =
            servicesCtaSecondaryText ||
            "Contact Us";

        settings.servicesCtaSecondaryLink =
            servicesCtaSecondaryLink ||
            "/contact";
        
        // =================================================
        // PORTFOLIO - CTA
        // =================================================

        settings.portfolioCtaTitle =
            portfolioCtaTitle ||
            "Be Our Next Success Story";

        settings.portfolioCtaDescription =
            portfolioCtaDescription ||
            "Join TechNova and start building your portfolio today.";

        settings.portfolioCtaButtonText =
            portfolioCtaButtonText ||
            "Start Learning";

        settings.portfolioCtaButtonLink =
            portfolioCtaButtonLink ||
            "/registration";
        
        // =================================================
        // CONTACT INFORMATION
        // =================================================

        settings.contactAddress =
            contactAddress ||
            "Govt. Graduate College, Sahiwal, Pakistan";

        settings.contactPhone =
            contactPhone ||
            "(040) 9200428 | +92 301 4823746";

        settings.contactEmail =
            contactEmail ||
            "ali@ggcs.edu.pk | info@technova.com";

        settings.contactHours =
            contactHours ||
            "Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed";

        // =================================================
        // CONTACT FAQS
        // =================================================

        settings.contactFaqs = [

            {
                question:
                    faq1Question || "",

                answer:
                    faq1Answer || "",

                visible:
                    parseBoolean(
                        faq1Visible,
                        true
                    ),

                order: 1
            },

            {
                question:
                    faq2Question || "",

                answer:
                    faq2Answer || "",

                visible:
                    parseBoolean(
                        faq2Visible,
                        true
                    ),

                order: 2
            },

            {
                question:
                    faq3Question || "",

                answer:
                    faq3Answer || "",

                visible:
                    parseBoolean(
                        faq3Visible,
                        true
                    ),

                order: 3
            },

            {
                question:
                    faq4Question || "",

                answer:
                    faq4Answer || "",

                visible:
                    parseBoolean(
                        faq4Visible,
                        true
                    ),

                order: 4
            }

        ];

        // =================================================
        // NAVIGATION
        // =================================================

        settings.navigation = [

            {

                label:
                    navHomeLabel ||
                    "Home",

                path:
                    "/",

                visible:
                    parseBoolean(
                        navHomeVisible,
                        true
                    ),

                order:
                    1

            },


            {

                label:
                    navAboutLabel ||
                    "About Us",

                path:
                    "/about",

                visible:
                    parseBoolean(
                        navAboutVisible,
                        true
                    ),

                order:
                    2

            },


            {

                label:
                    navServicesLabel ||
                    "Services",

                path:
                    "/services",

                visible:
                    parseBoolean(
                        navServicesVisible,
                        true
                    ),

                order:
                    3

            },


            {

                label:
                    navPortfolioLabel ||
                    "Portfolio",

                path:
                    "/portfolio",

                visible:
                    parseBoolean(
                        navPortfolioVisible,
                        true
                    ),

                order:
                    4

            },


            {

                label:
                    navBlogLabel ||
                    "Blog",

                path:
                    "/blog",

                visible:
                    parseBoolean(
                        navBlogVisible,
                        true
                    ),

                order:
                    5

            },


            {

                label:
                    navContactLabel ||
                    "Contact",

                path:
                    "/contact",

                visible:
                    parseBoolean(
                        navContactVisible,
                        true
                    ),

                order:
                    6

            }

        ];


        // =================================================
        // FOOTER
        // =================================================

        settings.footerTitle =
            footerTitle ||
            "TechNova";


        settings.footerDescription =
            footerDescription ||
            "";


        settings.footerAddress =
            footerAddress ||
            "";


        settings.footerPhone =
            footerPhone ||
            "";


        settings.footerEmail =
            footerEmail ||
            "";


        // =================================================
        // SOCIAL
        // =================================================

        settings.facebookUrl =
            facebookUrl ||
            "";


        settings.twitterUrl =
            twitterUrl ||
            "";


        settings.linkedinUrl =
            linkedinUrl ||
            "";


        settings.instagramUrl =
            instagramUrl ||
            "";


        // =================================================
        // DEBUG
        // =================================================

        console.log(
            "================================"
        );

        console.log(
            "WEBSITE SETTINGS UPDATED"
        );

        console.log(
            "HERO PAGE:",
            heroPage
        );

        console.log(
            "NAVIGATION:",
            settings.navigation
        );

        console.log(
            "HERO:",
            heroPage
                ? settings.heroes?.[heroPage]
                : "Not changed"
        );

        console.log(
            "================================"
        );


        // =================================================
        // SAVE
        // =================================================

        await settings.save();


        return res.redirect(
            "/admin/site-settings?success=1"
        );


    } catch (error) {

        console.error(
            "UPDATE SITE SETTINGS ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to update website settings."
        );

    }

};

const SETTINGS_PAGES = new Set([
    "home",
    "about",
    "services",
    "portfolio",
    "blog",
    "contact",
    "footer"
]);

exports.pageSettings = async (req, res) => {
    if (!SETTINGS_PAGES.has(req.params.page)) {
        return res.status(404).send("Settings page not found.");
    }

    try {
        const settings = await getSettings();

        let teamData = {};

        if (req.params.page === "about") {
            const [teamMembers, totalMembers, publishedMembers, hiddenMembers] =
                await Promise.all([
                    TeamMember.find().sort({ order: 1, createdAt: 1 }).lean(),
                    TeamMember.countDocuments(),
                    TeamMember.countDocuments({ isPublished: true }),
                    TeamMember.countDocuments({ isPublished: false })
                ]);

            teamData = {
                teamMembers,
                totalMembers,
                publishedMembers,
                hiddenMembers
            };
        }

        return res.render("admin/siteSettingsPage", {
            user: req.session.user,
            settings,
            page: req.params.page,
            success: req.query.success === "1",
            currentPage: `settings-${req.params.page}`,
            ...teamData
        });
    } catch (error) {
        console.error("SITE SETTINGS PAGE ERROR:", error);
        return res.status(500).send("Unable to load website settings.");
    }
};

exports.updatePageSettings = async (req, res) => {
    const page = req.params.page;

    if (!SETTINGS_PAGES.has(page)) {
        return res.status(404).send("Settings page not found.");
    }

    try {
        const settings = await getSettings();
        const body = req.body;
        const files = req.files || {};

        if (page === "home") {
            const hero = settings.heroes?.home?.toObject?.() || settings.heroes?.home || {};
            const image = files.heroImage?.[0]?.filename || hero.image || "";

            if (files.brandLogo?.[0]?.filename) {
                settings.brandLogo = files.brandLogo[0].filename;
            }

            settings.set("heroes.home", {
                ...hero,
                badge: body.heroBadge || "",
                title: body.heroTitle || "",
                highlight: body.heroHighlight || "",
                description: body.heroDescription || "",
                buttonText: body.heroButtonText || "Get Started",
                buttonLink: body.heroButtonLink || "/registration",
                image,
                enabled: parseBoolean(body.heroEnabled, true)
            });

            settings.homeWhyChooseTitle = body.homeWhyChooseTitle || "Why Choose TechNova?";
            settings.homeWhyChooseDescription = body.homeWhyChooseDescription || "";
            settings.homeWhyChooseItems = [1, 2, 3, 4].map((number) => ({
                icon: body[`homeFeature${number}Icon`] || "fa-solid fa-star",
                title: body[`homeFeature${number}Title`] || "",
                description: body[`homeFeature${number}Description`] || "",
                order: number
            }));
            settings.homeCtaTitle = body.homeCtaTitle || "Ready to Start Your Journey?";
            settings.homeCtaDescription = body.homeCtaDescription || "";
            settings.homeCtaButtonText = body.homeCtaButtonText || "Get Started Today";
            settings.homeCtaButtonLink = body.homeCtaButtonLink || "/registration";
            settings.navigation = [
                ["/", "navHome"],
                ["/about", "navAbout"],
                ["/services", "navServices"],
                ["/portfolio", "navPortfolio"],
                ["/blog", "navBlog"],
                ["/contact", "navContact"]
            ].map(([path, key], index) => ({
                path,
                label: body[`${key}Label`] || path,
                visible: parseBoolean(body[`${key}Visible`], true),
                order: index + 1
            }));
        }

        if (page === "about") {
            const hero = settings.heroes?.about?.toObject?.() || settings.heroes?.about || {};
            settings.set("heroes.about", {
                ...hero,
                badge: body.heroBadge || "",
                title: body.heroTitle || "",
                highlight: body.heroHighlight || "",
                description: body.heroDescription || "",
                buttonText: body.heroButtonText || "Get Started",
                buttonLink: body.heroButtonLink || "/registration",
                image: files.heroImage?.[0]?.filename || hero.image || "",
                enabled: parseBoolean(body.heroEnabled, true)
            });
            settings.storyTitle = body.storyTitle || "Our Story";
            settings.storyText1 = body.storyText1 || "";
            settings.storyText2 = body.storyText2 || "";
            settings.storyText3 = body.storyText3 || "";
            settings.storyImage = files.storyImage?.[0]?.filename || settings.storyImage || "about.webp";
            settings.missionTitle = body.missionTitle || "Our Mission";
            settings.missionText = body.missionText || "";
            settings.visionTitle = body.visionTitle || "Our Vision";
            settings.visionText = body.visionText || "";
            settings.coreValues = [1, 2, 3].map((number) => ({
                icon: body[`coreValue${number}Icon`] || "fa-solid fa-star",
                title: body[`coreValue${number}Title`] || "",
                description: body[`coreValue${number}Description`] || ""
            }));
        }

        if (["services", "portfolio", "blog", "contact"].includes(page)) {
            const hero = settings.heroes?.[page]?.toObject?.() || settings.heroes?.[page] || {};
            settings.set(`heroes.${page}`, {
                ...hero,
                badge: body.heroBadge || "",
                title: body.heroTitle || "",
                highlight: body.heroHighlight || "",
                description: body.heroDescription || "",
                buttonText: body.heroButtonText || "Get Started",
                buttonLink: body.heroButtonLink || "/registration",
                image: files.heroImage?.[0]?.filename || hero.image || "",
                enabled: parseBoolean(body.heroEnabled, true)
            });
        }

        if (page === "footer") {
            settings.navigation = [
                ["/", "navHome"],
                ["/about", "navAbout"],
                ["/services", "navServices"],
                ["/portfolio", "navPortfolio"],
                ["/blog", "navBlog"],
                ["/contact", "navContact"]
            ].map(([path, key], index) => ({
                path,
                label: body[`${key}Label`] || (path === "/" ? "Home" : path === "/about" ? "About Us" : path === "/services" ? "Services" : path === "/portfolio" ? "Portfolio" : path === "/blog" ? "Blog" : "Contact"),
                visible: parseBoolean(body[`${key}Visible`], true),
                order: index + 1
            }));

            settings.footerTitle = body.footerTitle || "TechNova";
            settings.footerDescription = body.footerDescription || "";
            settings.footerAddress = body.footerAddress || "";
            settings.footerPhone = body.footerPhone || "";
            settings.footerEmail = body.footerEmail || "";
            settings.facebookUrl = body.facebookUrl || "";
            settings.twitterUrl = body.twitterUrl || "";
            settings.linkedinUrl = body.linkedinUrl || "";
            settings.instagramUrl = body.instagramUrl || "";
        }

        if (page === "services") {
            settings.servicesCtaTitle = body.servicesCtaTitle || "Ready to Build Your Future in Technology?";
            settings.servicesCtaDescription = body.servicesCtaDescription || "";
            settings.servicesCtaPrimaryText = body.servicesCtaPrimaryText || "Create Account";
            settings.servicesCtaPrimaryLink = body.servicesCtaPrimaryLink || "/registration";
            settings.servicesCtaSecondaryText = body.servicesCtaSecondaryText || "Contact Us";
            settings.servicesCtaSecondaryLink = body.servicesCtaSecondaryLink || "/contact";
        }

        if (page === "portfolio") {
            settings.portfolioCtaTitle = body.portfolioCtaTitle || "Be Our Next Success Story";
            settings.portfolioCtaDescription = body.portfolioCtaDescription || "";
            settings.portfolioCtaButtonText = body.portfolioCtaButtonText || "Start Learning";
            settings.portfolioCtaButtonLink = body.portfolioCtaButtonLink || "/registration";
        }

        if (page === "contact") {
            settings.contactAddress = body.contactAddress || "";
            settings.contactPhone = body.contactPhone || "";
            settings.contactEmail = body.contactEmail || "";
            settings.contactHours = body.contactHours || "";
            settings.contactFaqs = [1, 2, 3, 4].map((number) => ({
                question: body[`faq${number}Question`] || "",
                answer: body[`faq${number}Answer`] || "",
                visible: parseBoolean(body[`faq${number}Visible`], true),
                order: number
            }));
        }

        await settings.save();
        if (page === "portfolio") {
            return res.redirect("/admin/portfolio?settingsSuccess=1");
        }

        if (page === "blog") {
            return res.redirect("/admin/blogs?settingsSuccess=1");
        }

        return res.redirect(`/admin/site-settings/${page}?success=1`);
    } catch (error) {
        console.error("UPDATE PAGE SETTINGS ERROR:", error);
        return res.status(500).send("Unable to update page settings.");
    }
};