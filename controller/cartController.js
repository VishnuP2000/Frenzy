
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
        const quantity = parseInt(req.body.quantity, 10);
        console.log('quantity',quantity)
        const userId = req.session.user_id;

        // Check if the user already has a cart
        const exist = await cartData.findOne({userId:userId })
        console.log('exist ',exist)
        if (!exist) {
        

            console.log('enter the !exist')
          
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
            
              
           
        } else {
           // Cart exists, check if the product is already in the cart
           console.log('enter the else case cart')
           const productIndex = exist.products.findIndex(p => p.product.toString() === productId);
           console.log('enter the else case cart 2')
           
           if (productIndex > -1) {
               console.log('enter the productIndex')
               exist.products[productIndex].quantity += quantity;

               await exist.save();

                console.log('Product quantity updated');
            } else {
               console.log('enter the productIndex else case')
               // Product does not exist in the cart, add it
               exist.products.push({ product: productId, quantity: quantity });
               console.log('Product added to exist',);

               await exist.save();

            }
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
        console.log(currentQuantity,productId,'eiiiiiiiiiiiiiiiiiiiiiiii')
        const userId = req.session.user_id;
        console.log('enter the productQuantity',currentQuantity,productId)
        const edited = await cartData.updateOne(
            { "products._id": productId },
            { $set: { "products.$.quantity": currentQuantity } })

            const cartDocument = await cartData.findOne({ userId: userId }).populate('userId').populate({
                path: 'products',
                populate: { path: 'products' }
            })
            res.json({ cartDocument })

    } catch (error) {
        console.log('error',error)
        
    }
}

const removeCart = async (req, res) => {
  try {
    console.log('enter the removeCart');
    const removeId = req.body.id;
    console.log('removeid', removeId);
    const removeCart = await cartData.findOne({'products.product': removeId});
    console.log('removeCart', removeCart);
    if (removeCart) {
      console.log('enter the removeCart');

          removeCart.products = removeCart.products.filter(prod => prod.product.toString() !== removeId);
     

      await removeCart.save();

    

      res.status(200).json({ message:true });
    } else {
      res.status(404).json({ message: false });
    }
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports={
    LoadCart,
    addToCart,
    productQuantity,
    removeCart
}