const Order=require('../model/orderModel')

const weeklySales = async (req, res) => {
    try {
        console.log('enter the weeklySales')
        let currentDate = new Date();
        let startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0); // Set time to start of the day

        let endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
        endOfWeek.setHours(23, 59, 59, 999); // Set time to end of the day

        // Debug: Print the start and end of the week
        console.log('Start of Week:', startOfWeek);
        console.log('End of Week:', endOfWeek);

        let orderWeek = await Order.aggregate([ 
            {
                $match: {
                    purchaseTime: {
                        $gte: startOfWeek, // Start of the week (Sunday)
                        $lt: endOfWeek     // End of the week (Saturday)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        dayOfWeek: { $dayOfWeek: '$purchaseTime' },  // Day of the week (1 for Sunday, 7 for Saturday)
                        week: { $isoWeek: '$purchaseTime' },         // ISO week number
                        year: { $isoWeekYear: '$purchaseTime' }      // ISO week year
                    },
                    totalIncome: { $sum: '$subTotal' }
                }
            },
            {
                $project: {
                    _id: 0,
                    week: '$_id.week',
                    year: '$_id.year',
                    totalIncome: 1,
                    weekDayName: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id.dayOfWeek", 1] }, then: "Sunday" },
                                { case: { $eq: ["$_id.dayOfWeek", 2] }, then: "Monday" },
                                { case: { $eq: ["$_id.dayOfWeek", 3] }, then: "Tuesday" },
                                { case: { $eq: ["$_id.dayOfWeek", 4] }, then: "Wednesday" },
                                { case: { $eq: ["$_id.dayOfWeek", 5] }, then: "Thursday" },
                                { case: { $eq: ["$_id.dayOfWeek", 6] }, then: "Friday" },
                                { case: { $eq: ["$_id.dayOfWeek", 7] }, then: "Saturday" }
                            ],
                            default: "Unknown"
                        }
                    }
                }
            },
            {
                $sort: { "_id.dayOfWeek": 1 } // Sort by day of the week
            }
        ]);

        // console.log(orderWeek);

        res.json({ orderWeek })
    } catch (error) {
        console.log(error, 'from weekly sales loading');

    }
}

const monthlySales = async (req, res) => {
    try {
        let orderMonth = await Order.aggregate([
            {
                $group: {
                    _id: { $month: '$purchaseTime' },
                    totalIncome: { $sum: '$subTotal' }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id',
                    totalIncome: 1,
                    monthName: {
                        $arrayElemAt: [
                            ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                            { $subtract: ["$_id", 1] }
                        ]
                    }
                }
            }
        ]);


        // console.log(orderMonth)
        // console.log(JSON.stringify(orderWeek, null, 2));

        return res.json({ orderMonth })
    } catch (error) {
        console.log(error, 'from report in admin side');
    }
}

const yearlySales = async (req, res) => {
    try {
        let orderYear = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$purchaseTime' },
                    }, totalIncome: { $sum: '$subTotal' }
                }
            }

        ])

        // console.log(orderYear);
        return res.json({ orderYear })

    } catch (error) {
        console.log(error);

    }
}



module.exports={
    weeklySales,
    monthlySales,
    yearlySales
}