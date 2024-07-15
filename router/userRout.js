const express = require('express')
const user_Rout = express()
console.log('iam reached the user page')
const userController = require('../controller/userController')
const flash=require('express-flash')

user_Rout.use(flash())

// const consig=require('..')
user_Rout.set('view engine','ejs')
user_Rout.set('views','view')

user_Rout.use(express.json())
user_Rout.use(express.urlencoded({ extended: true }))
const userAuth= require("../middleware/userAuth")


user_Rout.get('/', userController.loadHome)

user_Rout.get('/shope',userAuth.isLogin ,userController.loadShope)

user_Rout.get('/product', userController.loadProduct)
user_Rout.get('/login', userController.loadLoagin)
// user_Rout.get('/logout', userController.loadLoagin)
user_Rout.post('/login', userController.creatLoagin)
user_Rout.get('/homeLogout',userAuth.isLogin, userController.logoutHome)

user_Rout.get('/emailVerification', userController.mailVarify)
user_Rout.post('/emailVerification', userController.verifyMail)
user_Rout.get('/paswordOtp', userController.paswordOtp)
user_Rout.post('/paswordOtp', userController.otpPasword)

user_Rout.get('/updatePassword', userController.updatePass)
user_Rout.post('/updatePassword', userController.passUpdate)



// user_Rout.get('/userDashboard',userAuth.isLogin, userController.UserDash)

user_Rout.get('/register', userController.findRegister)
user_Rout.post('/register', userController.loadRegister)


user_Rout.get('/otp', userController.loadOtp)
user_Rout.post('/otp', userController.otpverification)


// user_Rout.get('/resendOtp',userController.LoadresendOtp)
user_Rout.get('/resend', userController.verifyresendOtp)
user_Rout.get('/productDetail',userAuth.isLogin, userController.DetailProduct)









module.exports = user_Rout