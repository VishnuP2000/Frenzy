
const productExist=require('../model/product_Model')
const wishlistDatas=require('../model/wishlistModel')
const userDatas=require('../model/userModel')
const product = require('../model/product_Model')

const LoadWishlist=async(req,res)=>{
    try {
        console.log('enter the LoadWishlist')
        const userId = req.session.user_id;
        const wish=await wishlistDatas.findOne({userId:userId}).populate('products.product').exec()
        res.render('user/wishlist',{wish})
    } catch (error) {
        console.log('error LoadWislist',error)
        
    }
}

const verifyWishlist=async(req,res)=>{
    try {
        console.log('enter the verifyWishlist')
        const productId=req.body.pId
        console.log('productId',productId)
        const userId = req.session.user_id;
        console.log('userId',userId)
        const userExist=await wishlistDatas.findOne({userId:userId})
        console.log('userExist',userExist)
        if(userExist){
                                                                         // if the users are exist the wishlist
            console.log('enter the userExist')
            const productExist=await wishlistDatas.findOne({'products.product':productId})
            console.log('enter the productExist')
            if(productExist){ 
                                                                              //if the products are exist the wishlist
                console.log('product are exist ')
               return res.json({success:false,message:'product is already exist'})
            }else{
                userExist.products.push({product:productId})
                await userExist.save()
                return res.json({success:true})
            }

        }else{
                                                    //create wishlist non users
           const addProduct=new wishlistDatas({
            userId,
            products:[
                {
                product:productId
            }
        ]
           })
           await addProduct.save()
           console.log('enter the addProduct',addProduct)
           return res.json({success:true})

        }

        
    } catch (error) {
        console.log('enter the error',error)
        
    }
}

const removeWishlist=async(req,res)=>{
    try {
        console.log('enter the removeWishlist')
        const productid=req.body.prdId
        console.log('enter the productid',productid)
        
        const wishData=await wishlistDatas.findOne({'products.product':productid})
        console.log('enter the wishData',wishData)

        if(wishData){
            // await wishlistDatas.deleteOne({'products.product':productid})
            wishData.products = wishData.products.filter(prod => prod.product.toString() !== productid);
            await wishData.save()
            return res.json({success:true})
            

        }
    } catch (error) {
        console.log('error',error)
        
    }
}


module.exports={
    LoadWishlist,
    verifyWishlist,
    removeWishlist,
   
}