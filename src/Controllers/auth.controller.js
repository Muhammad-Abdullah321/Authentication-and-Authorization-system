import User from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";
import Session from "../Models/session.model.js";
import OTP from "../Models/otp.model.js";
import { sendOTP } from "../utils/sendOTP.js";
import passport from "passport";

//user Register/signup
export const register = async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;

    try {
        const existingUsername = await User.findOne({ username });
        const existingEmail = await User.findOne({ email });

        if (existingUsername && existingEmail) {
            return res.status(409).json({ message: "username and email are already registered" });
        }

        if (existingUsername) {
            return res.status(409).json({ message: "username is already registered" });
        }

        if (existingEmail) {
            return res.status(409).json({ message: "email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // generate 6  digit otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        //hash OTp 
        const hashOtp = await bcrypt.hash(otp, 10);

        // delete old otp id same email already requested
        await OTP.deleteMany({ email });

        //save temporary user
        await OTP.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            otp: hashOtp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)

        });

        //send otp to email
        await sendOTP(email, otp);


        return res.status(200).json({
            message: "OTP send to your email",

        });
    }

    catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


//user login
export const login = async (req, res) => {
    const { username, password } = req.body;

    try {

        //Find user 

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                message: "invalid username or password"
            });
        }

        //compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(404).json({
                message: "invalid username or password"
            });
        }

        //Generate Access Token

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }

        );

        //Generate refreshToken
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        //Hash refreshToken
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        // save session
        await Session.create({
            userId: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });

        // send refreshToken cookie

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //Return AccessToken 

        return res.status(200).json({
            message: "login successfully",
            accessToken,
            refreshToken
        });
    }

    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message
        });
    }
};


// user logout
export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Already loug out"
        });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);

        await Session.deleteMany({
            userId: decoded.id
        });

        res.clearCookie("refreshToken");

        return res.status(200).json({
            message: "logout successfully"
        });

    }
    catch (error) {
        return res.status(401).json({
            message: message.error
        })
    }
}

//google login
export const googleLogin = async (req, res) => {

    try {
        //passport already attched the user
        const user = req.user;

        // genrate AccessToken
        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // genrate refresh token
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        //hash refreshToken 
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        console.log(req.headers);

        //save session 
        await Session.create({
            userId: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["userAgent"] || "Google OAuth"
        });

        // Send Cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Google login successful",
            accessToken
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message



        });
    }

};

//github login 


export const githubLogin = async (req, res) => {

    try {
        const user = req.user;

        // Generate Access Token
        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // Generate Refresh Token
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Hash Refresh Token
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        // Save Session
        await Session.create({
            userId: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });

        // Save cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        });

        return res.json({
            message: "GitHub Login Successful",
            accessToken,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: error.message
        })

    }
}
