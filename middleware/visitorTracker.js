const VisitActivity = require("../models/VisitActivity");

function parseUserAgent(userAgent) {
    const deviceType = /mobile|android|iphone|ipad|tablet/i.test(userAgent)
        ? (/ipad|tablet/i.test(userAgent) ? "Tablet" : "Mobile")
        : "Desktop";

    let browser = "Unknown browser";
    if (/edg\//i.test(userAgent)) browser = "Microsoft Edge";
    else if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) browser = "Google Chrome";
    else if (/firefox\//i.test(userAgent)) browser = "Mozilla Firefox";
    else if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) browser = "Safari";

    let operatingSystem = "Unknown OS";
    if (/windows/i.test(userAgent)) operatingSystem = "Windows";
    else if (/android/i.test(userAgent)) operatingSystem = "Android";
    else if (/iphone|ipad|ios/i.test(userAgent)) operatingSystem = "iOS";
    else if (/mac os/i.test(userAgent)) operatingSystem = "macOS";
    else if (/linux/i.test(userAgent)) operatingSystem = "Linux";

    const deviceName = deviceType === "Desktop"
        ? operatingSystem
        : `${operatingSystem} ${deviceType}`;

    return { deviceType, deviceName, browser, operatingSystem };
}

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

        const userAgent = (req.get("user-agent") || "unknown").slice(0, 500);
        const parsedUserAgent = parseUserAgent(userAgent);
        const sessionUser = req.session?.user;

        VisitActivity.create({
            visitorId: req.sessionID || req.ip || "unknown",
            user: sessionUser?._id || sessionUser?.id || null,
            path: req.path.slice(0, 200),
            ipAddress: req.ip || req.socket.remoteAddress || "unknown",
            userAgent,
            ...parsedUserAgent,
            referrer: (req.get("referer") || "direct").slice(0, 500)
        }).catch(error => {
            console.error("VISITOR TRACKING ERROR:", error);
        });
    });

    next();
};

module.exports = trackPublicVisit;
