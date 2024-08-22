const { default: mongoose } = require("mongoose");
const product = require("./product_Model");
const { type } = require("mquery/lib/env");

const productOfferSchema=new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'product'
    },
    discount:{
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
    }
})

module.exports=mongoose.model('productOffer',productOfferSchema)