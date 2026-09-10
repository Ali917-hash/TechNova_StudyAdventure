const {
    doubleCsrf
} = require("csrf-csrf");

const {
    doubleCsrfProtection,
    generateCsrfToken
} = doubleCsrf({

    cookieName: "csrf-token",

    cookieOptions: {

        secure: process.env.NODE_ENV === "production"

    },

    getCsrfTokenFromRequest: (req) => {

        return req.body?._csrf || req.headers["x-csrf-token"];

    },

    getSecret: () => {

        return process.env.CSRF_SECRET;

    },

    getSessionIdentifier: (req) => {

        return req.session.id;

    }

});

module.exports = {
    doubleCsrfProtection,
    generateCsrfToken
};