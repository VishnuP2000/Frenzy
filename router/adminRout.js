const express=require('express')
const admin_rount=express()
const session=require('express-session')
const flash = require('express-flash')

admin_rount.use(flash())

admin_rount.use(session({
    secret:process.env.sessionSecret,
    resave:false,
    saveUninitialized:true
}))

const path = require('path')
admin_rount.set('view engine','ejs')
admin_rount.set('views','view/admin')
admin_rount.use(express.json())
admin_rount.use(express.urlencoded({extended:true}))
const adminController=require('../controller/adminController')
const productOfferController=require('../controller/productOfferController')
const categoryOfferController=require('../controller/categoryOfferController')
const couponController=require('../controller/couponController')
const adminAuth=require('../middleware/adminAuth')
const salerpt=require('../controller/salesReportController')
const chartController=require('../controller/chartController')
// const adminController = r


console.log(" it is reached at admin page")

admin_rount.post('/adminLogin',adminAuth.isLogout,adminController.verifyloagin)

admin_rount.get('/dashboard',adminAuth.isLogin,adminController.loadDashboard)
admin_rount.get('/weeklySales',adminAuth.isLogin,chartController.weeklySales)
admin_rount.get('/monthlySales',adminAuth.isLogin,chartController.monthlySales)
admin_rount.get('/yearlySales',adminAuth.isLogin,chartController.yearlySales)


admin_rount.get('/userList',adminAuth.isLogin,adminController.loaduserList)
admin_rount.get('/',adminAuth.isLogout,adminController.loadloagin)

admin_rount.get('/blockUser',adminAuth.isLogin,adminController.userBlock)


admin_rount.post('/addCategory',adminAuth.isLogin,adminController.categoryAdd)
admin_rount.get('/category',adminAuth.isLogin,adminController.loadCategory)
admin_rount.get('/categoryShow',adminAuth.isLogin,adminController.categoryStatus)
 admin_rount.get('/editCategory',adminAuth.isLogin,adminController.categoryEdit)
 admin_rount.post('/changeCategory',adminAuth.isLogin,adminController.editCat)


 admin_rount.get('/Logout',adminAuth.isLogin,adminController.Logout)

 admin_rount.get('/order',adminAuth.isLogin,adminController.LoadOrder)


 admin_rount.get('/product',adminAuth.isLogin,adminController.LoadProduct)
admin_rount.get('/AddProduct',adminAuth.isLogin,adminController.ProductAdd)
admin_rount.get('/editProduct',adminAuth.isLogin,adminController.ProductEdit)
admin_rount.post('/editProduct',adminAuth.isLogin,adminController.upload,adminController.updateProduct)

admin_rount.post('/AddProduct',adminAuth.isLogin,adminController.upload,adminController.ProductAdding)
admin_rount.get('/ProductShow',adminAuth.isLogin,adminController.PoductStatus)
admin_rount.get('/adminDetail',adminAuth.isLogin,adminController.detailAdmin)
admin_rount.post('/productStatus',adminAuth.isLogin,adminController.changeStatus)


admin_rount.get('/deletProduct',adminAuth.isLogin,adminController.upload,adminController.deletProduct)

admin_rount.get('/productOffer',adminAuth.isLogin,productOfferController.productOffer)
admin_rount.post('/productOffer',adminAuth.isLogin,productOfferController.verifyProductOffer)
admin_rount.get('/offerActive',adminAuth.isLogin,productOfferController.offerActive)
admin_rount.post('/delId',adminAuth.isLogin,productOfferController.offerDelId)
admin_rount.get('/editData',adminAuth.isLogin,productOfferController.offerEdit)
admin_rount.post('/editData',adminAuth.isLogin,productOfferController.VerifyOfferEdit)

admin_rount.get('/categoryOffer',adminAuth.isLogin,categoryOfferController.LoadCategoryOffer)
admin_rount.post('/categoryOffer',adminAuth.isLogin,categoryOfferController.verifyCategoryOffer)
admin_rount.post('/delCatId',adminAuth.isLogin,categoryOfferController.categoryDelete)
admin_rount.get('/cateofferActive',adminAuth.isLogin,categoryOfferController.cateofferActive)
admin_rount.get('/catEditData',adminAuth.isLogin,categoryOfferController.cateofferEdit)
admin_rount.post('/catEditData',adminAuth.isLogin,categoryOfferController.verifycateofferEdit)

admin_rount.get('/coupon',adminAuth.isLogin,couponController.LoadCoupon)
admin_rount.post('/addcoupon',adminAuth.isLogin,couponController.verifyCoupon)
admin_rount.post('/Deletcoupon',adminAuth.isLogin,couponController.couponDelete)
admin_rount.get('/couponActieve',adminAuth.isLogin,couponController.couponActieve)
admin_rount.get('/couponEdit',adminAuth.isLogin,couponController.couponEdit)
admin_rount.post('/couponEdit',adminAuth.isLogin,couponController.varifyCouponEdit)

admin_rount.get('/salesReport',adminAuth.isLogin,salerpt.salesReport)
admin_rount.get('/sortReport',adminAuth.isLogin,salerpt.sortReport)

// admin_rount.get('/deletProduct',adminAuth.isLogin, adminController.deletProduct)


module.exports=admin_rount