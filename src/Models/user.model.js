import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"]
    },

    lastName: {
        type: String,
        required: [true, "Last name is required"],
    },

    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },

    password: {
        type: String,
        default: null,
    },
    //user cant register until is verified
    isVerified: {
        type: Boolean,
        default: false,
    },

    otp: {
        type: String,
    },

    otpExpire: {
        type: Date
    },
    provider: {
        type: String,
        enum: ["local", "google", "github"],
        default: "local"
    },
    googleId: {
        type: String,
        default: null
    },
    githubId: {
        type: String,
        default: null
    },
    plan: {
        type: String,
        enum: ["free", "premium"],
        default: "free"
    },
    stripeCustomerId: {
        type: String,
        default: null
    },

    subscriptionId: {
        type: String,
        default: null
    }
});

const User = mongoose.model("Users", userSchema);
export default User;
