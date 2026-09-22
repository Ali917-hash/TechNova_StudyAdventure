const PAKISTAN_TIME_ZONE = "Asia/Karachi";

const formatPakistanDateTime = value => {
    return new Intl.DateTimeFormat("en-PK", {
        timeZone: PAKISTAN_TIME_ZONE,
        dateStyle: "medium",
        timeStyle: "medium"
    }).format(new Date(value));
};

module.exports = {
    PAKISTAN_TIME_ZONE,
    formatPakistanDateTime
};
