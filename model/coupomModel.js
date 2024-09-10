const { default: mongoose } = require("mongoose");
const { type } = require("mquery/lib/env");
const { boolean } = require("webidl-conversions");

const couponSchema=new mongoose.Schema({
    couponCode:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    criteriaAmount:{
        type:Number,
        required:true
    },
    expireDate:{
        type:Date,
        required:true,
        index:{expires:0}
    },
    is_activated:{
        type:Boolean,   
        default:true    
    },
      is_claimed:{
        type:Boolean,
        required:true
      }

})
module.exports=mongoose.model('coupon',couponSchema)