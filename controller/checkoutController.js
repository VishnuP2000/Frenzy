
const Product = require('../model/product_Model')
const nodemailer = require('nodemailer')
const user = require('../model/userModel')
const session = require('express-session');
const bcrypt = require('bcrypt');
const user_Rout = require('../router/userRout');
const product = require('../model/product_Model');
const Otp = require('../model/otpModel')
const cat = require('../model/categoryModel')
const userAddress = require('../model/Address');
const cartData = require('../model/cartModel')



const Loadcheckout = async (req, res) => {
    try {
        // console.log('enter the LoadCheckout')
        id = req.session.user_id
        // console.log('id', id)
        const showAddress = await userAddress.find({ userId: id })
        console.log('showAddress', showAddress)
        if (showAddress) {
            const data = await cartData.findOne({ userId: id }).populate('products.product').exec();
            // console.log('data', data)

            res.render('user/checkout', { showAddress, data })
        } else {
            console.log('user is not exist in loadcheckout')
            res.send('datas are not exist')
        }
    } catch (error) {
        console.log('errror')
    }
}

const LoadSuccessOrder = async (req, res) => {
    try {
        console.log("body : ", req.body);
        console.log('enter the LoadSuccess page')
        res.render('user/successOrder')
    } catch (error) {
        console.log('error')
    }
}

module.exports = {
    Loadcheckout,
    LoadSuccessOrder
}