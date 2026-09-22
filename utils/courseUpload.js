const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { put } = require("@vercel/blob");

// ==========================================
// UPLOAD DIRECTORIES
// ==========================================

const uploadRoot = process.env.VERCEL
    ? path.join("/tmp", "uploads")
    : path.join(
        __dirname,
        "../public/uploads"
    );

const imagePath =
    uploadRoot;

const materialPath =
    path.join(
        uploadRoot,
        "course-materials"
    );


// ==========================================
// CREATE DIRECTORIES
// ==========================================

if (!fs.existsSync(imagePath)) {

    fs.mkdirSync(
        imagePath,
        {
            recursive: true
        }
    );

}

if (!fs.existsSync(materialPath)) {

    fs.mkdirSync(
        materialPath,
        {
            recursive: true
        }
    );

}


// ==========================================
// STORAGE
// ==========================================

const localStorage = multer.diskStorage({

    destination: function (req, file, cb) {

        if (file.fieldname === "image") {

            return cb(
                null,
                imagePath
            );

        }


        if (
            file.fieldname === "content" ||
            file.fieldname === "contentFiles" ||
            file.fieldname === "contentFolder"
        ) {

            return cb(
                null,
                materialPath
            );

        }


        return cb(
            new Error(
                "Invalid file field."
            )
        );

    },

    filename: function (req, file, cb) {

        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();

        const baseName =
            path.basename(
                file.originalname,
                extension
            )
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "-"
            )
            .replace(
                /-+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                ""
            )
            .substring(
                0,
                80
            ) || "file";

        const randomName =
            crypto
                .randomBytes(16)
                .toString("hex");

        const uniqueName =
            Date.now() +
            "-" +
            randomName +
            "-" +
            baseName +
            extension;

        cb(
            null,
            uniqueName
        );
    }

});

const blobImageStorage = {

    _handleFile: async function (req, file, cb) {
        try {

            const extension =
                path.extname(file.originalname).toLowerCase();

            const filename =
                Date.now() + "-" +
                crypto.randomBytes(16).toString("hex") +
                extension;

            const folder =
                file.fieldname === "image"
                    ? "course-images"
                    : "course-materials";

            const blob = await put(
                folder + "/" + filename,
                file.stream,
                {
                    access: "public",
                    contentType: file.mimetype
                }
            );

            cb(null, {
                filename: blob.url,
                path: blob.url,
                size: blob.size
            });

        } catch (error) {

            cb(error);

        }

    },

    _removeFile: function (req, file, cb) {
        cb(null);

    }

};


// ==========================================
// EXACT ALLOWLISTS
// ==========================================

const imageExtensions =
    new Set([
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ]);

const imageMimeTypes =
    new Set([
        "image/jpeg",
        "image/png",
        "image/webp"
    ]);


const materialMimeTypes = {

    ".pdf":
        new Set([
            "application/pdf"
        ]),

    ".mp4":
        new Set([
            "video/mp4"
        ]),

    ".webm":
        new Set([
            "video/webm"
        ]),

    ".mov":
        new Set([
            "video/quicktime"
        ]),

    ".avi":
        new Set([
            "video/x-msvideo",
            "video/avi"
        ]),

    ".mkv":
        new Set([
            "video/x-matroska"
        ]),

    ".doc":
        new Set([
            "application/msword"
        ]),

    ".docx":
        new Set([
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]),

    ".ppt":
        new Set([
            "application/vnd.ms-powerpoint"
        ]),

    ".pptx":
        new Set([
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ]),

    ".txt":
        new Set([
            "text/plain"
        ])

};


// ==========================================
// FILE FILTER
// ==========================================

const fileFilter = (
    req,
    file,
    cb
) => {

    const extension =
        path.extname(
            file.originalname
        ).toLowerCase();


    // ======================================
    // COURSE IMAGE
    // ======================================

    if (
        file.fieldname === "image"
    ) {

        if (
            imageExtensions.has(extension) &&
            imageMimeTypes.has(file.mimetype)
        ) {

            return cb(
                null,
                true
            );

        }


        return cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            )
        );

    }


    // ======================================
    // COURSE MATERIAL
    // ======================================

    if (
        file.fieldname === "content" ||
        file.fieldname === "contentFiles" ||
        file.fieldname === "contentFolder"
    ) {

        const allowedMimeTypes =
            materialMimeTypes[
                extension
            ];


        if (
            allowedMimeTypes &&
            allowedMimeTypes.has(
                file.mimetype
            )
        ) {

            return cb(
                null,
                true
            );

        }


        return cb(
            new Error(
                "Unsupported course material file type."
            )
        );

    }


    return cb(
        new Error(
            "Invalid file field."
        )
    );

};


// ==========================================
// MULTER CONFIGURATION
// ==========================================

module.exports = multer({

    storage:
        process.env.VERCEL
            ? blobImageStorage
            : localStorage,

    fileFilter,

    limits: {

        fileSize:
            3 * 1024 * 1024 * 1024,

        files: 100,

        // Prevent excessive multipart fields
        fields: 100,

        // Prevent excessive parts
        parts: 150

    }

});