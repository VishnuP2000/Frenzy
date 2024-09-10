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
const checkoutController=require('../controller/checkoutController')
const cartController=require('../controller/cartController')
const orderController=require('../controller/orderController')
const wishlistController=require('../controller/wishlistController')
const walletController=require('../controller/walletController')
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
user_Rout.get('/sort',userAuth.isLogin ,userController.shopeSort)
user_Rout.get('/search',userAuth.isLogin ,userController.searchProducts)

user_Rout.get('/product',userAuth.isLogin, userController.loadProduct)
user_Rout.get('/login',userAuth.isLogout,userController.loadLoagin)
// user_Rout.get('/logout', userController.loadLoagin)
user_Rout.post('/login',userAuth.isLogout, userController.creatLoagin)
user_Rout.get('/homeLogout',userAuth.isLogin, userController.logoutHome)

user_Rout.get('/emailVerification', userController.mailVarify)
user_Rout.post('/emailVerification', userController.verifyMail)
user_Rout.get('/paswordOtp',userAuth.isLogin, userController.paswordOtp)
user_Rout.post('/paswordOtp',userAuth.isLogin, userController.otpPasword)

user_Rout.get('/updatePassword',userAuth.isLogin, userController.updatePass)
user_Rout.post('/updatePassword',userAuth.isLogin, userController.passUpdate)



// user_Rout.get('/userDashboard',userAuth.isLogin, userController.UserDash)

user_Rout.get('/register',userAuth.isLogout, userController.findRegister)
user_Rout.post('/register',userAuth.isLogout, userController.loadRegister)


user_Rout.get('/otp',userAuth.isLogout, userController.loadOtp)
user_Rout.post('/otp',userAuth.isLogout, userController.otpverification)


// user_Rout.get('/resendOtp',userController.LoadresendOtp)
user_Rout.get('/resend',userAuth.isLogout, userController.verifyresendOtp)
user_Rout.get('/productDetail',userAuth.isLogin, userController.DetailProduct)

user_Rout.get('/Dashboard',userAuth.isLogin, userController.Dashboard)
user_Rout.get('/changePassword',userAuth.isLogin, userController.LoadchangePassword)
user_Rout.post('/changePassword',userAuth.isLogin, userController.changePassword)

user_Rout.get('/editProfile',userAuth.isLogin, userController.LoadEditProfile)
user_Rout.post('/editProfile',userAuth.isLogin, userController.editProfile)

user_Rout.get('/Address',userAuth.isLogin, userController.LoadAddress)
user_Rout.post('/Address',userAuth.isLogin, userController.verifyAddress)
user_Rout.get('/deleteAddress',userAuth.isLogin, userController.deleteAddress)
user_Rout.post('/editAddress',userAuth.isLogin, userController.verifyEditAddress)
user_Rout.post('/addAddress',userAuth.isLogin, userController.addAddress)
user_Rout.get('/editAddress',userAuth.isLogin, userController.LoadEditAddress)

user_Rout.get('/cart',userAuth.isLogin, cartController.LoadCart)
user_Rout.post('/addToCart',userAuth.isLogin, cartController.addToCart)
user_Rout.patch('/ProductQuantity',userAuth.isLogin, cartController.productQuantity)
user_Rout.post('/removeCart',userAuth.isLogin, cartController.removeCart)

user_Rout.get('/checkout',userAuth.isLogin, checkoutController.Loadcheckout)
user_Rout.get('/successOrder',userAuth.isLogin, checkoutController.LoadSuccessOrder)
user_Rout.post('/razor',userAuth.isLogin, checkoutController.razorpayRes)
user_Rout.post('/verifyPayment',userAuth.isLogin, checkoutController.verifyPayment)
user_Rout.get('/paymentFailed',userAuth.isLogin, checkoutController.paymentFailed)


user_Rout.get('/OrderPage',userAuth.isLogin, orderController.LoadOrderPage)
user_Rout.post('/OrderPage',userAuth.isLogin, orderController.verifyOrderPage)
user_Rout.get('/invoice',userAuth.isLogin, orderController.loadInvoice)

user_Rout.post('/cancelProducts',userAuth.isLogin, orderController.verifyCancelProducts)

user_Rout.get('/wishlist',userAuth.isLogin, wishlistController.LoadWishlist)
user_Rout.post('/verifyWishlist',userAuth.isLogin, wishlistController.verifyWishlist)
user_Rout.post('/removeWishlist',userAuth.isLogin, wishlistController.removeWishlist)

user_Rout.get('/wallet',userAuth.isLogin, walletController.loadWallet)
user_Rout.post('/wallet',userAuth.isLogin, walletController.verifyWallet)
user_Rout.post('/withrowFormWallet',userAuth.isLogin, walletController.withdrowFormWallet)





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