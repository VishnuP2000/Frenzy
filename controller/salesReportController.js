
const { $gte, $eq } = require('sift')
const orderList=require('../model/orderModel')
const salesReport = async (req, res) => {
    try {
        console.log('enter the loadProduct')
        // let productDetails = await sProduct.find({}).populate('category').sort({ date: -1 });
        const result = await orderList.find({ 'orderdProducts.status': 'delivered' }).populate('orderdProducts.product').sort({ date: -1 });
        console.log('enter the productDetail')
        
        let page = parseInt(req.query.page) || 1;
        console.log('enter the page')
        let limit = 7;
        // let usersDetails = await orderList.find({})
        console.log('enter the userDetails')
        if(result.length){

        let totalUsers = result.length;
        console.log(totalUsers);
        let totalPages = Math.ceil(totalUsers / limit);

        console.log(totalPages);
        
        // let totalPages=totalUsers/limit

        let start = (page - 1) * limit;
        let end = page * limit;
        let users = result.slice(start, end);
        
        console.log('enter the users')
       
        res.render('salesReport',{
            result:users,
            totalPages:totalPages,
            totalUsers:totalUsers,
            currentPage:page,
            searchDate:"",
            sortData:""
        })
    }else{
        res.render('salesReport',{users:[]})
    }
    } catch (error) {
        console.log('Error in salesReport:', error);
        res.status(500).send('Internal Server Error');
    }
};
const sortReport = async (req, res) => {
    try {
        const sortData = req.query.selectMenu; // Get sortData from the query string

        let result = [];
        let srtDate;

        if (sortData === 'day') {
            srtDate = new Date().toDateString();
            result = await orderList.find({ purchaseData: srtDate, 'orderdProducts.status': 'delivered' })
                .populate('orderdProducts.product')
                .sort({ purchaseData: -1 });
        } else if (sortData === 'month') {
            srtDate = new Date();
            const sortMonth = new Date(srtDate.getFullYear(), srtDate.getMonth(), 1);
            result = await orderList.find({ purchaseTime: { $gte: sortMonth }, 'orderdProducts.status': 'delivered' })
                .populate('orderdProducts.product')
                .sort({ purchaseTime: -1 });
        } else if (sortData === 'year') {
            srtDate = new Date();
            const sortYear = new Date(srtDate.getFullYear(), 0, 1);
            result = await orderList.find({ purchaseTime: { $gte: sortYear }, 'orderdProducts.status': 'delivered' })
                .populate('orderdProducts.product')
                .sort({ purchaseTime: -1 });
        } else {
            return res.status(400).send('Invalid sorting parameter');
        }

        // Pagination logic
        let page = parseInt(req.query.page) || 1;
        let limit = 7;
        let totalOrders = result.length; // More appropriate name
        let totalPages = Math.ceil(totalOrders / limit);
        let start = (page - 1) * limit;
        let end = page * limit;
        let orders = result.slice(start, end);

        // Render the salesReport view with pagination and sortData
        return res.render('salesReport', {
            result: orders,
            totalPages: totalPages,
            totalOrders: totalOrders, // More appropriate name
            currentPage: page,
            sortData: sortData || '', // Pass sortData to the template
            searchDate: ""
        });
    } catch (error) {
        console.error('Error in sortReport:', error);
        return res.status(500).send('Server error');
    }
};
const searchWithDate = async (req, res) => {
    try {
        console.count("searchwithdate");
        const searchDate=req.body?.searchDate;  
        console.log("searchDate : ",searchDate);

       
        let searchedDate = searchDate ? new Date(searchDate) : null;
        console.log('enter the searchDate'+searchDate)

        let report = [];
        if (searchedDate) {
            report = await orderList.find({ purchaseTime: { $gt: searchedDate } })
                                    .populate('orderdProducts.product')
                                    .sort({ purchaseTime: 1 });
        }

        let page = parseInt(req.query.page) || 1;
        let limit = 7;

        if (report.length) {
            let totalUsers = report.length;
            let totalPages = Math.ceil(totalUsers / limit);

            let start = (page - 1) * limit;
            let end = page * limit;
            let users = report.slice(start, end);

            // Pass searchDate to the view, ensure it is not undefined
            res.render('salesReport', {
                result: users,
                totalPages: totalPages,
                totalUsers: totalUsers,
                currentPage: page,
                searchDate: searchDate || '' ,// Make sure searchDate is a string, not undefined
                sortData:""
            });
        }
    } catch (error) {
        console.log('Error searching with the date in sales:', error);
    }
};

const searchWithDateGet = async (req, res) => {
    try {
        console.count("searchwithdate");
        const searchDate= req.query?.searchDate;  // Get searchDate from body (POST) or query (GET)
        console.log("searchDate : ",searchDate);

        // Ensure searchDate has a default value to avoid undefined issues
        let searchedDate = searchDate ? new Date(searchDate) : null;

        let report = [];
        if (searchedDate) {
            report = await orderList.find({ purchaseTime: { $gt: searchedDate } })
                                    .populate('orderdProducts.product')
                                    .sort({ purchaseTime: -1 });
        }

        let page = parseInt(req.query.page) || 1;
        let limit = 7;

        if (report.length) {
            let totalUsers = report.length;
            let totalPages = Math.ceil(totalUsers / limit);

            let start = (page - 1) * limit;
            let end = page * limit;
            let users = report.slice(start, end);

            // Pass searchDate to the view, ensure it is not undefined
            res.render('salesReport', {
                result: users,
                totalPages: totalPages,
                totalUsers: totalUsers,
                currentPage: page,
                searchDate: searchDate || '', // Make sure searchDate is a string, not undefined
                sortData:""
            });
        }
    } catch (error) {
        console.log('Error searching with the date in sales:', error);
    }
};


module.exports={
    salesReport,
    sortReport,
    searchWithDate,
    searchWithDateGet
}