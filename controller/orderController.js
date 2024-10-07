const { name } = require('ejs')
const { format } = require('date-fns');
const Order = require('../model/orderModel')
const cartData = require('../model/cartModel')
const Address = require('../model/Address')
const prod = require('../model/product_Model')
const product = require('../model/product_Model')
const wallet=require('../controller/walletController')
const razorp=require('../controller/checkoutController')
const coupon=require('../model/coupomModel')
const wall=require('../model/walletModel')




const LoadOrderPage = async (req, res) => {
    try {
        console.log('ente the LoadOrderPage')
        const userId = req?.session?.user_id
         
        // const ordId=req.session.orderID
        console.log('userId ', userId)
        const OrderDetails = await Order.find({userId})
      
        // console.log('enter the load order page', orders)
        console.log('Orders after sorting:', OrderDetails);

        if (OrderDetails.length) {
            const que = parseInt(req.query.page) || 1;
            const limit = 7;
            const OrderDet = await Order.find({userId}).sort({_id:-1})
            const orders = OrderDet.length;
            const totalPages = Math.ceil(totalUsers / limit);
            const start = (que - 1) * limit;
            const end = que * limit;
            let users = OrderDet.slice(start, end)
            // const paginatedProducts = producters.slice(start, end);

            console.log("Orders found, rendering page");
            res.render('user/Dashboard', { que: que, orders: orders, totalPages: totalPages, users: users});
        } else {
            console.log("No orders found");
            res.render('user/Dashboard', { orders: [] });
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(500).send("Internal Server Error");
    }
}
const generateOrderId = () => {
    return Math.floor(100000 + Math.random() * 9000);


};

const verifyOrderPage = async (req, res) => {
    try {
        console.log('enter the verifyOrderPagellllllllllllllllllllllllllllllll')
        const addId = req.body.selectedAddress;
        const method=req.body.paymentMethod
        const couponId=req.body.couponId
        
         console.log('couponId',couponId)
         console.log('method',method)
       
         console.log('address id', addId)


        


        const userId = req.session.user_id
        const cart = await cartData.findOne({ userId: userId })
        for(let Producted of cart.products){

            await product.findOneAndUpdate({_id:Producted.product},{$inc:{quantity:-Producted.quantity}})
        }
       
        console.log('cart', cart)

        const orderedProducts = await Promise.all(cart.products.map(async item => {
            const product = await prod.findById(item.product);
            if (!product) {
                throw new Error(`Product with ID ${item.product} not found`);
            }
            const price = product.finalPrice;
            if (typeof price !== 'number') {
                throw new Error(`Invalid price for product ID ${item.product}`);
            }
            return {
                product: item.product,
                quantity: item.quantity,
                price: price,
                totalPrice: price * item.quantity,
                status: 'placed'
            };
        }));

        const AddressData = await Address.findOne({ _id: addId })
        console.log('enter the AddressData', AddressData)
        const orderid = generateOrderId()
        // req.session.orderID=orderid
        console.log('orderid', orderid)
        const subtotal = orderedProducts.reduce((sum, item) => sum + item.totalPrice, 0) + 50
        console.log('enter the subtotal', subtotal)
        if(couponId!='no'){ 
            console.log('reach the couponId if')
            
            const couponSelect=await coupon.findOneAndUpdate({_id:couponId},{$set:{is_claimed:true}})
            console.log('eneter the couponselect',couponSelect)
            if(couponSelect.length){

            }
            const subTotal=parseInt(subtotal-((subtotal*couponSelect.discount)/100))
            console.log('subtotal',subTotal)
           

            console.log('reach the userId')
            if (AddressData) {
                const newOrder = new Order({
                    userId,
                    orderId: orderid,
                    name: AddressData.firstName,
                    shipAddress: AddressData,
                    orderdProducts: orderedProducts,
                    purchaseData: new Date().toDateString(),
                    paymentMethode: method,
                    subTotal: subTotal,
                    purchaseTime:new Date(),
                })
                await newOrder.save()
                const delecart = await cartData.deleteOne({ userId: userId })
                console.log('newOrder if', newOrder)
                // res.render("user/successOrder")


                if(method=='online'){
                    console.log('enter the online payment')
                    const razorPay=await razorp.razorpayRes(subTotal,orderid)
                    console.log('razorPay',razorPay)
                    
                    return res.json({razorPay})
                    
        
                    
                }else if(method=='wallet'){
                    console.log('enter the wallet methode')
                    const result=await wallet.paymentWallet(subTotal,userId)
                    console.log('result',result)
                    if(result.success==true){
                       console.log('result.success==true')
                       
                       return  res.json({success:true})
                    }else{
                    console.log('result.success==false')
                    res.json({success:false,error:'insufficient balance '})
        
                   }
        
                }else if(method=='cash'){
                    return res.json({success:true})
                }
    
                
    
            }
               
            
        }else{
            console.log('reach the userId else')
            if (AddressData) {
                const newOrder = new Order({
                    userId,
                    orderId: orderid,
                    name: AddressData.firstName,
                    shipAddress: AddressData,
                    orderdProducts: orderedProducts,
                    purchaseData: new Date().toDateString(),
                    paymentMethode: method,
                    subTotal: subtotal,
                    purchaseTime:new Date(),
                })
                await newOrder.save()
                const delecart = await cartData.deleteOne({ userId: userId })
                console.log('newOrder else', newOrder)
                // res.render("user/successOrder")
                
                if(method=='online'){
                    console.log('enter the online payment')
                    const razorPay=await razorp.razorpayRes(subtotal,orderid)
                    console.log('razorPay',razorPay)
                    
                    return res.json({razorPay})
                    
        
                    
                }else if(method=='wallet'){
                    console.log('enter the wallet methode')
                    const result=await wallet.paymentWallet(subtotal,userId)
                    console.log('result',result)
                    if(result.success==true){
                       console.log('result.success==true')
                       
                       return  res.json({success:true})
                    }else{
                    console.log('result.success==false')
                    res.json({success:false,error:'insufficient balance '})
        
                   }
        
                }else if(method=='cash'){
                    return res.json({success:true})
                }
                
    
            }
        }
        

      

      



    } catch (error) {
        console.log('error while creating the order', error)

    }
}


const verifyCancelProducts = async (req, res) => {
    try {
        const { productId } = req.query;
        console.log(productId, 'remove');
        const userid=req.session.user_id
        console.log(userid, 'userid');

        const result = await Order.findOneAndUpdate(
            { "orderdProducts._id": productId },
            { $set: { "orderdProducts.$.status": 'cancelled' } },
            { new: true }
        );
        console.log('enter the result',result)

        
        if (result) {
            console.log('etnere the if result')
            const orderedProduct = result.orderdProducts.find(product => product._id.toString() === productId);
            if (orderedProduct && (result.paymentMethode === 'wallet' || result.paymentMethode === 'online')) {
                const amount = orderedProduct.totalPrice;
                
                console.log('etnere the amount',amount);
                
                // const date = format(new Date(), 'dd/MM/yy, hh:mm a');
                const date = format(new Date(), 'dd/MM/yy, hh:mm a');
                console.log('etnere the if orderedProduct')

                const wallet = await wall.findOneAndUpdate(
                    { userId: userid},
                    {   $inc: { balance: amount },
                        $addToSet: {
                            transactionHistory: {
                                amount:amount,
                                date,
                                paymentMethod: 'cancell amount',
                                status: 'credit'
                            }
                        }
                    },
                    { new: true }
                );

                console.log("wallet",wallet); // log wallet to see if the update was successful
            }

            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
};

const loadInvoice=async(req,res)=>{
    try {
        console.log('enter the loadInvoice')
        const invoiceId=req.query.id
        console.log('invoiceId',invoiceId)
        const date=Date
        const invoiceData=await Order.find({orderId:invoiceId}).populate('orderdProducts.product')
        console.log('invoiceData',invoiceData)
        if(invoiceData){
            console.log('inside the invoiceData')

            res.render('user/invoice',{invoiceData,date})
        }
    } catch (error) {
        console.log('enter the error',error)
        
    }
}



module.exports = {

    verifyOrderPage,
    LoadOrderPage,
    generateOrderId,
    verifyCancelProducts,
    loadInvoice
    
}