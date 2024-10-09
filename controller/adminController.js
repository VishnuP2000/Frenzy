const User=require('../model/userModel')
const sProduct=require('../model/product_Model')
const bcrypt = require('bcrypt')
const category=require('../model/categoryModel')
const product = require('../model/product_Model')
const order=require('../model/orderModel')
const path=require('path')
const multer=require('multer')
const fs = require('fs');


// multer
const storage = multer.diskStorage({
    destination: function(req,file,callback){
        callback(null,path.join(__dirname,'../public/userImages'));
    },
    filename: function(req,file,callback){
        callback(null, Date.now()+'-'+file.originalname)
    }
})

const upload = multer({storage: storage }).fields([
    { name: "images",maxCount: 4},
])





const loadDashboard=async(req,res)=>{
    try {
        console.log('it is okkkk')
        const userCount = await User.find({is_admin:false}).countDocuments();
        const productCount = await product.find({}).countDocuments();
        const categoryCount = await category.find({}).countDocuments()
        console.log('usercount',userCount)
        console.log('productCount',productCount)
        console.log('categoryCount',categoryCount)
        let totalEarning = 0;
        const result = await order.aggregate([{
            $group:{
                _id: null,
                totalPrice: {$sum: '$subTotal'}
            }
        }]);
        if(result.length>0){
            totalEarning = result[0].totalPrice
        }else{
            totalEarning = 0
        }

        const bestProduct = await order.aggregate([
            { $unwind: '$orderdProducts' },
            {
                $group: {
                    _id: '$orderdProducts.product',
                    totalCount: { $sum: '$orderdProducts.quantity' } // Sum the quantities ordered
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $project: {
                    _id: 1,
                    totalCount: 1,
                    'product.name': 1,
                    'category.name': 1,
                    'product.images': 1,
                    'product.quantity': 1
                }
            },
            { $sort: { totalCount: -1 } },
            { $limit: 5 }
        ]);
        console.log('bestProduct',bestProduct)

        let bestCategory = await order.aggregate([
            { $unwind: '$orderdProducts' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderdProducts.product', // Correct field
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.category', // Correctly reference the product category
                    totalCategoryCount: { $sum: 1 } // Summing the quantities
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id', // Correct field
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {$project:{_id:1,'category.name':1,totalCategoryCount:1}},
            { $sort: { totalCategoryCount: -1 } }, // Correct field
            { $limit: 5 }
        ])
        console.log('bestCategory',bestCategory);
        

        res.render('dashboard',{userCount,productCount,categoryCount,totalEarning,bestProduct,bestCategory})
    } catch (error) {
        console.log('enter the loadDashboard error',error)
    }
}

const loaduserList = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 7;
        let usersDetails = await User.find({}).sort({ date: -1 });

        let totalUsers = usersDetails.length;
        let totalPages = Math.ceil(totalUsers / limit);
        
        let start = (page - 1) * limit;
        let end = page * limit;
        let users = usersDetails.slice(start, end);
        console.log('users',users)

        res.render('userList', {
            users: users,
            currentPage: page,
            totalPages: totalPages,
            totalUsers: totalUsers
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
}; 

const loadloagin=async(req,res)=>{
    try {
        console.log('enter the login page')
        res.render("adminLogin")
    } catch (error) {
        console.log(error.message)
    }
} 
const admindetail={
    email:"edvin@gmail.com",
password:2255
}
const verifyloagin=async (req,res)=>{
    try {
        console.log('what happening here');
        // const admindetail=await User.find({is_admin:true})
        const email=req.body.email
        const password=req.body.password
        
        // const emailMatch=email==admindetail.email
        // const passwordMatch=password==admindetail.password
        // console.log(email,password,emailMatch,passwordMatch)

        if(email==admindetail.email&&password==admindetail.password){
            req.session.admin=admindetail
            res.redirect("/admin/dashboard")
        }else{
            console.log('email and password are not same');
            res.render('adminLogin',{message:'email and password are not match'})
        }

    } catch (error) {
        console.log(error.message)
    }
}

const userBlock = async(req,res)=>{
    try {
        console.log('userBlock');
        const userList_id = req.query.id;
        const data = await User.findOne({_id: userList_id});    
        // if(userList_id){
            if(data.is_blocked==true){
                const result = await  User.findOneAndUpdate({_id: userList_id},{$set:{is_blocked:false}})
                // req.session.userId=result._id
                res.json(result)
            }else{
                const result = await User.findOneAndUpdate({_id:userList_id},{$set:{is_blocked:true}})
                // req.session.userId=result._id
                res.json(result)
            }
        // }
    } catch (error) {
        console.log(error+"blockuser");
    }
}

const categoryAdd = async (req, res) => {
    try {
        const discription=req.body.discription
        
        const dataName = req.body.name.trim().toUpperCase().replace(/\s+/g, ' ')
        console.log('req.body', discription,dataName);
        const catdata = await category.findOne({ name: dataName }); // Corrected to find by name
        console.log('catdata', catdata);
        
        
        if (catdata) { // Check if catdata is not null
            console.log('Category already exists');
            // You can send a response to the client instead of using alert
           req.flash('errMsg','category already existing')
           return res.redirect('/admin/category')
        } else {

            
            console.log('enter the catdata')
            const data = new category({
                name:dataName,
                discription,
                is_Listed: true
            });

            await data.save();
            res.redirect('/admin/category');
        }

    } catch (error) {
        console.log('Error:', error); // Log the actual error
       
    }
};

const loadCategory=async(req,res)=>{
    try {
        
        const categoryData=await category.find({})
        const errorMessage=req.flash('errMsg')
        // console.log(categoryData);
        res.render('category',{categoryData,errorMessage})
    } catch (error) {
        console.log(error)
    }
}

const categoryStatus=async (req,res)=>{
    try {
        console.log('back');
      const  storedId = req.query.id
    //   console.log(catogoryId,'it is catogory')
        const catdata=await category.findById({_id:storedId})
        if(catdata.is_Listed==true){
            console.log('true');
            const result=await category.findOneAndUpdate({_id:storedId},{$set:{is_Listed:false}})
            res.json({result})
        }else{
            console.log('false');
            const result=await category.findOneAndUpdate({_id:req.query.id},{$set:{is_Listed:true}})
            res.json({result})
        }
    } catch (error) {
        console.log('categoryStatus',error);
    }
}
const PoductStatus=async (req,res)=>{
    try {
        console.log('kjhkjh');
        const prodId=req.query.id
        const prData=await sProduct.findById({_id:prodId})
        console.log('prData',prData)
        if(prData.is_blocked==true){
            const result=await sProduct.findOneAndUpdate({_id:prodId},{$set:{is_blocked:false}})
            res.json({result})
            console.log('enter the result if');
        }else{
            const result=await sProduct.findOneAndUpdate({_id:prodId},{$set:{is_blocked:true}})
            res.json({result})
            console.log('enter the result else');
        }
    } catch (error) {
        console.log('productStatus',error)
        
    }
}


const categoryEdit=async(req,res)=>{
    try {
        const findError=req.flash('findErr')
        const categoryId=req.query.categoryId
        const categoryData=await category.findOne({_id:categoryId})
        console.log(categoryId);
        console.log("enter the editCategory");
        res.render('editCategory',{categoryId,name:categoryData.name,findError})
    } catch (error) {
        console.log(error)
    }   
}
// const cateEdit=async(req,res)=>{
// try {
//     console.log('change category working');

//     res.redirect('/admin/category',)


// } catch (error) {
//     console.log(error)
// }
// }
const editCat=async(req,res)=>{
    try {
        const reqname=req.body.name
        const categoryId=req.query.categoryId
        console.log(categoryId,'edit');
        const findData=await category.findOne({name:reqname})
        if(findData){
            console.log('data already existing')
            req.flash('findErr','data already existing')
            return res.redirect(`/admin/editCategory?categoryId=${categoryId}`)
        }else{

            const change=await category.findOneAndUpdate({_id:categoryId},{$set:{name:reqname}})
            console.log('editCat',change);
            res.redirect('/admin/category')
        }
        // if(change){
        // }else{
        //     res.send('eroor')

        // }
    } catch (error) {
        console.log('error',error)
    }
}

const Logout=async(req,res)=>{
    try {
        req.session.admin=null
        res.redirect('/admin/')
    } catch (error) {
        console.log(error);
    }
}
const LoadProduct=async (req,res)=>{
    try {
        console.log('enter the loadProduct')
        let productDetails = await sProduct.find({}).populate('category').sort({ date: -1 });
        console.log('enter the productDetail')
        
        let page = parseInt(req.query.page) || 1;
        console.log('enter the page')
        let limit = 7;
        let usersDetails = await sProduct.find({})
        console.log('enter the userDetails')
        if(usersDetails.length){

        let totalUsers = usersDetails.length;
        console.log(totalUsers);
        let totalPages = Math.ceil(totalUsers / limit);

        console.log(totalPages);
        
        // let totalPages=totalUsers/limit

        let start = (page - 1) * limit;
        let end = page * limit;
        let users = productDetails.slice(start, end);
        
        console.log('enter the users')
       
        res.render('product',{
            productDetails:users,
            totalPages:totalPages,
            totalUsers:totalUsers,
            currentPage:page
        })

        }else{
            res.render('product',{users:[]})
        }

    } catch (error) {
        console.log('Load product error')
    }
}

const LoadOrder = async (req, res) => {
    try {
        console.log('order');
        
        let page = parseInt(req.query.page) || 1;
        let limit = 7;
        
        // Get the total number of orders
        const totalOrders = await order.countDocuments({});
        
        // Calculate total pages
        let totalPages = Math.ceil(totalOrders / limit);
        
        // Fetch the orders for the current page
        const orderDetail = await order.find({}).populate('orderdProducts.product').sort({ _id: -1 }).skip((page - 1) * limit).limit(limit);

        res.render('order', {
            orderDetail,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}
const ProductAdd=async(req,res)=>{
    try {
        console.log('enter the productAdd')
        const categoryData=await category.find({is_Listed:true})
        console.log('categoryData',categoryData);
        res.render('AddProduct',{category:categoryData})
    } catch (error) {
        console.log(error)
    }
}


const ProductAdding=async(req,res)=>{
    try {
        console.log('this is product adding ');
        console.log("req.files", req.files);
        const {name,category,price,quantity,description}=req.body
        console.log('enter the productdata',name,category,price,quantity,description)
        const images = req.files.images.map(file => file.filename);
        console.log('image',images)
        const data=new product({
            name,
            category,
            price,
            quantity,
           images:images,
           description,
            
            is_Listed:true
        })
        
        await data.save()
        console.log('data',data);
        res.redirect('/admin/Product')
    } catch (error) {
        console.log(error)
        console.log('not woeking')
        
    }
}

const ProductEdit=async(req,res)=>{
    try {
        const idEdit=req.query.editId
        console.log('productEdit',idEdit);
        const editData=await sProduct.findOne({_id:idEdit}).populate('category')
        const cateData=await category.find({is_Listed:true})
        console.log('cateData',cateData);
        console.log('editData',editData)
        const errmsg = req.flash('errmsg')
        if(editData){

            res.render('editProduct',{editData,errmsg,cateData,idEdit})
        }
    } catch (error) {
        console.log('error',error);
    }
}

const updateProduct = async (req, res) => {
    try {
        console.log('req.body',req.body);
        
        proid=req.query.prodId
        console.log('proid',proid)
        

      const { name, category, price, quantity,description } = req.body;
      console.log('enter the datas',name,category,price,quantity,description)
    //   console.log('Received data:', { name, category, price, quantity });
    //   console.log('product id',prId);
  
      const exist = await sProduct.findOne({_id:proid});
      console.log('exist',exist)
      console.log('Product check result:', exist);
  
      if (exist && exist._id.toString() !== proid) {
          console.log('Product already exists');
          req.flash('errmsg', 'Sorry, this product already exists!!');
        return res.redirect('/admin/editProduct');
      }
  
      let images = [];
    
      if (req.files && req.files.images && Array.isArray(req.files.images) && req.files.images.length > 0) {
        images = req.files.images.map(file => file.filename);
        console.log('Uploaded images:', images);
      } else {
        if (req.body.existingImages) {
          images = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
        }
        // console.log('Using existing images:', images);
      }
      console.log('Uploaded images:', images);
  
      
      const editStatus = await sProduct.findOneAndUpdate(
        {_id:proid}, // Pass the productId directly here
        {
          $set: {
            name,
            price,
            quantity,
            images:images,
            category,
            description,
            
          },
        },
        { new: true }
      );
  
    //   console.log('Edit status:', editStatus);
    console.log('eddit status',editStatus)
  
      if (editStatus) {
        console.log('enter the edit status if',editStatus);
        res.redirect('/admin/product');
      } else {
        console.log('enter the edit status');
        console.error('Failed to update product else');
        res.status(500).json({ error: 'Internal server error', message: 'Cannot update product' });
      }
    } catch (error) {
      console.log('enter the edit status catch');
      console.error('Error in updateProduct:', error);
      res.status(500).json({ error: 'Internal server error', message: 'An error occurred', error });
    }
 };

 
const deleteProductImage = async (req, res) => {
    try {
      const { prodId, image } = req.query;
      
      // Find the product by ID
      const product = await sProduct.findById(prodId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
  
      // Remove the image from the product's images array
      const updatedImages = product.images.filter(img => img !== image);
      product.images = updatedImages;
  
      // Save the updated product
      await product.save();
  
      // Remove the image file from the file system (optional)
      const imagePath = path.join(__dirname, '..', 'public', 'userImages', image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image file:', err);
        } else {
          console.log('Image file deleted:', imagePath);
        }
      });
  
      // Send success response
      res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  

const deletProduct=async(req,res)=>{
    try {
        console.log('deletProduct');
        const dtId=req.query.deleteId
        console.log('deleId',dtId);
        if(dtId){
            const delData=await sProduct.deleteOne({_id:dtId})
            console.log('deleteData',delData)
            res.redirect('/admin/product')
        }
    } catch (error) {
        console.log(error)
    }
}

const detailAdmin=async(req,res)=>{
    try {
        console.log('enter the detailAdmin page')
        const orderId=req.query.id
        console.log('orderId',orderId)
        const orderDAta=await order.findOne({_id:orderId}).populate('orderdProducts.product')
        console.log('orderdata',orderDAta)
        if(orderDAta){
            res.render('detailUsers',{orderDAta})
        }
    } catch (error) {
        console.log('error detailAdmin')
    }
}

const changeStatus=async(req,res)=>{
    try {
        console.log('enter the changeStatus')
        const id=req.body.productid
        const stat=req.body.status
        const amount=req.body.amount
        const statuses=req.body.statuses
        console.log('enter the amount ',amount)
        console.log('enter the statuses ',statuses)
        console.log('enter the changeStatus id',id)
        const changeData=await order.findOneAndUpdate({'orderdProducts._id':id},{$set:{'orderdProducts.$.status':stat}},{new:true})
        if(changeData.status=='cancelled'){
            const updatedWallet=await wallet.findOneAndUpdate({},{$inc:{balance:-amount},$addToSet:{amount:{amount:amount,date,paymentMethod:statuses,status:'debit'}}},{new:true});
            console.log('enter the updatedWallet',updatedWallet)
        }
        console.log('changeData',changeData)
        if(changeData){

            res.render('detailUser',{changeData})
        }

    } catch (error) {
        console.log('error',error)
        
    }
}


module.exports={
    loadDashboard,
    loaduserList,
    loadloagin,
    verifyloagin,
    userBlock,
    loadCategory,
    categoryAdd,
    categoryStatus,
    categoryEdit,
    editCat,
    Logout,
    LoadProduct,
    LoadOrder,
    ProductAdd,
    upload,
    ProductAdding,
    ProductEdit,
    updateProduct,
    deletProduct,
    deleteProductImage,
    PoductStatus,
    detailAdmin,
    changeStatus
    

}    