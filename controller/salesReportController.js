
const { $gte, $eq } = require('sift')
const orderList=require('../model/orderModel')
const salesReport=async(req,res)=>{
    try {
        console.log('enter the salesReport')
        const result=await orderList.find({}).populate('orderdProducts.product')

        console.log('orders',result)
        res.render('salesReport',{result})
        
    } catch (error) {
        console.log('enter the catch error',error)
    }
}
const sortReport = async (req, res) => {
    try {
        console.log('Request received at /admin/sortReport');
        const sortData = req.query.selectMenu;
        console.log('sortData:', sortData);

        if (!sortData) {
            return res.status(400).send('No sorting parameter provided.');
        }

        if (sortData === 'day') {
            console.log('enter the sortData')
            const srtDate = new Date().toDateString();
            console.log('srtDate:',  srtDate);
            const result = await orderList.find({ purchaseData: srtDate }).populate('orderdProducts.product');
            console.log('result:', result);
            return res.render('salesReport', { result });
        } else if (sortData === 'month') {
            console.log('enter the month')
            const srtDate = new Date();
            const sortMonth = new Date(srtDate.getFullYear(), srtDate.getMonth(), 1);
            console.log('sortMonth:', sortMonth);
            const result = await orderList.find({ purchaseTime: { $gte: sortMonth } }).sort({purchaseTime:-1}).populate('orderdProducts.product');
            console.log('result:', result);
            return res.render('salesReport', { result });
        } else if (sortData === 'year') {
            const srtDate = new Date();
            const sortYear = new Date(srtDate.getFullYear(), 0, 1);
            console.log('sortYear:', sortYear);
            const result = await orderList.find({ purchaseTime: { $gte: sortYear } }).sort({purchaseTime:-1}).populate('orderdProducts.product');
            console.log('result:', result);
            return res.render('salesReport', { result });
        } else {
            return res.status(400).send('Invalid sort parameter');
        }
    } catch (error) {
        console.error('Error in sortReport:', error);
        return res.status(500).send('Server error');
    }
};
module.exports={
    salesReport,
    sortReport
}