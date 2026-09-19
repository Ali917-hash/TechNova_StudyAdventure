const Portfolio = require("../models/Portfolio");
const SiteSettings = require("../models/SiteSettings");


// ==========================================
// CREATE SLUG
// ==========================================

function createSlug(title) {

    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

}


// ==========================================
// GENERATE UNIQUE SLUG
// ==========================================

async function generateUniqueSlug(
    title,
    existingId = null
) {

    const baseSlug =
        createSlug(title);

    let slug =
        baseSlug;

    let counter =
        1;


    while (true) {

        const query = {
            slug
        };


        if (existingId) {

            query._id = {
                $ne: existingId
            };

        }


        const existing =
            await Portfolio.findOne(
                query
            );


        if (!existing) {

            return slug;

        }


        counter++;

        slug =
            `${baseSlug}-${counter}`;

    }

}


// ==========================================
// CONVERT TECHNOLOGIES TEXT TO ARRAY
// ==========================================

function parseTechnologies(value) {

    if (!value) {

        return [];

    }


    return value
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);

}


// ==========================================
// PUBLIC - PORTFOLIO PAGE
// ==========================================

exports.portfolio = async (req, res) => {

    try {

        const category =
            req.query.category
                ? req.query.category.trim()
                : "";

        const search =
            req.query.search
                ? req.query.search.trim()
                : "";


        const query = {

            isPublished: true

        };


        if (category) {

            query.category =
                category;

        }


        if (search) {

            query.$or = [

                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    category: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    technologies: {
                        $regex: search,
                        $options: "i"
                    }
                }

            ];

        }


        const projects =
            await Portfolio
                .find(query)
                .sort({
                    isFeatured: -1,
                    order: 1,
                    createdAt: -1
                })
                .lean();


        const successStories =
            await Portfolio
                .find({

                    type: "success-story",

                    isPublished: true

                })
                .sort({
                    isFeatured: -1,
                    order: 1,
                    createdAt: -1
                })
                .lean();


        const categories =
            await Portfolio.distinct(
                "category",
                {
                    isPublished: true
                }
            );


        // ==========================================
        // IMPACT STATISTICS
        // ==========================================

        const completedProjects =
            await Portfolio.countDocuments({
                isPublished: true,
                type: "project"
            });


        const hiringPartners =
            await Portfolio.countDocuments({
                isPublished: true,
                type: "success-story"
            });


        const totalPublished =
            projects.length;


        res.render(
            "portfolio",
            {

                user:
                    req.session.user || null,

                projects,

                successStories,

                categories,

                selectedCategory:
                    category,

                search,

                completedProjects,

                hiringPartners,

                totalPublished

            }
        );


    } catch (error) {

        console.error(
            "PUBLIC PORTFOLIO ERROR:",
            error
        );


        res.status(500).send(
            "Unable to load portfolio."
        );

    }

};


// ==========================================
// PUBLIC - PROJECT DETAILS
// ==========================================

exports.projectDetails = async (
    req,
    res
) => {

    try {

        const project =
            await Portfolio.findOne({

                slug:
                    req.params.slug,

                isPublished: true

            }).lean();


        if (!project) {

            return res.status(404).send(
                "Project not found."
            );

        }


        const relatedProjects =
            await Portfolio.find({

                _id: {
                    $ne: project._id
                },

                category:
                    project.category,

                isPublished: true

            })
            .sort({
                createdAt: -1
            })
            .limit(3)
            .lean();


        res.render(
            "portfolioDetails",
            {

                user:
                    req.session.user || null,

                project,

                relatedProjects

            }
        );


    } catch (error) {

        console.error(
            "PROJECT DETAILS ERROR:",
            error
        );


        res.status(500).send(
            "Unable to load project."
        );

    }

};


// ==========================================
// ADMIN - ALL PORTFOLIO
// ==========================================

exports.adminPortfolio =
    async (req, res) => {

        try {

            const projects =
                await Portfolio
                    .find()
                    .sort({
                        order: 1,
                        createdAt: -1
                    });


            const totalProjects =
                await Portfolio.countDocuments();


            const publishedProjects =
                await Portfolio.countDocuments({

                    isPublished:
                        true

                });


            const draftProjects =
                await Portfolio.countDocuments({

                    isPublished:
                        false

                });


            const featuredProjects =
                await Portfolio.countDocuments({

                    isFeatured:
                        true

                });


            const successStories =
                await Portfolio.countDocuments({

                    type:
                        "success-story"

                });

            const settings =
                await SiteSettings.findOne() ||
                await SiteSettings.create({});


            res.render(
                "admin/portfolio",
                {

                    user:
                        req.session.user,

                    projects,

                    totalProjects,

                    publishedProjects,

                    draftProjects,

                    featuredProjects,

                    successStories,

                    settings,

                    settingsSuccess:
                        req.query.settingsSuccess === "1",

                    currentPage:
                        "portfolio"

                }
            );


        } catch (error) {

            console.error(
                "ADMIN PORTFOLIO ERROR:",
                error
            );


            res.status(500).send(
                "Unable to load portfolio."
            );

        }

    };


// ==========================================
// ADMIN - SHOW ADD PROJECT
// ==========================================

exports.showAddPortfolio =
    (req, res) => {

        res.render(
            "admin/addPortfolio",
            {

                user:
                    req.session.user,

                currentPage:
                    "portfolio"

            }
        );

    };


// ==========================================
// ADMIN - ADD PROJECT
// ==========================================

exports.addPortfolio =
    async (req, res) => {

        try {

            const {
                title,
                category,
                description,
                content,
                technologies,
                studentName,
                studentRole,
                quote,
                projectUrl,
                githubUrl,
                isPublished,
                isFeatured,
                type,
                order
            } = req.body;


            if (
                !title ||
                !category ||
                !description
            ) {

                return res.status(400).send(
                    "Please fill all required fields."
                );

            }


            const slug =
                await generateUniqueSlug(
                    title
                );


            const image =
                req.file
                    ? req.file.filename
                    : "default-project.jpg";


            await Portfolio.create({

                title,

                slug,

                category,

                description,

                content:
                    content || "",

                image,

                technologies:
                    parseTechnologies(
                        technologies
                    ),

                studentName:
                    studentName || "",

                studentRole:
                    studentRole || "",

                quote:
                    quote || "",

                projectUrl:
                    projectUrl || "",

                githubUrl:
                    githubUrl || "",

                isPublished:
                    isPublished === "true",

                isFeatured:
                    isFeatured === "true",

                type:
                    type === "success-story"
                        ? "success-story"
                        : "project",

                order:
                    Number(order) || 0

            });


            res.redirect(
                "/admin/portfolio"
            );


        } catch (error) {

            console.error(
                "ADD PORTFOLIO ERROR:",
                error
            );


            res.status(500).send(
                "Unable to add project: " +
                error.message
            );

        }

    };


// ==========================================
// ADMIN - SHOW EDIT PROJECT
// ==========================================

exports.showEditPortfolio =
    async (req, res) => {

        try {

            const project =
                await Portfolio.findById(
                    req.params.id
                );


            if (!project) {

                return res.status(404).send(
                    "Project not found."
                );

            }


            res.render(
                "admin/editPortfolio",
                {

                    user:
                        req.session.user,

                    project,

                    currentPage:
                        "portfolio"

                }
            );


        } catch (error) {

            console.error(
                "EDIT PORTFOLIO PAGE ERROR:",
                error
            );


            res.status(500).send(
                "Unable to open project."
            );

        }

    };


// ==========================================
// ADMIN - UPDATE PROJECT
// ==========================================

exports.updatePortfolio =
    async (req, res) => {

        try {

            const project =
                await Portfolio.findById(
                    req.params.id
                );


            if (!project) {

                return res.status(404).send(
                    "Project not found."
                );

            }


            const {
                title,
                category,
                description,
                content,
                technologies,
                studentName,
                studentRole,
                quote,
                projectUrl,
                githubUrl,
                isPublished,
                isFeatured,
                type,
                order
            } = req.body;


            const titleChanged =
                title &&
                title !== project.title;


            project.title =
                title;

            project.category =
                category;

            project.description =
                description;

            project.content =
                content || "";

            project.technologies =
                parseTechnologies(
                    technologies
                );

            project.studentName =
                studentName || "";

            project.studentRole =
                studentRole || "";

            project.quote =
                quote || "";

            project.projectUrl =
                projectUrl || "";

            project.githubUrl =
                githubUrl || "";

            project.isPublished =
                isPublished === "true";

            project.isFeatured =
                isFeatured === "true";

            project.type =
                type === "success-story"
                    ? "success-story"
                    : "project";

            project.order =
                Number(order) || 0;


            if (titleChanged) {

                project.slug =
                    await generateUniqueSlug(
                        title,
                        project._id
                    );

            }


            if (req.file) {

                project.image =
                    req.file.filename;

            }


            await project.save();


            res.redirect(
                "/admin/portfolio"
            );


        } catch (error) {

            console.error(
                "UPDATE PORTFOLIO ERROR:",
                error
            );


            res.status(500).send(
                "Unable to update project: " +
                error.message
            );

        }

    };


// ==========================================
// ADMIN - DELETE PROJECT
// ==========================================

exports.deletePortfolio =
    async (req, res) => {

        try {

            const project =
                await Portfolio.findById(
                    req.params.id
                );


            if (!project) {

                return res.status(404).send(
                    "Project not found."
                );

            }


            await Portfolio.findByIdAndDelete(
                req.params.id
            );


            res.redirect(
                "/admin/portfolio"
            );


        } catch (error) {

            console.error(
                "DELETE PORTFOLIO ERROR:",
                error
            );


            res.status(500).send(
                "Unable to delete project."
            );

        }

    };


// ==========================================
// ADMIN - TOGGLE PUBLISHED
// ==========================================

exports.togglePublished =
    async (req, res) => {

        try {

            const project =
                await Portfolio.findById(
                    req.params.id
                );


            if (!project) {

                return res.status(404).send(
                    "Project not found."
                );

            }


            project.isPublished =
                !project.isPublished;


            await project.save();


            res.redirect(
                "/admin/portfolio"
            );


        } catch (error) {

            console.error(
                "TOGGLE PORTFOLIO ERROR:",
                error
            );


            res.status(500).send(
                "Unable to update project status."
            );

        }

    };


// ==========================================
// ADMIN - TOGGLE FEATURED
// ==========================================

exports.toggleFeatured =
    async (req, res) => {

        try {

            const project =
                await Portfolio.findById(
                    req.params.id
                );


            if (!project) {

                return res.status(404).send(
                    "Project not found."
                );

            }


            project.isFeatured =
                !project.isFeatured;


            await project.save();


            res.redirect(
                "/admin/portfolio"
            );


        } catch (error) {

            console.error(
                "TOGGLE PORTFOLIO FEATURED ERROR:",
                error
            );


            res.status(500).send(
                "Unable to update featured status."
            );

        }

    };