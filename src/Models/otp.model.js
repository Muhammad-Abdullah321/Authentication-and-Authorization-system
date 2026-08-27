import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({

    firstName:String,

    lastName:String,

    username:String,

    email:{
        type:String,
        required:true
    },

    password:String,

    otp:{
         type:String,
         required:true
    },

    expiresAt:Date,

    isVerified: { type: Boolean, default: false },

});

export default mongoose.model("OTP",otpSchema);