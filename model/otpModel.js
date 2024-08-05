const mongoose=require('mongoose')
const otp = mongoose.Schema({
    otp:{
        type:Number,
        require:true,
    },
    email:{
     type:String,
     require:true,

    },
    createAt:{
        type:Date,
        default:Date.now,
        expires:50,
    },

})
const otpdata = mongoose.model('otp',otp);
module.exports=otpdata