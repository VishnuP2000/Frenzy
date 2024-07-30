
const { $elemMatch } = require('sift')
const cartData=require('../model/cartModel')
const user=require('../model/userModel')
const productsData=require('../model/product_Model');
const { model } = require('mongoose');
const product = require('../model/product_Model');



const LoadCart=async(req,res)=>{
    try {
        console.log('Enter the LoadCart');
        const productId = req.body.proId;
        const userid =req.session.user_id;
        console.log('userId',userid)
        
        const car = await cartData.findOne({ userId: userid }).populate('products.product').exec();
        
        if (!car) {
            // If no cart is found, send an empty array to the template
            console.log("!carr")
            return res.render('user/cart', {dataCart: car });
        }else{
            console.log('car',car)
            // const data=await user.find({_id:userid})
            // console.log('data',data)

    
            console.log('enter the car')
            res.render('user/cart',{dataCart: car })
        }

    } catch (error) {
        console.error('Error in LoadCart:', error);
        res.status(500).send('An error occurred');
    }
}

const addToCart = async (req, res) => {
    try {
        console.log('Enter the addToCart');
        const productId = req.body.proId;
        console.log('productId',productId)
        const quantity=req.body.quantity;
        console.log('quantity',quantity)
        const userId = req.session.user_id;

        // Check if the user already has a cart
        const exist = await cartData.findOne({userId:userId })
        console.log('exist ',exist)
        if (!exist) {
            // const dataExist=await cartData.findOne({'products.product':productId})

            console.log('enter the !exist')
            // const existingProduct=await cartData.findOne({$and:[{products:{$elemMatch:{_id:productId}}},{userId:userId }]})
            const cartUpdate=new cartData({
                userId,
                products: [
                    {
                        product:productId,
                        quantity,
                    }
                ]
                
            })
            await cartUpdate.save()

            console.log('enter the cartUpdate',cartUpdate)
            
                // const dat=new cartData({
                //     userId:userId,
                //     products:[
                //         {
                //             product:ObjectId,
                //             quantity:quantity
                            
                //         }
                //     ]
                // })
                // await dat.save()
                // res.json({ message: false });
            // }else{
            //     console.log('enter the else case')
            //     // const cart=await cartData.findOne({userId:userId});
            //     // cartData.products.addToCart({_id:productId,quantity:quantity})
            //     const cartUpdate = cartData.findOneAndUpdate({userId: userId},{products:{$push:{product: productId,quantity:quantity}}})
            //     console.log('cartUpdate',cartUpdate)
            //     // await cart.save();
            //     res.json({status:true})
            // }
           
        } else {
           // Cart exists, check if the product is already in the cart
           console.log('enter the else case cart')
           const productIndex = exist.products.findIndex(p => p.product.toString() === productId);
           console.log('enter the else case cart 2')
           
           if (productIndex > -1) {
               console.log('enter the productIndex')
               exist.products[productIndex].quantity += quantity;
               // Product exists in the cart, update the quantity using $inc
            //    await cartData.findByIdAndUpdate(
            //        { userId: userId, 'products.product': productId },
            //        { $inc: { 'products.$.quantity': quantity } }
            //     );
                console.log('Product quantity updated');
            } else {
               console.log('enter the productIndex else case')
               // Product does not exist in the cart, add it
               exist.products.push({ product: productId, quantity: quantity });
               console.log('Product added to exist',);
            }
            await exist.save();
        }

       res.status(200).json({ success: true,});

        
        

        console.log('Processing complete');
        // res.redirect('/Dashboard');
    } catch (error) {
        console.error('Error in addToCart:', error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};


const productQuantity=async(req,res)=>{
    try {
        const {currentQuantity,productId}=req.body
        const userId = req.session.user_id;
        console.log('enter the productQuantity',currentQuantity,productId)
        const edited = await cartData.updateOne(
            { "products._id": productId },
            { $set: { "Products.$.quantity": currentQuantity } })

            const cartDocument = await cartData.findOne({ userId: userId }).populate('userId').populate({
                path: 'Products',
                populate: { path: 'product' }
            })
            res.json({ cartDocument })

    } catch (error) {
        console.log('error',error)
        
    }
}



module.exports={
    LoadCart,
    addToCart,
    productQuantity
}