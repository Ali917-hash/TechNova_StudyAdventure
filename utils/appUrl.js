const productionUrl =
    "https://tech-nova-study-adventure.vercel.app";

module.exports = function getAppUrl() {

    const configuredUrl =
        process.env.APP_URL ||
        (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "");

    const isLocalUrl =
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i
            .test(configuredUrl);

    if (process.env.VERCEL && isLocalUrl) {
        return productionUrl;
    }

    return (
        configuredUrl ||
        productionUrl
    ).replace(/\/$/, "");

};
