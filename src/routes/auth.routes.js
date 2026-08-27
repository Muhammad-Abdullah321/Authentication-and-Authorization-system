import { Router } from "express";
import { register, login, logout, googleLogin, githubLogin } from "../Controllers/auth.controller.js";
import { refreshToken } from "..//Controllers/token.controller.js"
import { verifyOTP } from "../Controllers/otp.controller.js";
// import googlePassport from "../config/google.pass.config.js";
// import githubPassport from "../config/github.passport.js";
import passport from "passport";
import { forgetPassword, verifyforgetpassOtp, resetPassword } from "../Controllers/password.controller.js";
import rateLimiter from "../Middleware/ratelimit.middleware.js";




const authRouter = Router();

// Post /api/auth/register

authRouter.post("/register", register);

//authenticate with google
//Get /api/auth/google
authRouter.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

//googleLogin
authRouter.get("/google/callback", (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
        console.log("ERR:", err);
        console.log("INFO:", info);
        console.log("USER:", user);

        if (err) {
            return res.status(500).json(err);
        }

        req.user = user;
        next();
    })(req, res, next);
}, googleLogin);


//githubLogin
authRouter.get("/github/callback", (req, res, next) => {
    passport.authenticate("github", { session: false }, (err, user, info) => {
        console.log("ERR:", err);
        console.log("INFO:", info);
        console.log("USER:", user);

        if (err) {
            return res.status(500).json(err);
        }

        req.user = user;
        next();
    })(req, res, next);
}, githubLogin);


// Redirect user to GitHub login page
authRouter.get(
    "/github",
    passport.authenticate("github", {
        scope: ["user:email"],
    })
);

//verify otp
authRouter.post("/verifyOTP",
    rateLimiter, 
    verifyOTP);

//Post /api/auth/login
authRouter.post("/login",
    rateLimiter,
    login
);

//Post /api/auth/refreshToken
authRouter.post("/refreshToken", refreshToken);

//Post /api/auth/logout
authRouter.post("/logout", logout);



//forgot password
authRouter.post("/forgetPassword",
    
    rateLimiter,
    forgetPassword);

//verify otp for reset password
authRouter.post("/verifyforgetpassOtp",
    rateLimiter,
    verifyforgetpassOtp);


//reset password
authRouter.post("/resetPassword", resetPassword);





// authRouter.delete("/del",del);

export default authRouter;  