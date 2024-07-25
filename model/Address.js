let mongoose=require('mongoose');

let userAddress=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    country:{
        type:String,
        required:true,
    },
    streetName:{
        type:String,
        required:true,
    },
    town:{
        type:String,
        required:true,
    },
    state:{
        type:String,
        required:true,
    },
    postCode:{
        type:Number,
        required:true,
    },
    phone:{
        type:Number,
        required:true,
    },
    email:{
        type:String,
        required:true
    }

})
module.exports=mongoose.model('Address',userAddress)
