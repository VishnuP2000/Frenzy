 const mongoose=require('mongoose');
const product = require('./product_Model');
const { type } = require('mquery/lib/env');

 const wishlistSchema = new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'userModel',
        required:true
    },
    products:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'product',
                require:true
            }
        }
    ]
 })

 module.exports=mongoose.model('wishlist',wishlistSchema)