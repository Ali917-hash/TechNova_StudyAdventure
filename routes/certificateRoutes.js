const express = require("express");

const router = express.Router();

const certificateController =
    require("../controllers/certificateController");

const auth =
    require("../middleware/auth");


// ==========================================
// MY CERTIFICATES
// ==========================================

router.get(
    "/certificates",
    auth.isLoggedIn,
    certificateController.myCertificates
);


// ==========================================
// PUBLIC CERTIFICATE VERIFICATION
// ==========================================

router.get(
    "/certificates/verify/:certificateId",
    certificateController.verifyCertificate
);


// ==========================================
// VIEW SINGLE CERTIFICATE
// ==========================================

router.get(
    "/certificates/:id",
    auth.isLoggedIn,
    certificateController.viewCertificate
);


module.exports = router;