import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../Models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALL_BACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;

                if (!email) {
                    return done(new Error("No email returned from Google profile"), null);
                }

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        firstName: profile.name?.givenName || "",
                        lastName: profile.name?.familyName || "",
                        username: email.split("@")[0],
                        email,
                        provider: "google",
                        googleId: profile.id,
                        isVerified: true,
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);


export default passport;