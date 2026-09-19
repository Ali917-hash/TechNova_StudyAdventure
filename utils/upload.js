const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadPath = process.env.VERCEL
    ? path.join("/tmp", "uploads")
    : path.join(
        __dirname,
        "../public/uploads"
    );

if (!fs.existsSync(uploadPath)) {

    fs.mkdirSync(uploadPath, {
        recursive: true
    });

}

// ==========================================
// STORAGE
// ==========================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, uploadPath);

    },

    filename: function (req, file, cb) {

        const ext =
            path.extname(
                file.originalname
            ).toLowerCase();

        const baseName =
            path.basename(
                file.originalname,
                ext
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
                /^[-_]+|[-_]+$/g,
                ""
            )
            .substring(
                0,
                80
            ) || "image";

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
            ext;

        cb(
            null,
            uniqueName
        );

    }

});

// ==========================================
// IMAGE FILE FILTER
// ==========================================

const allowedExtensions = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
]);

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
]);

const fileFilter = (
    req,
    file,
    cb
) => {

    const extension =
        path.extname(
            file.originalname
        ).toLowerCase();

    if (
        !allowedExtensions.has(extension) ||
        !allowedMimeTypes.has(file.mimetype)
    ) {

        return cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            )
        );

    }

    cb(
        null,
        true
    );

};

// ==========================================
// MULTER
// ==========================================

module.exports = multer({

    storage,

    fileFilter,

    limits: {

        // Maximum size of one image = 10 MB
        fileSize:
            10 * 1024 * 1024,

        // Maximum files in one multipart request
        files: 10,

        // Maximum normal form fields
        fields: 50,

        // Maximum multipart parts
        parts: 60

    }

});