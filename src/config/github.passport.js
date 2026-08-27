import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../Models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALL_BACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;

                if (!email) {
                    return done(new Error("No email returned from GitHub profile"), null);
                }

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        firstName: profile.displayName || profile.username,
                        lastName: " ",
                        username: profile.username,
                        email,
                        provider: "github",
                        githubId: profile.id,
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