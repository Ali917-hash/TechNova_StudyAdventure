const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGO_URI is not configured.");
    }

    try {
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            family: 4
        });

        if (process.env.NODE_ENV !== "production") {
            console.log("MongoDB Connected");
            console.log("Database Name:", conn.connection.name);
        }
    } catch (error) {
        console.error("MongoDB connection failed.");

        const errorCode = error?.code || error?.reason?.code;

        if (["ENOTFOUND", "ETIMEOUT", "ECONNREFUSED"].includes(errorCode)) {
            console.error(
                "MongoDB DNS lookup failed. Verify internet/DNS access, then copy the current mongodb+srv URI from Atlas into MONGO_URI."
            );
            console.error(`DNS error: ${errorCode}`);
        } else if (error?.codeName === "AuthenticationFailed") {
            console.error("MongoDB rejected the credentials. Verify the Atlas database user and password.");
        } else {
            console.error(error.message);
        }

        process.exitCode = 1;
        throw error;
    }
};

module.exports = connectDB;