import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    
    description:{
        type:String,
        default:""
    },

    completed:{
        type:Boolean,
        default:false
    },
     
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users",
        required:true
    
    },
},
{
    timestamps: true,
}
);

export default mongoose.model("Todo",todoSchema);