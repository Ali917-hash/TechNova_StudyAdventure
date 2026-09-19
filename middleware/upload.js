const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { put } = require("@vercel/blob");

const uploadPath = process.env.VERCEL
    ? "/tmp/uploads"
    : path.join(__dirname, "../public/uploads");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const localStorage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },

    filename: function (req, file, cb) {

        const extension = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, extension)
            .replace(/[^a-zA-Z0-9_-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^[-_]+|[-_]+$/g, "")
            .substring(0, 80) || "image";

        cb(null, `${Date.now()}-${baseName}${extension}`);

    }

});

const blobStorage = {

    _handleFile: async function (req, file, cb) {

        try {

            const extension =
                path.extname(file.originalname).toLowerCase();

            const blob = await put(
                "profile-images/" +
                Date.now() + "-" +
                crypto.randomBytes(16).toString("hex") +
                extension,
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

const fileFilter = (req, file, cb) => {

    const allowed = /jpg|jpeg|png|webp/;

    const ext = allowed.test(
        path.extname(file.originalname).toLowerCase()
    );

    const mime = allowed.test(file.mimetype);

    if (ext && mime) {
        cb(null, true);
    } else {
        cb(new Error("Only Images Allowed"));
    }

};

const upload = multer({
    storage:
        process.env.VERCEL
            ? blobStorage
            : localStorage,
    fileFilter
});

module.exports = upload;