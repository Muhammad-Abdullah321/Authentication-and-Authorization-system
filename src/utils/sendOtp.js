import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({

    service:"gmail",

    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }

});

export const sendOTP = async(email,otp)=>{

    await transporter.sendMail({

        from:process.env.EMAIL_USER,

        to:email,

        subject:"Email Verification",

        text:`Your OTP is ${otp}`

    });
 

};

