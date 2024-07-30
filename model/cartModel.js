const mongoose=require('mongoose');

const cartData = require('./product_Model');

const cartSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
    },
    products:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
            required:true
        },
        quantity:{
            type:Number,
            default:1
        }

    }],
  
})

module.exports=mongoose.model('cart',cartSchema)