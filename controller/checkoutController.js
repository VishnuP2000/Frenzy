
const Product = require('../model/product_Model')
const nodemailer = require('nodemailer')
const user = require('../model/userModel')
const session = require('express-session');
const bcrypt = require('bcrypt');
const user_Rout = require('../router/userRout');
const product = require('../model/product_Model');
const Otp = require('../model/otpModel')
const cat = require('../model/categoryModel')
const userAddress=require('../model/Address');



const Loadcheckout=async(req,res)=>{
    try {
        console.log('enter the LoadCheckout')
        const showAddress=await userAddress.find({})
        res.render('user/checkout',{showAddress})
    } catch (error) {
        console.log('errror')
    }
}


module.exports={
    Loadcheckout
}