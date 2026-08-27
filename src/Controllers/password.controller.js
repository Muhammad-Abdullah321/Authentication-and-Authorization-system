import bcrypt from "bcryptjs";
import { sendOTP } from "../utils/sendOtp.js";
import User from "../Models/user.model.js";
import passResetOtpModel from "../Models/passResetOtp.model.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";
import Session from "../Models/session.model.js";


export const forgetPassword = async (req, res) => {

    const { email } = req.body

    try {
        //check user exist
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: "Email not exist"
            });
        }

        //check if user login with google 
        if (user.provider === "google") {
            return res.status(400).json({
                message: "This account uses Google Sign-In."
            });
        }
     
        //check if user login with github 
        if (user.provider === "github") {
            return res.status(400).json({
                message: "This account uses GitHub Sign-In."
            });
        }

        //generate 6 digit otp

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const hashOTP = await bcrypt.hash(otp, 10)

        //delete old otp
        await passResetOtpModel.deleteMany({ email });

        //otp create in db
        await passResetOtpModel.create({
            email,
            otp: hashOTP,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) //5 min
        })

        //send otp
        await sendOTP(email, otp);

        return res.status(200).json({
            message: "Otp send to your email"
        })

    } catch (error) {
        return res.status(401).json({
            message: error.message
        });
    }
}

export const verifyforgetpassOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {//check if email exist in otp db
        const otpData = await passResetOtpModel.findOne({ email });

        if (!otpData) {
            return res.status(404).json({
                message: "OTP not found"
            });
        }

        //Check if OTP expiry
        if (otpData.expiresAt < new Date()) {
            return res.status(401).json({
                message: "OTP Expired"
            });
        }

            const isMatch = await bcrypt.compare(
                otp,
                otpData.otp
            );
            if (!isMatch) {
                return res.status(400).json({
                    message: "invalid otp"
                });
            }
            
            //generate jwt token
            const resetToken = jwt.sign(
                {email},
             process.env.JWT_SECRET,
             {
                expiresIn:"5m"
             }
            )

            //delete otp after verification
            await passResetOtpModel.deleteMany({
                email
            })



            return res.status(200).json({
                message: "otp verified successfully",
                resetToken
            }
            
        );

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const resetPassword = async (req, res) => {
    const { newpassword, conformpassword,resetToken} = req.body;
    try {

        const decoded = jwt.verify(
            resetToken,
            process.env.JWT_SECRET
        );

        if(newpassword!==conformpassword){
            return res.status(400).json({
                message:"both password must same"
            })
        }
        const hashPassword = await bcrypt.hash(newpassword, 10);

        await User.findOneAndUpdate(
            { email:decoded.email },
            {
                password: hashPassword
            }
        );

        //revoked all sessions
        await Session.updateMany(
            { Id: User._id },

            { revoked:true }
        )

        return res.status(200).json({
            message: "password reset successfully"
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}
