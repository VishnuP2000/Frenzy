const { name } = require('ejs');
const mongoose=require('mongoose');
const { type } = require('mquery/lib/env');
const productSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category'
    },
    price:{
        type:Number,
        require:'true'
    },
    quantity:{
        type:Number,
        require:true
    },
    images:{
        type:[String],
        require:true
    },
    description:{
        type:String,
        require:true
    },
    date:{
        type:Date,
        default:Date.now,
    },
  is_blocked:{
    type:Number,
    default:0
  },
  
})
const product=mongoose.model('product',productSchema);
module.exports=product;