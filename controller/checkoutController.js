
const Product = require('../model/product_Model')
const nodemailer = require('nodemailer')
const razorPay=require('razorpay')
// const instance=require('../config/razorPay')
const user = require('../model/userModel')
const session = require('express-session');
const bcrypt = require('bcrypt');
const user_Rout = require('../router/userRout');
const product = require('../model/product_Model');
const Otp = require('../model/otpModel')
const cat = require('../model/categoryModel')
const userAddress = require('../model/Address');
const cartData = require('../model/cartModel')
const coupon=require('../model/coupomModel')
const razPay=require('razorpay')
const orders=require('../model/orderModel')


const Loadcheckout = async (req, res) => {
    try {
        // console.log('enter the LoadCheckout')
        id = req.session.user_id
        cid=req.query.id
        console.log('enter the cid',cid)
        // console.log('id', id)
        const showAddress = await userAddress.find({ userId: id })
        
        // const coupons=await coupon.find({is_claimed:false})
        const coupons = await coupon.aggregate([
            {
                $match: {
                    is_activated: true,
                    is_claimed: false
                }
            },
            {
                $addFields: {
                    comparisonResult: { $gte: [total, "$criteriaAmount"] }
                }
            },
            {
                $match: {
                    comparisonResult: true
                }
            },
            {
                $project: {
                    comparisonResult: 0
                }
            }
        ]);

        // console.log('enter the coupons',coupons)
        // console.log('showAddress', showAddress)
        // const couponApply=await coupon.findOne({_id:cid})
        // if(couponApply){
        //     const updateCoupon=await coupon.findOne({_id:cid},{$set:{is_claimed:false}})
        //     console.log('updateCoupon',updateCoupon)
        //     const data = await cartData.findOne({ userId: id }).populate('products.product').exec();
         
        //     res.render('user/checkout', { showAddress, data ,coupons,updateCoupon})
        // }else{
            
    // }
    const data = await cartData.findOne({ userId: id }).populate('products.product').exec();
 
    res.render('user/checkout', { showAddress, data ,coupons})
       
       
    } catch (error) {
        console.log('errror')
    }
}

const LoadSuccessOrder = async (req, res) => {
    try {
        console.log("body : ", req.body);
        const ordid=req.body.orderId
        console.log('enter the LoadSuccess page')
        res.render('user/successOrder')
    } catch (error) {
        console.log('error')
    }
}

const instance = new razPay({
    key_id: process.env.RAZORPAY_IDKEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });




const razorpayRes = async (subTotal,orderId)=>{
    try {
        // console.log(subTotal,orderId);
        subTotal = subTotal.toFixed(2)
        const options = {
            amount: (subTotal*100),
            currency: "INR",
            receipt : orderId.toString()
        }
        console.log('subTotal,orderId',subTotal,orderId);
      
        const order = await new Promise((resolve, reject) => {
            instance.orders.create(options, (err, order) => {
                if (err) {
                    console.log('err', err);
                    reject(err);
                } else {
                    console.log('new order:', order);
                    resolve(order);
                }
            });
        });
        console.log('order',order);
 

        return order;
    } catch (error) {
        // console.log(error.message,'from order instance of razopay');
        console.log('razorpay error',error);
        // res.status(400).send(error.message);
    }
}

const verifyPayment=async(req,res)=>{
    try {
        console.log('enter the verifyPayment')
        const ordId=req.body.orderId
        console.log('orderid',ordId);
        
        const orderData=await orders.findOne({orderId:ordId})
        console.log('orderData',orderData)
        if(orderData){
         const orderUpdate=await orders.findOneAndUpdate(
                { orderId: ordId },
                { $set: { 'orderdProducts.$[].status': 'placed' } },
                { new: true }
            );
            console.log('orderUpdate',orderUpdate);

            return res.json({status:true})
        }else{
            console.log('order data are not exist')
        }
    } catch (error) {
        console.log('error',error)
        
    }
}

const paymentFailed=async(req,res)=>{
    try {
        console.log('enter the paymentFailed ')
        const ordId=req.query.orderId
        const updatePaymentFailed=await orders.findOne({orderId:ordId})
        if(updatePaymentFailed){
            const orderUpdateFailed=await orders.findOneAndUpdate(
                { orderId: ordId },
                { $set: { 'orderdProducts.$[].status': 'Failed' } },
                { new: true }
            );
    console.log('orderUpdateFailed',orderUpdateFailed)
    res.render('user/successOrder')
        }else{
            console.log('enter the paymentfailed')

        }

    } catch (error) {
        
    }
}




module.exports = {
    Loadcheckout,
    LoadSuccessOrder,
    razorpayRes,
    verifyPayment,
    paymentFailed
    
}