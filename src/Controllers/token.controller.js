import User from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";
import Session from "../Models/session.model.js";



//RefreshToken 
export const refreshToken = async (req, res) => {

    //1. Read Access Token
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "refreshToken not found"
        })
    }

    try {
        //2.verify jwt
        const decoded = jwt.verify(refreshToken, JWT_SECRET)

        //find all session of this user
        const sessions = await Session.find({
            userId: decoded.id,
            revoked: false
        });

        let validSession = null;

        for (const session of sessions) {

            const isMatch = await bcrypt.compare(
                refreshToken,
                session.refreshTokenHash
            );


            if (isMatch) {
                validSession = session;
                break;
            }
        }

        //5. NO Mathing session

        if (!validSession) {

            return res.status(401).json({
                message: "session not found "
            });
        }

        //generate New Access Token

        const accessToken = jwt.sign(
            { id: decoded.id },
            JWT_SECRET,
            { expiresIn: "15m" }
        );


        //Return New Access Token
        return res.status(200).json({
            message: "Access Token Refreshed",
            accessToken
        });

    } catch (error) {
        console.log(error)
        return res.status(401).json({
            message: error.message
        });
    }

};