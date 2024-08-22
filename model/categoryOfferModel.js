const { default: mongoose } = require("mongoose");
const product = require("./product_Model");
const { type } = require("mquery/lib/env");

const categoryOfferSchema=new mongoose.Schema({
    category:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'category'
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

module.exports=mongoose.model('categoryOffer',categoryOfferSchema)