const mongoose = require("mongoose");
const Certificate = require("../models/Certificate");
const QRCode = require("qrcode");


// ==========================================
// GET CURRENT USER ID
// ==========================================

function getUserId(req) {

    return (
        req.session?.user?._id ||
        req.session?.user?.id ||
        null
    );

}


// ==========================================
// MY CERTIFICATES
// ==========================================

exports.myCertificates = async (req, res) => {

    try {

        // ==========================================
        // CHECK LOGIN
        // ==========================================

        const userId =
            getUserId(req);


        if (!userId) {

            return res.redirect("/login");

        }


        // ==========================================
        // VALIDATE USER ID
        // ==========================================

        if (
            !mongoose.Types.ObjectId.isValid(userId)
        ) {

            return res.redirect("/login");

        }


        // ==========================================
        // GET ONLY CURRENT USER CERTIFICATES
        // ==========================================

        const certificates =
            await Certificate.find({

                user: userId

            })
            .populate(
                "course",
                "title instructor category duration"
            )
            .populate(
                "user",
                "firstName lastName"
            )
            .sort({
                issuedAt: -1,
                createdAt: -1
            });

        const validCertificates =
            certificates.filter(
                certificate =>
                    certificate.course &&
                    certificate.user
            );


        // ==========================================
        // RENDER
        // ==========================================

        return res.render(
            "user/certificates",
            {

                user:
                    req.session.user,

                certificates:
                    validCertificates,

                currentPage:
                    "certificates"

            }
        );


    } catch (error) {

        console.error(
            "CERTIFICATE PAGE ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to load certificates."
        );

    }

};


// ==========================================
// VIEW SINGLE CERTIFICATE
// ==========================================

exports.viewCertificate = async (
    req,
    res
) => {

    try {

        // ==========================================
        // CHECK LOGIN
        // ==========================================

        const userId =
            getUserId(req);


        if (!userId) {

            return res.redirect("/login");

        }


        // ==========================================
        // VALIDATE USER ID
        // ==========================================

        if (
            !mongoose.Types.ObjectId.isValid(userId)
        ) {

            return res.redirect("/login");

        }


        // ==========================================
        // VALIDATE CERTIFICATE ID
        // ==========================================

        const certificateId =
            req.params.id;


        if (
            !mongoose.Types.ObjectId.isValid(
                certificateId
            )
        ) {

            return res.status(404).send(
                "Certificate not found."
            );

        }


        // ==========================================
        // FIND ONLY THIS USER'S CERTIFICATE
        // ==========================================

        const certificate =
            await Certificate.findOne({

                _id: certificateId,

                user: userId

            })
            .populate(
                "course",
                "title instructor category duration"
            )
            .populate(
                "user",
                "firstName lastName email"
            );


        // ==========================================
        // NOT FOUND / NOT OWNED
        // ==========================================

        if (!certificate) {

            return res.status(404).send(
                "Certificate not found."
            );

        }

        if (!certificate.course || !certificate.user) {

            return res.status(404).send(
                "Certificate data is incomplete."
            );

        }


        // ==========================================
        // PUBLIC VERIFICATION URL
        // ==========================================

        const verificationUrl =
            `${req.protocol}://${req.get("host")}/certificates/verify/${certificate.certificateId}`;


        // ==========================================
        // GENERATE QR CODE
        // ==========================================

        const qrCode =
            await QRCode.toDataURL(
                verificationUrl,
                {
                    width: 220,
                    margin: 2,
                    errorCorrectionLevel: "H"
                }
            );


        // ==========================================
        // RENDER
        // ==========================================

        return res.render(
            "user/viewCertificate",
            {

                user:
                    req.session.user,

                certificate,

                verificationUrl,

                qrCode,

                currentPage:
                    "certificates"

            }
        );


    } catch (error) {

        console.error(
            "VIEW CERTIFICATE ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to load certificate."
        );

    }

};


// ==========================================
// PUBLIC CERTIFICATE VERIFICATION
// ==========================================

exports.verifyCertificate = async (
    req,
    res
) => {

    try {

        const certificateId =
            req.params.certificateId;


        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (!certificateId) {

            return res.render(
                "user/verifyCertificate",
                {

                    certificate:
                        null,

                    certificateId:
                        ""

                }
            );

        }


        // ==========================================
        // FIND CERTIFICATE
        // ==========================================

        const certificate =
            await Certificate.findOne({

                certificateId

            })
            .populate(
                "course",
                "title instructor category duration"
            )
            .populate(
                "user",
                "firstName lastName"
            );


        // ==========================================
        // INVALID CERTIFICATE
        // ==========================================

        if (!certificate) {

            return res.render(
                "user/verifyCertificate",
                {

                    certificate:
                        null,

                    certificateId

                }
            );

        }

        if (!certificate.course || !certificate.user) {

            return res.render(
                "user/verifyCertificate",
                {
                    certificate: null,
                    certificateId
                }
            );

        }


        // ==========================================
        // PUBLIC VERIFICATION URL
        // ==========================================

        const verificationUrl =
            `${req.protocol}://${req.get("host")}/certificates/verify/${certificate.certificateId}`;


        // ==========================================
        // GENERATE QR CODE
        // ==========================================

        const qrCode =
            await QRCode.toDataURL(
                verificationUrl,
                {
                    width: 220,
                    margin: 2,
                    errorCorrectionLevel: "H"
                }
            );


        // ==========================================
        // RENDER PUBLIC VERIFICATION PAGE
        // ==========================================

        return res.render(
            "user/verifyCertificate",
            {

                certificate,

                certificateId,

                verificationUrl,

                qrCode

            }
        );


    } catch (error) {

        console.error(
            "VERIFY CERTIFICATE ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to verify certificate."
        );

    }

};