const Blog = require("../models/Blog");


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

        const query = {
            slug
        };

        if (existingId) {

            query._id = {
                $ne: existingId
            };

        }


        const existing =
            await Blog.findOne(query);


        if (!existing) {
            return slug;
        }


        counter++;

        slug =
            `${baseSlug}-${counter}`;

    }

}


// ==========================================
// PUBLIC - ALL BLOGS
// ==========================================

exports.blogs = async (req, res) => {

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

            query.category = category;

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
                    excerpt: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    content: {
                        $regex: search,
                        $options: "i"
                    }
                }

            ];

        }


        const posts =
            await Blog
                .find(query)
                .sort({
                    createdAt: -1
                })
                .lean();


        const categories =
            await Blog.distinct(
                "category",
                {
                    isPublished: true
                }
            );


        res.render(
            "blog",
            {
                user:
                    req.session.user || null,

                posts,

                categories,

                selectedCategory:
                    category,

                search

            }
        );


    } catch (error) {

        console.error(
            "PUBLIC BLOG ERROR:",
            error
        );


        res.status(500).send(
            "Unable to load blog."
        );

    }

};


// ==========================================
// PUBLIC - BLOG DETAILS
// ==========================================

exports.blogDetails = async (req, res) => {

    try {

        const blog =
            await Blog.findOne({

                slug:
                    req.params.slug,

                isPublished: true

            }).lean();


        if (!blog) {

            return res.status(404).send(
                "Blog post not found."
            );

        }


        // Increment views

        await Blog.updateOne(

            {
                _id: blog._id
            },

            {
                $inc: {
                    views: 1
                }
            }

        );


        const relatedPosts =
            await Blog.find({

                _id: {
                    $ne: blog._id
                },

                category:
                    blog.category,

                isPublished: true

            })
            .sort({
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
            "BLOG DETAILS ERROR:",
            error
        );


        res.status(500).send(
            "Unable to load blog post."
        );

    }

};


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