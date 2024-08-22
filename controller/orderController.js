const { name } = require('ejs')
const Order = require('../model/orderModel')
const cartData = require('../model/cartModel')
const Address = require('../model/Address')
const prod = require('../model/product_Model')
const product = require('../model/product_Model')



const LoadOrderPage = async (req, res) => {
    try {
        console.log('ente the LoadOrderPage')
        const userId = req?.session?.user_id
         
        // const ordId=req.session.orderID
        console.log('userId ', userId)
        const OrderDetails = await Order.find({userId})
      
        // console.log('enter the load order page', orders)
        console.log('Orders after sorting:', orders);

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

        console.log('reach the userId', userId)
        if (AddressData) {
            const newOrder = new Order({
                userId,
                orderId: orderid,
                name: AddressData.firstName,
                shipAddress: AddressData,
                orderdProducts: orderedProducts,
                purchaseData: new Date().toDateString(),
                paymentMethode: 'cash',
                subTotal: subtotal,
            })
            await newOrder.save()
            const delecart = await cartData.deleteOne({ userId: userId })
            console.log('newOrder', newOrder)
            res.render("user/successOrder")

        }



    } catch (error) {
        console.log('error', error)

    }
}

const verifyCancelProducts=async(req,res)=>{
    try {
        console.log('enter the verificancel')
       const ordId=req.body.cancelId
       console.log('enter the ordid',ordId)
        const ord=await Order.findOne({'orderdProducts._id':ordId})
        console.log('enter ',ord)
        if(ord){
            const cancel=await Order.findOneAndUpdate({'orderdProducts._id':ordId},{$set:{'orderdProducts.$.status':'cancelled'}},{new:true})
            if(cancel){
                res.json(true)
            }else{
                res.json(false)
            }
        }
    } catch (error) {
        
    }
}



module.exports = {

    verifyOrderPage,
    LoadOrderPage,
    generateOrderId,
    verifyCancelProducts,
    
}