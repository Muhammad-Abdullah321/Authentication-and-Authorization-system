import User from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import OTP from "../Models/otp.model.js";
import { sendOTP } from "../utils/sendOTP.js";

//verify otp and complete registration 
export const verifyOTP = async (req, res)=>{
      
    const { email , otp } = req.body;

    try{
        //find pending registation
        const pendingUser = await OTP.findOne({ email });
        
        if(!pendingUser){
            return res.status(404).json({
                measage:"No pending registration found"
            });
        }
        //Check if OTP expiry
        if (pendingUser.expiresAt < new Date()){
            return res.status(401).json({
                message:"OTP Expired"
            });
        }

        // compare enter otp with hashed otp
        const isMatch = await bcrypt.compare(
            otp,
            pendingUser.otp
        );

        if (!isMatch){
            return res.status(400).json({
                message:"Invalid otp"
            });

        }

        // Create actual user in Users collection
        const newUser = await User.create({
            firstName: pendingUser.firstName,
            lastName: pendingUser.lastName,
            username: pendingUser.username,
            email: pendingUser.email,
            password: pendingUser.password,
            isVerified: true
        });

        //delete temporary OTP record 
        await OTP.deleteOne({ email });
        
         return res.status(201).json({
            message: "Email verified successfully. Registration completed.",
            user: newUser
        });
    }
    catch(error){
       return res.status(500).json({
        message: error.message
       });
    }
}