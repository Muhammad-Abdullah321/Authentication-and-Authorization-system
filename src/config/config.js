import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!URL) {
    throw new Error("MONGO_URL is missing in .env");
}

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
}

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log("MongoDB already connected");
            return;
        }

        await mongoose.connect(URL);

        console.log("MongoDB Connected Successfully");
    } catch (err) {
        console.error("Database Connection Error:", err.message);
        process.exit(1);
    }
};

export { connectDB, JWT_SECRET };