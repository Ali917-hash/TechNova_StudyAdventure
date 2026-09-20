const Blog = require("../models/Blog");
const SiteSettings = require("../models/SiteSettings");
const BlogView = require("../models/BlogView");
const BlogReaction = require("../models/BlogReaction");
const BlogComment = require("../models/BlogComment");

function getVisitorKey(req) {

    const userId =
        req.session?.user?._id ||
        req.session?.user?.id;

    return userId
        ? `user:${userId}`
        : `session:${req.sessionID}`;

}


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

async function generateUniqueSlug(title, existingId = null) {
    const baseSlug = createSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug };

        if (existingId) {
            query._id = { $ne: existingId };
        }

        if (!await Blog.findOne(query)) {
            return slug;
        }

        counter++;
        slug = `${baseSlug}-${counter}`;
    }
}

exports.blogs = async (req, res) => {

    try {
        const category = req.query.category?.trim() || "";
        const search = req.query.search?.trim() || "";
        const query = {
            isPublished: true,
            $or: [
                { submissionStatus: "approved" },
                { submissionStatus: { $exists: false } }
            ]
        };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { excerpt: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } }
            ];
        }

        const [posts, categories] = await Promise.all([
            Blog.find(query).sort({ createdAt: -1 }).lean(),
            Blog.distinct("category", { isPublished: true })
        ]);

        return res.render("blog", {
            user: req.session.user || null,
            posts,
            categories,
            selectedCategory: category,
            search
        });
    } catch (error) {
        console.error("PUBLIC BLOG ERROR:", error);
        return res.status(500).send("Unable to load blog.");
    }
};

exports.blogDetails = async (req, res) => {

    try {

        const blog = await Blog.findOne({
            slug: req.params.slug,
            isPublished: true,
            $or: [
                { submissionStatus: "approved" },
                { submissionStatus: { $exists: false } }
            ]
        }).lean();

        if (!blog) {
            return res.status(404).send("Blog post not found.");
        }

        const visitorKey = getVisitorKey(req);
        let isNewView = false;

        try {
            await BlogView.create({ blog: blog._id, visitorKey });
            isNewView = true;
        } catch (error) {
            if (error.code !== 11000) {
                throw error;
            }
        }

        if (isNewView) {
            await Blog.updateOne(
                { _id: blog._id },
                { $inc: { views: 1 } }
            );
            blog.views = (blog.views || 0) + 1;
        }

        const [comments, reactionCounts, visitorReaction, relatedPosts] =
            await Promise.all([
                BlogComment.find({
                    blog: blog._id,
                    status: "approved"
                })
                    .sort({ createdAt: -1 })
                    .lean(),

                BlogReaction.aggregate([
                    { $match: { blog: blog._id } },
                    {
                        $group: {
                            _id: "$reaction",
                            count: { $sum: 1 }
                        }
                    }
                ]),

                BlogReaction.findOne({
                    blog: blog._id,
                    visitorKey
                })
                    .select("reaction")
                    .lean(),

                Blog.find({
                    _id: { $ne: blog._id },
                    category: blog.category,
                    isPublished: true
                })
                    .sort({ createdAt: -1 })
                    .limit(3)
                    .lean()
            ]);

        const reactions = {
            like: 0,
            insightful: 0,
            helpful: 0
        };

        reactionCounts.forEach(item => {
            reactions[item._id] = item.count;
        });

        return res.render("blogDetails", {
            user: req.session.user || null,
            blog,
            relatedPosts,
            comments,
            reactions,
            visitorReaction: visitorReaction?.reaction || ""
        });

    } catch (error) {

        console.error("BLOG DETAILS ERROR:", error);
        return res.status(500).send("Unable to load blog post.");

    }

};

exports.reactToBlog = async (req, res) => {

    try {

        const reaction = String(req.body.reaction || "").trim();

        if (!["like", "insightful", "helpful"].includes(reaction)) {
            return res.status(400).send("Invalid reaction.");
        }

        const blog = await Blog.findOne({
            slug: req.params.slug,
            isPublished: true
        }).select("_id slug").lean();

        if (!blog) {
            return res.status(404).send("Blog post not found.");
        }

        await BlogReaction.findOneAndUpdate(
            { blog: blog._id, visitorKey: getVisitorKey(req) },
            { reaction },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.redirect(`/blog/${blog.slug}#community`);

    } catch (error) {
        console.error("BLOG REACTION ERROR:", error);
        return res.status(500).send("Unable to save reaction.");
    }

};

exports.commentOnBlog = async (req, res) => {

    try {

        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "").trim();
        const content = String(req.body.content || "").trim();

        if (!name || !content || name.length > 80 || content.length > 1000) {
            return res.status(400).send("Please provide a name and a comment under 1000 characters.");
        }

        const blog = await Blog.findOne({
            slug: req.params.slug,
            isPublished: true
        }).select("_id slug").lean();

        if (!blog) {
            return res.status(404).send("Blog post not found.");
        }

        await BlogComment.create({
            blog: blog._id,
            name,
            email,
            content,
            status: "approved"
        });

        return res.redirect(`/blog/${blog.slug}#community`);

    } catch (error) {
        console.error("BLOG COMMENT ERROR:", error);
        return res.status(500).send("Unable to save comment.");
    }

};
/*
                    BlogComment.find({
                        blog: blog._id,
                        status: "approved"
                    })
                        .sort({ createdAt: -1 })
                        .lean(),

                    BlogReaction.aggregate([
                        { $match: { blog: blog._id } },
                        {
                            $group: {
                                _id: "$reaction",
                                count: { $sum: 1 }
                            }
                        }
                    ]),

                    BlogReaction.findOne({
                        blog: blog._id,
                        visitorKey
                    })
                        .select("reaction")
                        .lean()
                ]);

            const reactions = {
                like: 0,
                insightful: 0,
                helpful: 0
            };

            reactionCounts.forEach(item => {
                reactions[item._id] = item.count;
            });
                createdAt: -1
            })
            .limit(3)
            .lean();


        res.render(
            "blogDetails",
            {
                user:
                    req.session.user || null,

                blog,

                relatedPosts

            }
        );


    } catch (error) {

        console.error(
                    comments,
                    reactions,
                    visitorReaction:
                        visitorReaction?.reaction || ""
            "BLOG DETAILS ERROR:",
            error
        // PUBLIC - BLOG REACTION
        // ==========================================

        exports.reactToBlog = async (req, res) => {

            try {

                const reaction =
                    String(req.body.reaction || "").trim();

                if (!["like", "insightful", "helpful"].includes(reaction)) {
                    return res.status(400).send("Invalid reaction.");
                }

                const blog = await Blog.findOne({
                    slug: req.params.slug,
                    isPublished: true
                }).select("_id slug").lean();

                if (!blog) {
                    return res.status(404).send("Blog post not found.");
                }

                await BlogReaction.findOneAndUpdate(
                    {
                        blog: blog._id,
                        visitorKey: getVisitorKey(req)
                    },
                    { reaction },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );

                return res.redirect(`/blog/${blog.slug}#community`);

            } catch (error) {

                console.error("BLOG REACTION ERROR:", error);
                return res.status(500).send("Unable to save reaction.");

            }

        };

        // ==========================================
        // PUBLIC - BLOG COMMENT
        // ==========================================

        exports.commentOnBlog = async (req, res) => {

            try {

                const name = String(req.body.name || "").trim();
                const email = String(req.body.email || "").trim();
                const content = String(req.body.content || "").trim();

                if (!name || !content || name.length > 80 || content.length > 1000) {
                    return res.status(400).send("Please provide a name and a comment under 1000 characters.");
                }

                const blog = await Blog.findOne({
                    slug: req.params.slug,
                    isPublished: true
                }).select("_id slug").lean();

                if (!blog) {
                    return res.status(404).send("Blog post not found.");
                }

                await BlogComment.create({
                    blog: blog._id,
                    name,
                    email,
                    content,
                    status: "approved"
                });

                return res.redirect(`/blog/${blog.slug}#community`);

            } catch (error) {

                console.error("BLOG COMMENT ERROR:", error);
                return res.status(500).send("Unable to save comment.");

            }

        };
        );


        res.status(500).send(
            "Unable to load blog post."
        );

    }

};


*/

// ==========================================
// ADMIN - ALL BLOGS
// ==========================================

exports.adminBlogs = async (req, res) => {

    try {

        const blogs =
            await Blog
                .find()
                .sort({
                    createdAt: -1
                });


        const totalBlogs =
            await Blog.countDocuments();


        const publishedBlogs =
            await Blog.countDocuments({
                isPublished: true
            });


        const draftBlogs =
            await Blog.countDocuments({
                isPublished: false
            });


        const featuredBlogs =
            await Blog.countDocuments({
                isFeatured: true
            });

        const settings =
            await SiteSettings.findOne() ||
            await SiteSettings.create({});


        res.render(
            "admin/blogs",
            {

                user:
                    req.session.user,

                blogs,

                totalBlogs,

                publishedBlogs,

                draftBlogs,

                featuredBlogs,

                settings,

                settingsSuccess:
                    req.query.settingsSuccess === "1",

                currentPage:
                    "blogs"

            }
        );


    } catch (error) {

        console.error(
            "ADMIN BLOGS ERROR:",
            error
        );


        res.status(500).send(
            "Unable to load blogs."
        );

    }

};


// ==========================================
// ADMIN - SHOW ADD BLOG
// ==========================================

exports.showAddBlog = (req, res) => {

    res.render(
        "admin/addBlog",
        {
            user:
                req.session.user,

            currentPage:
                "blogs"
        }
    );

};


// ==========================================
// ADMIN - ADD BLOG
// ==========================================

exports.addBlog = async (req, res) => {

    try {

        const {
            title,
            category,
            author,
            excerpt,
            content,
            isPublished,
            isFeatured
        } = req.body;


        if (
            !title ||
            !category ||
            !author ||
            !excerpt ||
            !content
        ) {

            return res.status(400).send(
                "Please fill all required fields."
            );

        }


        const slug =
            await generateUniqueSlug(
                title
            );


        const imageFile =
            req.file
                ? req.file.filename
                : "default-blog.jpg";


        await Blog.create({

            title,

            slug,

            category,

            author,

            image:
                imageFile,

            excerpt,

            content,

            isPublished:
                isPublished === "true",

            isFeatured:
                isFeatured === "true"

        });


        res.redirect(
            "/admin/blogs"
        );


    } catch (error) {

        console.error(
            "ADD BLOG ERROR:",
            error
        );


        res.status(500).send(
            "Unable to add blog: " +
            error.message
        );

    }

};


// ==========================================
// ADMIN - SHOW EDIT BLOG
// ==========================================

exports.showEditBlog = async (req, res) => {

    try {

        const blog =
            await Blog.findById(
                req.params.id
            );


        if (!blog) {

            return res.status(404).send(
                "Blog post not found."
            );

        }


        res.render(
            "admin/editBlog",
            {

                user:
                    req.session.user,

                blog,

                currentPage:
                    "blogs"

            }
        );


    } catch (error) {

        console.error(
            "EDIT BLOG PAGE ERROR:",
            error
        );


        res.status(500).send(
            "Unable to open blog."
        );

    }

};


// ==========================================
// ADMIN - UPDATE BLOG
// ==========================================

exports.updateBlog = async (req, res) => {

    try {

        const blog =
            await Blog.findById(
                req.params.id
            );


        if (!blog) {

            return res.status(404).send(
                "Blog post not found."
            );

        }


        const {
            title,
            category,
            author,
            excerpt,
            content,
            isPublished,
            isFeatured
        } = req.body;


        blog.title =
            title;

        blog.category =
            category;

        blog.author =
            author;

        blog.excerpt =
            excerpt;

        blog.content =
            content;

        blog.isPublished =
            isPublished === "true";

        blog.isFeatured =
            isFeatured === "true";


        if (
            title &&
            title !== blog.title
        ) {

            blog.slug =
                await generateUniqueSlug(
                    title,
                    blog._id
                );

        }


        if (req.file) {

            blog.image =
                req.file.filename;

        }


        await blog.save();


        res.redirect(
            "/admin/blogs"
        );


    } catch (error) {

        console.error(
            "UPDATE BLOG ERROR:",
            error
        );


        res.status(500).send(
            "Unable to update blog: " +
            error.message
        );

    }

};


// ==========================================
// ADMIN - DELETE BLOG
// ==========================================

exports.deleteBlog = async (req, res) => {

    try {

        const blog =
            await Blog.findById(
                req.params.id
            );


        if (!blog) {

            return res.status(404).send(
                "Blog post not found."
            );

        }


        await Blog.findByIdAndDelete(
            req.params.id
        );


        res.redirect(
            "/admin/blogs"
        );


    } catch (error) {

        console.error(
            "DELETE BLOG ERROR:",
            error
        );


        res.status(500).send(
            "Unable to delete blog."
        );

    }

};


// ==========================================
// ADMIN - TOGGLE PUBLISHED
// ==========================================

exports.togglePublished = async (req, res) => {

    try {

        const blog =
            await Blog.findById(
                req.params.id
            );


        if (!blog) {

            return res.status(404).send(
                "Blog post not found."
            );

        }


        blog.isPublished =
            !blog.isPublished;


        await blog.save();


        res.redirect(
            "/admin/blogs"
        );


    } catch (error) {

        console.error(
            "TOGGLE BLOG ERROR:",
            error
        );


        res.status(500).send(
            "Unable to update blog status."
        );

    }

};


// ==========================================
// ADMIN - TOGGLE FEATURED
// ==========================================

exports.toggleFeatured = async (req, res) => {

    try {

        const blog =
            await Blog.findById(
                req.params.id
            );


        if (!blog) {

            return res.status(404).send(
                "Blog post not found."
            );

        }


        blog.isFeatured =
            !blog.isFeatured;


        await blog.save();


        res.redirect(
            "/admin/blogs"
        );


    } catch (error) {

        console.error(
            "TOGGLE FEATURED ERROR:",
            error
        );


        res.status(500).send(
            "Unable to update featured status."
        );

    }

};

exports.showSubmitBlog = (req, res) => {

    return res.render("submitBlog", {
        user: req.session.user,
        currentPage: "/blog"
    });

};

exports.submitBlog = async (req, res) => {

    try {

        const { title, category, excerpt, content } = req.body;

        if (!title || !category || !excerpt || !content) {
            return res.status(400).send("Please complete all blog fields.");
        }

        const slug = await generateUniqueSlug(title);

        await Blog.create({
            title: title.trim(),
            slug,
            category: category.trim(),
            author: `${req.session.user.firstName || ""} ${req.session.user.lastName || ""}`.trim() || "TechNova Community",
            submittedBy: req.session.user._id,
            submissionStatus: "pending",
            image: req.file?.filename || "default-blog.jpg",
            excerpt: excerpt.trim(),
            content: content.trim(),
            isPublished: false,
            isFeatured: false
        });

        return res.redirect("/blog?submitted=1");

    } catch (error) {
        console.error("SUBMIT BLOG ERROR:", error);
        return res.status(500).send("Unable to submit blog post.");
    }

};

exports.reviewSubmittedBlog = async (req, res) => {

    try {

        const status = req.body.status;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).send("Invalid review status.");
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).send("Blog post not found.");
        }

        blog.submissionStatus = status;
        blog.isPublished = status === "approved";
        await blog.save();

        return res.redirect("/admin/blogs");

    } catch (error) {

        console.error("REVIEW BLOG ERROR:", error);
        return res.status(500).send("Unable to review blog post.");

    }

};