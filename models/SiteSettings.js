const mongoose = require("mongoose");

// =====================================================
// NAVIGATION ITEM
// =====================================================

const navItemSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true
        },

        path: {
            type: String,
            required: true,
            trim: true
        },

        visible: {
            type: Boolean,
            default: true
        },

        order: {
            type: Number,
            default: 0
        }
    },
    {
        _id: false
    }
);

const heroSchema = new mongoose.Schema(
    {
        badge: {
            type: String,
            default: ""
        },

        title: {
            type: String,
            default: ""
        },

        highlight: {
            type: String,
            default: ""
        },

        description: {
            type: String,
            default: ""
        },

        buttonText: {
            type: String,
            default: "Get Started"
        },

        buttonLink: {
            type: String,
            default: "/registration"
        },

        image: {
            type: String,
            default: ""
        },

        enabled: {
            type: Boolean,
            default: true
        }
    },
    {
        _id: false
    }
);


// =====================================================
// CORE VALUE
// =====================================================

const coreValueSchema = new mongoose.Schema(
    {
        icon: {
            type: String,
            default: "fa-solid fa-star"
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        _id: false
    }
);


// =====================================================
// DEFAULT HERO DATA
// =====================================================

const defaultHero = {
    badge: "",
    title: "",
    highlight: "",
    description: "",
    buttonText: "Get Started",
    buttonLink: "/registration",
    image: "",
    enabled: true
};


// =====================================================
// SITE SETTINGS SCHEMA
// =====================================================

const siteSettingsSchema = new mongoose.Schema(
    {

        // =================================================
        // PAGE HEROES
        // =================================================

        heroes: {

            home: {
                type: heroSchema,
                default: {
                    ...defaultHero,

                    badge: "TECHNOVA",

                    title:
                        "Elevate Your Business with",

                    highlight:
                        "Next-Gen Technology Solutions",

                    description:
                        "At TechNova, we bridge the gap between vision and reality. Our expert team delivers tailored IT solutions and practical technology learning opportunities.",

                    buttonText:
                        "Get Started",

                    buttonLink:
                        "/registration"
                }
            },


            about: {
                type: heroSchema,
                default: {
                    ...defaultHero,

                    badge:
                        "ABOUT TECHNOVA",

                    title:
                        "We Don't Just Write",

                    highlight:
                        "Code, We Architect the Future.",

                    description:
                        "TechNova is a skill learning and career development platform built to empower the next generation of technology professionals.",

                    buttonText:
                        "Get Started",

                    buttonLink:
                        "/registration"
                }
            },


            services: {
                type: heroSchema,
                default: {
                    ...defaultHero,

                    badge:
                        "OUR SERVICES",

                    title:
                        "Digital Excellence",

                    highlight:
                        "Tailored to Scale Your Ambition.",

                    description:
                        "Explore TechNova's courses and practical learning opportunities designed to build relevant technology skills.",

                    buttonText:
                        "Explore Courses",

                    buttonLink:
                        "#courses"
                }
            },


            portfolio: {
                type: heroSchema,
                default: {
                    ...defaultHero,

                    badge:
                        "OUR PORTFOLIO",

                    title:
                        "Showcasing",

                    highlight:
                        "Digital Excellence",

                    description:
                        "Explore projects, student success stories and practical work created through TechNova.",

                    buttonText:
                        "View Projects",

                    buttonLink:
                        "#portfolio"
                }
            },


            blog: {
                type: heroSchema,
                default: {
                    ...defaultHero,

                    badge:
                        "TECHNOVA JOURNAL",

                    title:
                        "The TechNova Journal:",

                    highlight:
                        "Decoding the Next Digital Era.",

                    description:
                        "Stay ahead with technology insights, practical tutorials, career advice and innovation trends.",

                    buttonText:
                        "Read Articles",

                    buttonLink:
                        "#blog"
                }
            },


            contact: {
                type: heroSchema,
                default: {
                    ...defaultHero,

                    badge:
                        "GET IN TOUCH",

                    title:
                        "Let's Build",

                    highlight:
                        "Something Great Together",

                    description:
                        "Tell us about your vision and we'll help you build a modern solution that scales.",

                    buttonText:
                        "Send a Message",

                    buttonLink:
                        "#contact-form"
                }
            }

        },

        // =================================================
        // HOME - WHY CHOOSE TECHNOVA
        // =================================================

        homeWhyChooseTitle: {
            type: String,

            default:
                "Why Choose TechNova?"
        },

        homeWhyChooseDescription: {
            type: String,

            default:
                "We provide everything you need to succeed in the tech industry."
        },

        homeWhyChooseItems: {
            type: [
                {
                    icon: {
                        type: String,
                        default: "fa-solid fa-star"
                    },

                    title: {
                        type: String,
                        default: ""
                    },

                    description: {
                        type: String,
                        default: ""
                    },

                    order: {
                        type: Number,
                        default: 0
                    }
                }
            ],

            default: [
                {
                    icon: "fas fa-book-open",
                    title: "Expert-Led Courses",
                    description:
                        "Learn from industry professionals with real-world experience.",
                    order: 1
                },

                {
                    icon: "fas fa-people-group",
                    title: "Community Support",
                    description:
                        "Join a growing community of learners and technology enthusiasts.",
                    order: 2
                },

                {
                    icon: "fa-solid fa-certificate",
                    title: "Certified Programs",
                    description:
                        "Earn certificates that demonstrate your learning achievements.",
                    order: 3
                },

                {
                    icon: "fa-solid fa-chart-line",
                    title: "Career Growth",
                    description:
                        "Build practical skills and prepare yourself for the technology industry.",
                    order: 4
                }
            ]
        },


        // =================================================
        // HOME - CTA
        // =================================================

        homeCtaTitle: {
            type: String,

            default:
                "Ready to Start Your Journey?"
        },

        homeCtaDescription: {
            type: String,

            default:
                "Join TechNova and start building practical technology skills for your future."
        },

        homeCtaButtonText: {
            type: String,

            default:
                "Get Started Today"
        },

        homeCtaButtonLink: {
            type: String,

            default:
                "/registration"
        },


        // =================================================
        // MISSION
        // =================================================

        missionTitle: {
            type: String,

            default:
                "Our Mission"
        },

        missionText: {
            type: String,

            default:
                "To empower individuals with the knowledge, skills, and confidence to excel in the ever-evolving world of technology."
        },


        // =================================================
        // VISION
        // =================================================

        visionTitle: {
            type: String,

            default:
                "Our Vision"
        },

        visionText: {
            type: String,

            default:
                "To become a trusted and innovative IT education platform recognized for excellence in teaching and transformative impact."
        },

        // =================================================
        // ABOUT - OUR STORY
        // =================================================

        storyTitle: {
            type: String,

            default:
                "Our Story"
        },

        storyText1: {
            type: String,

            default:
                "Founded in 2025, TechNova emerged from a simple vision: to make quality IT education accessible to everyone, regardless of their background or location."
        },

        storyText2: {
            type: String,

            default:
                "What started as a small training center has evolved into a comprehensive skill learning and career development platform."
        },

        storyText3: {
            type: String,

            default:
                "Our curriculum continues to evolve with modern technologies and industry requirements, helping learners build practical skills for the digital world."
        },

        storyImage: {
            type: String,

            default:
                "about.webp"
        },


        // =================================================
        // SERVICES - CTA
        // =================================================

        servicesCtaTitle: {
            type: String,

            default:
                "Ready to Build Your Future in Technology?"
        },

        servicesCtaDescription: {
            type: String,

            default:
                "Choose a course, develop practical skills, complete your learning journey and earn certificates through TechNova."
        },

        servicesCtaPrimaryText: {
            type: String,

            default:
                "Create Account"
        },

        servicesCtaPrimaryLink: {
            type: String,

            default:
                "/registration"
        },

        servicesCtaSecondaryText: {
            type: String,

            default:
                "Contact Us"
        },

        servicesCtaSecondaryLink: {
            type: String,

            default:
                "/contact"
        },

        // =================================================
        // PORTFOLIO - CTA
        // =================================================

        portfolioCtaTitle: {
            type: String,
            default: "Be Our Next Success Story"
        },

        portfolioCtaDescription: {
            type: String,
            default:
                "Join TechNova and start building your portfolio today."
        },

        portfolioCtaButtonText: {
            type: String,
            default: "Start Learning"
        },

        portfolioCtaButtonLink: {
            type: String,
            default: "/registration"
        },
        // =================================================
        // CONTACT INFORMATION
        // =================================================

        contactAddress: {
            type: String,

            default:
                "Govt. Graduate College, Sahiwal, Pakistan"
        },

        contactPhone: {
            type: String,

            default:
                "(040) 9200428 | +92 301 4823746"
        },

        contactEmail: {
            type: String,

            default:
                "ali@ggcs.edu.pk | info@technova.com"
        },

        contactHours: {
            type: String,

            default:
                "Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed"
        },


        // =================================================
        // CONTACT FAQS
        // =================================================

        contactFaqs: {
            type: [
                {
                    question: {
                        type: String,
                        trim: true,
                        default: ""
                    },

                    answer: {
                        type: String,
                        trim: true,
                        default: ""
                    },

                    visible: {
                        type: Boolean,
                        default: true
                    },

                    order: {
                        type: Number,
                        default: 0
                    }
                }
            ],

            default: [
                {
                    question:
                        "How do I enroll in a course?",

                    answer:
                        "You can enroll by visiting our Services page, selecting your desired course, and clicking the Enroll Now button.",

                    visible: true,

                    order: 1
                },

                {
                    question:
                        "Do you offer flexible payment plans?",

                    answer:
                        "Yes, TechNova offers flexible payment options and installment plans for selected courses.",

                    visible: true,

                    order: 2
                },

                {
                    question:
                        "What is your refund policy?",

                    answer:
                        "Please contact our support team for the latest refund and course cancellation policy.",

                    visible: true,

                    order: 3
                },

                {
                    question:
                        "Do you provide job placement assistance?",

                    answer:
                        "Yes, TechNova provides career guidance and job preparation support to help learners move toward professional opportunities.",

                    visible: true,

                    order: 4
                }
            ]
        },
        // =================================================
        // CORE VALUES
        // =================================================

        coreValues: {

            type: [coreValueSchema],

            default: [

                {
                    icon:
                        "fa-solid fa-award",

                    title:
                        "Excellence",

                    description:
                        "We are committed to delivering high-quality education and training."
                },

                {
                    icon:
                        "fa-solid fa-users",

                    title:
                        "Community",

                    description:
                        "We foster a supportive learning environment where everyone can thrive."
                },

                {
                    icon:
                        "fa-solid fa-bullseye",

                    title:
                        "Innovation",

                    description:
                        "We continuously evolve with industry trends and technologies."
                }

            ]

        },


        // =================================================
        // NAVIGATION
        // =================================================

        navigation: {

            type: [navItemSchema],

            default: [

                {
                    label:
                        "Home",

                    path:
                        "/",

                    visible:
                        true,

                    order:
                        1
                },

                {
                    label:
                        "About Us",

                    path:
                        "/about",

                    visible:
                        true,

                    order:
                        2
                },

                {
                    label:
                        "Services",

                    path:
                        "/services",

                    visible:
                        true,

                    order:
                        3
                },

                {
                    label:
                        "Portfolio",

                    path:
                        "/portfolio",

                    visible:
                        true,

                    order:
                        4
                },

                {
                    label:
                        "Blog",

                    path:
                        "/blog",

                    visible:
                        true,

                    order:
                        5
                },

                {
                    label:
                        "Contact",

                    path:
                        "/contact",

                    visible:
                        true,

                    order:
                        6
                }

            ]

        },


        // =================================================
        // FOOTER
        // =================================================

        footerTitle: {
            type: String,

            default:
                "TechNova"
        },

        footerDescription: {
            type: String,

            default:
                "Empowering the next generation of IT professionals with cutting-edge courses and hands-on training."
        },

        footerAddress: {
            type: String,

            default:
                "Govt. Graduate College, Sahiwal"
        },

        footerPhone: {
            type: String,

            default:
                "+92 301 4823746"
        },

        footerEmail: {
            type: String,

            default:
                "ali@ggcs.edu.pk"
        },


        // =================================================
        // SOCIAL LINKS
        // =================================================

        facebookUrl: {
            type: String,
            default: ""
        },

        twitterUrl: {
            type: String,
            default: ""
        },

        linkedinUrl: {
            type: String,
            default: ""
        },

        instagramUrl: {
            type: String,
            default: ""
        }

    },

    {
        timestamps: true
    }
);


module.exports =
    mongoose.model(
        "SiteSettings",
        siteSettingsSchema
    );