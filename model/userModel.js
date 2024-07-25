const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    date: {
        type: Date,
        default: Date.now,
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },  
    is_admin:{
        type:Boolean,
        required:true,
        default:false
    },
    is_varified:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:''
    },
    is_blocked:{
        type:Boolean,
        required:true,
        default:false
    }

})  
module.exports=mongoose.model("user",userSchema);