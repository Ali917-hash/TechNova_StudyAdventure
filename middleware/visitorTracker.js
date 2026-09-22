const VisitActivity = require("../models/VisitActivity");

const ignoredPrefixes = [
    "/admin",
    "/health",
    "/uploads",
    "/css",
    "/js",
    "/images",
    "/fonts"
];

const trackPublicVisit = (req, res, next) => {
    const isPageRequest =
        req.method === "GET" &&
        !ignoredPrefixes.some(prefix => req.path.startsWith(prefix)) &&
        req.path !== "/favicon.ico";

    if (!isPageRequest) {
        return next();
    }

    res.on("finish", () => {
        const contentType = res.get("content-type") || "";

        if (res.statusCode >= 400 || !contentType.includes("text/html")) {
            return;
        }

        VisitActivity.create({
            visitorId: req.sessionID || req.ip || "unknown",
            path: req.path.slice(0, 200),
            ipAddress: req.ip || req.socket.remoteAddress || "unknown",
            userAgent: (req.get("user-agent") || "unknown").slice(0, 500)
        }).catch(error => {
            console.error("VISITOR TRACKING ERROR:", error);
        });
    });

    next();
};

module.exports = trackPublicVisit;
