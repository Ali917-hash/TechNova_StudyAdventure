const mongoose = require("mongoose");

const connectDB = async () => {
    try {

        const conn = await mongoose.connect(process.env.MONGO_URI);

        if (process.env.NODE_ENV !== "production") {
            console.log("MongoDB Connected");
            console.log("Database Name:", conn.connection.name);
        }

    } catch (error) {

        console.log("❌ MongoDB Connection Failed");
        console.error(error);

        process.exit(1);

    }
};

module.exports = connectDB;