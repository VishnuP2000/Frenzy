const express = require('express');
const router = express.Router();
const session=require('express-session')
const passport = require('passport');
require('../passport')
router.use(passport.initialize());
router.use(passport.session());
const userAuth= require("../middleware/userAuth")
const user_Rout = express()
const userController = require('../controller/userController')
const flash=require('express-flash')

user_Rout.use(flash())

console.log('it is reached the user page')


user_Rout.set('view engine','ejs')
user_Rout.set('views','view')

user_Rout.use(express.json())
user_Rout.use(express.urlencoded({ extended: true }))



user_Rout.get('/', userController.loadHome)

user_Rout.get('/shope',userAuth.isLogin ,userController.loadShope)
user_Rout.get('/filterShope',userAuth.isLogin ,userController.filterShope)

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

user_Rout.get('/Dashboard',userAuth.isLogin, userController.Dashboard)
user_Rout.get('/changePassword',userAuth.isLogin, userController.LoadchangePassword)
user_Rout.post('/changePassword',userAuth.isLogin, userController.changePassword)

user_Rout.get('/editProfile',userAuth.isLogin, userController.LoadEditProfile)
user_Rout.post('/editProfile',userAuth.isLogin, userController.editProfile)

user_Rout.get('/Address',userAuth.isLogin, userController.LoadAddress)
user_Rout.post('/Address',userAuth.isLogin, userController.verifyAddress)
user_Rout.get('/deleteAddress',userAuth.isLogin, userController.deleteAddress)
user_Rout.get('/editAddress',userAuth.isLogin, userController.LoadEditAddress)
user_Rout.post('/editAddress',userAuth.isLogin, userController.verifyEditAddress)




user_Rout.get('/succes',userController.googleAuth)
user_Rout.get('/failure',userController.googleFail)


user_Rout.get('/success', (req, res) => res.send(userProfile));
user_Rout.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

user_Rout.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["email", "profile"],
    })
);


user_Rout.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/succes',
        failureRedirect: '/failure',
    }), (req, res) => {
        console.log(res, 'authe')
    }
)



module.exports = user_Rout