import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config/config.js";

const authMiddleware = async (req,res,next) =>{

    try{
      
        const authHeader = req.headers.authorization;

        //check if authorization header exists
        if(!authHeader){
            return res.status(400).json({
                message:"accessToken is missing"
            })
        }

        //split bearer token 

        const token = authHeader.split(" ")[1];

        //Check if token exist after bearer

        if(!token){
            return res.status(401).json({
                message:"invalid token format"
            })
        }

        //verify jwt 
       const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
       );

       //saved login user info
       req.user = decoded;

       //continue to next middleware / controller
       next()

}catch(error){
    return res.status(401).json({
     message:error.message
    })
}
}

export default authMiddleware;