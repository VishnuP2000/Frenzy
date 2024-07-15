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
const adminAuth=require('../middleware/adminAuth')
// const adminController = r


console.log(" it is reached at admin page")

admin_rount.post('/adminLogin',adminAuth.isLogout,adminController.verifyloagin)

admin_rount.get('/dashboard',adminAuth.isLogin,adminController.loadDashboard)

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

admin_rount.get('/deletProduct',adminAuth.isLogin,adminController.upload,adminController.deletProduct)
// admin_rount.get('/deletProduct',adminAuth.isLogin, adminController.deletProduct)


module.exports=admin_rount