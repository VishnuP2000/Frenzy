const mongoose=require('mongoose');
const { type } = require('mquery/lib/env');


const ReturnSchema= new mongoose.Schema({
    return:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    orderId:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    shipAddress: {
        firstName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true
        },
        streetName:{
            type:String,
            required:true
        },
        town:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        postCode:{
            type:String,
            required:true
        },
        phone:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        }
    },
    orderdProducts:[
        {
            product:{
                type:mongoose.Types.ObjectId,
                required:true,
                ref:'product'
            },
            quantity:{
                type:Number,
                required:true
            },
            price:{
                type:Number,
                required:true
            },
            totalPrice:{
                type:Number,
                required:true
            },
            status:{
                type:String,
                required:true,
                default:'placed'
            },
            _id: {
                type:mongoose.Types.ObjectId,
                required: true
            }
        }
    ],
    purchaseData:{
        type:String,
        require:true
    },
    purchaseTime:{
        type:Date,
        require:true
    },
    paymentMethode:{
        type:String,
        required:true
    }
  
})
module.exports = mongoose.model('Return',ReturnSchema)