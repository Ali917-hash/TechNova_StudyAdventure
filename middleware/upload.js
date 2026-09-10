const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },

    filename: function (req, file, cb) {

        cb(
            null,
            Date.now() + "-" + file.originalname
        );

    }

});

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
    storage,
    fileFilter
});

module.exports = upload;