import mongoose from "mongoose";


const sessionSchema = new mongoose.Schema({
     
     userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required: [true, "User is required"]
     },
     refreshTokenHash:{
         type:String,
         required:[true, "RefreshToken is required"]
     },

     ip:{
        type:String,
        required:[true,"Ip address is required "]
     },

     userAgent:{
        type:String,
        required:[true,"UserAgent is required"]
        },
     revoked:{
        type:Boolean,
        default:false
     }  

},
{
    timestamps:true
}
)

const Session = mongoose.model("session",sessionSchema);

export default Session;