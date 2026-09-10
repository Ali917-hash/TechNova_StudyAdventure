const express = require("express");

const router = express.Router();

const blogController =
    require("../controllers/blogController");

const auth =
    require("../middleware/auth");

const upload =
    require("../utils/upload");

const {
    doubleCsrfProtection
} = require("../middleware/csrf");


// ==========================================
// PUBLIC - BLOG
// ==========================================

router.get(
    "/blog",
    blogController.blogs
);


// ==========================================
// PUBLIC - BLOG DETAILS
// ==========================================

router.get(
    "/blog/:slug",
    blogController.blogDetails
);


// ==========================================
// ADMIN - ALL BLOGS
// ==========================================

router.get(
    "/admin/blogs",
    auth.isAdmin,
    blogController.adminBlogs
);


// ==========================================
// ADMIN - ADD BLOG PAGE
// ==========================================

router.get(
    "/admin/blog/add",
    auth.isAdmin,
    blogController.showAddBlog
);


// ==========================================
// ADMIN - ADD BLOG
// ==========================================

router.post(
    "/admin/blog/add",
    auth.isAdmin,
    upload.single("image"),
    doubleCsrfProtection,
    blogController.addBlog
);


// ==========================================
// ADMIN - EDIT BLOG PAGE
// ==========================================

router.get(
    "/admin/blog/edit/:id",
    auth.isAdmin,
    blogController.showEditBlog
);


// ==========================================
// ADMIN - UPDATE BLOG
// ==========================================

router.post(
    "/admin/blog/update/:id",
    auth.isAdmin,
    upload.single("image"),
    doubleCsrfProtection,
    blogController.updateBlog
);


// ==========================================
// ADMIN - DELETE BLOG
// ==========================================

router.post(
    "/admin/blog/delete/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    blogController.deleteBlog
);


// ==========================================
// ADMIN - TOGGLE PUBLISHED
// ==========================================

router.post(
    "/admin/blog/toggle-published/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    blogController.togglePublished
);


// ==========================================
// ADMIN - TOGGLE FEATURED
// ==========================================

router.post(
    "/admin/blog/toggle-featured/:id",
    auth.isAdmin,
    doubleCsrfProtection,
    blogController.toggleFeatured
);


module.exports = router;