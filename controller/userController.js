
const nodemailer = require('nodemailer')
const user = require('../model/userModel')
const session = require('express-session');
const bcrypt = require('bcrypt');
const user_Rout = require('../router/userRout');
const product = require('../model/product_Model');
const Otp = require('../model/otpModel')
const cat = require('../model/categoryModel')
const userAddress = require('../model/Address');
const datass = require('../model/cartModel')
const Order = require('../model/orderModel')
const flash = require('express-flash');
const Address = require('../model/Address');
const wallet=require('../model/walletModel')
const productOffer=require('../model/productOfferModel')
const categoryOffer=require('../model/categoryOfferModel')
const wall=require('../model/walletModel')



//  bcrypt function

const securepassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log("error : ", error);
        console.log(error.message);
    }
}


const loadHome = async (req, res) => {

    try {
        console.log('enter the load home')


        const productsData = await product.find({ is_blocked: false }).populate('category');

        let products = productsData.filter((pro) => pro.category && pro.category.is_Listed)


        console.log('enter the products')
        res.render('user/home', { products })

    } catch (error) {
        console.log(error);
    }
}

const loadShope = async (req, res) => {
    try {
        const products = await product.find({ is_blocked: false }).populate('category').exec();


        // Filter products that belong to listed categories
        const producters = products.filter(prod => prod.category && prod.category.is_Listed);
        

        for(let produ of products){
            let finalPrice=produ.price
            
        let offer=0

             const proOffer=await productOffer.findOne({product:produ._id, is_activated:true})
             const cateOffer=await categoryOffer.findOne({category:produ.category,is_activated:true})

             if(proOffer){

                 finalPrice=produ.price*((100-proOffer.discount)/100)
                 offer=proOffer.discount
             }
             
           if(cateOffer&&offer<cateOffer.discount){
            finalPrice=produ.price*((100-cateOffer.discount)/100)
            offer=cateOffer.discount
           }


         const offerData=await product.findByIdAndUpdate({_id:produ._id},{$set:{finalPrice,offer}},{new:true})
        }

        const catData = await cat.find({ is_Listed: true })
        console.log('catData', catData)
        console.log('producters', producters)
        
        

        


        if (producters) {
            const que = parseInt(req.query.page) || 1;
            const limit = 7;
            const usersDetails = await product.find({}).sort({ Date: -1 })

            const totalUsers = usersDetails.length;
            const totalPages = Math.ceil(totalUsers / limit);

            const start = (que - 1) * limit;
            const end = que * limit;
            let users = usersDetails.slice(start, end)

            const paginatedProducts = producters.slice(start, end);

            res.render('user/shope', { producters: paginatedProducts, que: que, totalUsers: totalUsers, totalPages: totalPages, users: users, catData: catData,Id:'',searchString:'' });
        } else {
            res.render('user/shope', { producters: [], catData: catData,Id:'',searchString:'',que: que });
        }

    } catch (error) {
        console.log(error);
    }
};

const filterShope = async (req, res) => {
    try {
        const Id = req.query.id; // Category ID
        const NameSearch = req.query.searchName; // Search string
        let producters = [];
        
        // Build search query
        let searchQuery = {};
        if (NameSearch) {
            let searchNumber = parseInt(NameSearch, 10);
            searchQuery = {
                $or: [
                    { name: { $regex: new RegExp(NameSearch, 'i') } }
                ]
            };

            if (!isNaN(searchNumber)) {
                searchQuery.$or.push({ price: { $lte: searchNumber } });
            }
        }

        // Get products based on search query
        let products = await product.find(searchQuery).sort({ price: -1 }).populate('category');
        
        // Filter products by category and ensure category is listed
        if (Id) {
            producters = products.filter(prod => prod.category && prod.category._id == Id && prod.category.is_Listed);
        } else {
            producters = products; // No category filter, return all
        }

        // Fetch categories for the dropdown
        const catData = await cat.find({ is_Listed: true });

        // Pagination logic
        const que = parseInt(req.query.page) || 1;
        const limit = 7;
        const totalUsers = producters.length;
        const totalPages = Math.ceil(totalUsers / limit);
        const start = (que - 1) * limit;
        const end = que * limit;
        const paginatedProducts = producters.slice(start, end);

        res.render('user/shope', {
            catData,
            producters: paginatedProducts,
            que: que,
            totalUsers: totalUsers,
            totalPages: totalPages,
            Id: Id || '', // Ensure category ID persists
            searchString: NameSearch || '' // Ensure search string persists
        });
    } catch (error) {
        console.log('error', error);
        res.render('user/shope', { producters: [], catData: [], Id: '', searchString: '', que: 1, totalPages: 0 });
    }
};

const shopeSort = async (req, res) => {
    try {
        // Extract search and sorting parameters from query
        const namesearch = req.query.searchName || '';
        const sortId = req.query.id; // Sorting criterion (e.g., "High to low", "aA - zZ")
        console.log('namesearch:', namesearch);
        console.log('sortId:', sortId);

        // Build the search query based on the search string (namesearch)
        let searchQuery = { is_blocked: false }; // Default filter to exclude blocked products
        if (namesearch) {
            searchQuery.$or = [
                { name: { $regex: new RegExp(namesearch, 'i') } } // Search products by name (case-insensitive)
            ];
        }

        // Determine the sorting option based on the selected criterion (sortId)
        let sortOptions = {};
        if (sortId === 'High to low') {
            sortOptions.price = -1; // Sort by price descending
        } else if (sortId === 'Low to high') {
            sortOptions.price = 1;  // Sort by price ascending
        } else if (sortId === 'aA - zZ') {
            sortOptions.name = 1;   // Sort alphabetically (A-Z)
        } else if (sortId === 'zZ - aA') {
            sortOptions.name = -1;  // Sort alphabetically (Z-A)
        }

        // Fetch products based on the search query and apply sorting
        let products = await product.find(searchQuery).sort(sortOptions).populate('category');
        console.log('Found products:', products.length);

        // Filter products to ensure the category is listed and not blocked
        let producter = products.filter(prod => prod.category && prod.category.is_Listed);

        // Fetch category data for displaying in dropdown
        const catData = await cat.find({ is_Listed: true });

        // Paginate the results
        const que = parseInt(req.query.page) || 1;
        const limit = 7;
        const totalProducts = producter.length;
        const totalPages = Math.ceil(totalProducts / limit);
        const start = (que - 1) * limit;
        const paginatedProducts = producter.slice(start, start + limit);

        // Render the result with the searched and sorted products
        res.render('user/shope', {
            producters: paginatedProducts,
            totalPages: totalPages,
            catData: catData,
            que: que,
            Id: sortId || '',
            searchString: namesearch
        });

    } catch (error) {
        console.log('Error in shopeSort:', error);
        res.render('user/shope', {
            producters: [],
            totalPages: 0,
            catData: [],
            que: 1,
            Id: '',
            searchString: ''
        });
    }
};

const searchProducts = async (req, res) => {
    try {
        console.log('enter the searchProducts ')
        let page = 0
        let searchString = req.query.search
        console.log('enter the searchString',searchString)
        console.log('enter the searchProcts ', searchString)
        const catData = await cat.find({ is_Listed: true })

        console.log('enter the searchProcts catData', catData)
        // if (!searchString) {
        //     console.log('enter the !searchString ')
        //     return res.status(400).json({ error: 'Search string is required' });
        // }

        let searchNumber = parseInt(searchString, 10);

        let searchQuery = {
            $or: [
                { name: { $regex: new RegExp(searchString, 'i') } }
            ]
        };

        if (!isNaN(searchNumber)) {
            console.log('enter the searchProducts !isNaN ')
            searchQuery.$or.push({ price: { $lte: searchNumber } });
        }

        console.log('searchQuery',searchQuery);

        let products = await product.find(searchQuery).sort({ price: -1 }).populate('category')
        // console.log(products);

        const producters = products.filter(prod => prod.category && prod.category.is_Listed);
        console.log(producters);

        if (producters) {
            const que = parseInt(req.query.page) || 1;
            const limit = 7;
            const usersDetails = await product.find({}).sort({ Date: -1 })

            const totalUsers = usersDetails.length;
            const totalPages = Math.ceil(totalUsers / limit);

            const start = (que - 1) * limit;
            const end = que * limit;
            let users = usersDetails.slice(start, end)

            const paginatedProducts = producters.slice(start, end);

            res.render('user/shope', { products, searchString, productCount: products.length, page, catData: catData, totalUsers: totalUsers, que: que, totalPages: totalPages, producters: paginatedProducts,Id:'',searchString:searchString || ''  })
        }

    } catch (error) {
        console.log('enter the catch case');
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

const loadProduct = async (req, res) => {
    try {
        res.render('user/product')
    } catch (error) {
        console.log(error);
    }
}

const Dashboard = async (req, res) => {
    try {
        if (req.query.orderOpen) {
            req.flash('OpenOrder', 'Open')
            return res.redirect('/Dashboard')
        }

        const OpOrder = req.flash('OpenOrder')

        const userId = req.session.user_id
       
        const walletData=await wallet.findOne({userId:userId}).lean();
        console.log('enter the walletData',walletData)
      
        const userData = await user.findOne({ _id: userId })
        const dataCart = await datass.findOne({ _id: userId })
        console.log('userid', userId)
        const orders = await Order.find({ userId }).populate('orderdProducts.product').sort({ _id: -1 })


        const address = await userAddress.find({ userId: userId })
        res.render('user/Dashboard', { userData, address, dataCart, orders, OpOrder,walletData:walletData })
    } catch (error) {
        console.log('error',error)
    }
}



const logoutHome = async (req, res) => {
    try {
        req.session.user_id = null
        console.log('req.session.user_id');
        res.redirect('/')

    } catch (error) {
        console.log(error)
    }
}

const loadLoagin = async (req, res) => {
    try {

        const block = req.flash('block')
        const login_id = req.session.user_id
        console.log('entering the load login', login_id)

        if (login_id) {
            console.log('login id');

            res.redirect('/')
        } else {
            res.render('user/login', { block })
        }

    } catch (error) {
        console.log(error)
    }
}



const creatLoagin = async (req, res) => {
    try {
        console.log("enter the creatLogin")
        const email = req.body.email
        console.log(email);
        const password = req.body.password
        console.log(password)
        console.log('checking data is exist or not')
        const data = await user.findOne({ email: email })

        console.log("data", email)
        if (data) {
            console.log(data)
            req.session.loginData = data

            const passwordMatch = await bcrypt.compare(password, data.password)

            if (passwordMatch) {
                console.log('password is corrected');
                if (data.is_blocked == false) {
                    console.log("it is not bloked ");
                    req.session.user_id = data._id;
                    req.session.password = password
                    console.log('it is session storage', req.session.user_id)
                    res.redirect('/')
                } else {
                    console.log("it is blocked");
                    req.flash('block', 'Blocked')
                    return res.redirect('/login')
                }
            } else {
                req.flash('block', 'email and password are not match')
                return res.redirect('/login')
            }
        } else {
            req.flash('block', 'user is not exist')
            return res.redirect('/login')
        }
    } catch (error) {
        res.send('not working')
    }
}



// const UserDash=async(req,res)=>{
//     try {
//         console.log('this is userDashboard')
//         res.send('hello userDashboard')
//     } catch (error) {

//     }
// }


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.user,
        pass: process.env.pass
    }
});




const loadRegister = async (req, res) => {

    try {
        // const userId=req.session.user_id
        console.log('dsdddddddddd', req.body);


        console.log(req.body, 'aaaaaaaaaaaa');
        const { name, email, password, mobile } = req.body
        console.log(name, email, password, mobile)
        const dataUser = await user.findOne({ email: email })
        console.log("here")

        const secuPasssword = await securepassword(password)
        console.log("here1")
        console.log(secuPasssword)
        if (dataUser) {
            req.flash('regMesg', 'users already exist')
            return res.redirect('/register')

        } else {
            console.log("get the datas");
            const dBase = new user({
                name: name,
                email: email,
                password: secuPasssword,
                mobile: mobile

            })
            console.log(name, email, password, mobile)
            const save = await dBase.save()

            console.log('save', save)
            console.log('dBase', dBase)

            const userWallet=new wall({
                userId:save._id,
                balance:0,
                transactionHistory:[]
            })
           await userWallet.save()
           console.log('entere the userWallet')

            //    const{otp,email}=req.body
            const genOtp = generateOTP()
            req.session.regen = generateOTP()
            console.log(genOtp)
            const dbsOtp = new Otp({
                otp: genOtp,
                email: email
            })
            await dbsOtp.save()

            const mailOptions = {
                from: process.env.user,
                to: email,
                subject: 'OTP for Email Verification',
                text: `Your OTP for email verification${genOtp}`
            }
            await transporter.sendMail(mailOptions)

            console.log("get the otp");
            req.session.email = email
            req.session.id = dbsOtp
            res.redirect(`/otp?email=${email}`)
        }




        // verifyemail(req.session.dataUser.name, req.session.dataUser.email, req.session.otp)
    } catch (error) {
        console.log('err  loadRegister', error);

    }
}
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);

};

// resend otp
const verifyresendOtp = async (req, res) => {
    try {
        // console.log("enter otp");
        // req.session.otp=undefined

        // req.session.otp=generateOTP()
        // verifyemail(req.session.dataUser.name,req.session.dataUser.email,req.session.otp)
        const email = req.query.email
        // const emaildata=await Otp.findOne({email:email})
        console.log('email', email);

        const genOtp = generateOTP()
        console.log(genOtp)
        const dbsOtp = new Otp({
            otp: genOtp,
            email: email
        })
        await dbsOtp.save()
        req.session.resend = dbsOtp.otp
        console.log('after the dbsOtp save');
        const mailOptions = {
            from: process.env.user,
            to: email,
            subject: 'OTP for Email Verification',
            text: `Your OTP for email verification${genOtp}`
        }
        await transporter.sendMail(mailOptions)
 console.log('enter the redirect otp');
        res.redirect(`/otp?email=${email}`)
    } catch (error) {
        // res.status(404).json({ err:error.message})
        console.log('error', error)
    }
}

const loadOtp = async (req, res) => {
    try {
        const email = req.session.email
        const errorOtp = req.flash('erMrsg')
        res.render('user/otp', { errorOtp, email })
    } catch (error) {
        console.log(error, 'load otp');

    }
}


const otpverification = async (req, res) => {
    try {
        console.log("enter the verification page");

        // Extract email and OTP parts from the request body
        const email = req.body.email;
        const { otp1, otp2, otp3, otp4 } = req.body;
        const otp = parseInt([otp1, otp2, otp3, otp4].join(''));

        // Get the resend OTP from the session
        const resendOtp = req.session.resend;
        console.log('otp from resend', resendOtp);

        // Log before finding OTP data
        console.log('before resend otp');
        const regenarate = req.session.regen;

        // Find the OTP data from the database
        const otpData = await Otp.findOne({ email: email });
        console.log('after finding otp data');

        // Check if the provided OTP matches the one in the database
        if (otpData && otpData.otp == otp) {
            // Find the user data based on the provided email
            const userData = await user.findOne({ email: email });

            // Store user ID in session and redirect to home
            req.session.user_id = userData._id;
            console.log('near redirect');
            res.redirect('/');
        } else {
            // If OTP does not match, flash error message and redirect to OTP page
            req.flash('erMrsg', 'invalid otp');
            return res.redirect('/otp');
        }
    } catch (error) {
        // Log any error that occurs
        console.log(error, 'otpVerification');
    }
};


// const otpverification=async (req,res)=>{
//     try {
//         otpValue=Number(req.body.otp.join(''))
//         const otpDoc=await otp.findOne({otp:otpValue})
//         if(otpDoc){
//             res.redirect('/')
//         }else{
//             res.render('user/otp', { otpStatus: false });
//         }

//     } catch (error) {
//         console.log(error)
//     }
// }


// const verifyemail = async (name, email, otp) => {
//     try {
//         console.log(name, email, otp);
//         const transport = nodemailer.createTransport({
//             service: "gmail",


//             auth: {
//                 user: "vishnujithu60@gmail.com",
//                 pass: "ncyx slpj njip mzwd",
//             }
//         });
//         const mailoption = {
//             from: "vishnujithu60@gmail.com",
//             to: email,
//             subject: 'for verification mail',
//             html: `<h1>hi ${name} this is for ka e-comares store verification otp <br><br> <a  style='color='blue'; href=''>${otp}</a></h1>`
//         }
//         transport.sendMail(mailoption, (err, info) => {
//             if (err) {
//                 console.log(err.message);
//             }
//             else {
//                 console.log(`Email has been sent: ${info.messageId}`);
//                 console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
//             }
//         })
//     } catch (error) {
//         console.log('sending mail',error.message);
//     }
// }


const findRegister = async (req, res) => {
    try {
        const regOtp = req.flash('regMesg')
        res.render('user/register', { regOtp })

    } catch (error) {
        console.log('error');
    }
}


const DetailProduct = async (req, res) => {
    try {
        console.log('comme baby');
        const proId = req.query.ProductId
        console.log('pro id', proId);
        const prod = await product.findOne({ _id: proId }).populate('category')
        console.log('enter the productd', prod)
        const category = await cat.find({ _id: proId }).populate('category')

        if (prod) {

            res.render('user/productDetail', { prod: prod, category: category })
        }
    } catch (error) {
        console.log('error', error)
    }
}



const googleAuth = async (req, res) => {
    try {
        // console.log('$$$$$$$$',req,'req  fdjkfjdfjdksjfdkjfdklfjdfjkdlsj');
        // console.log(req.profile.email,'req.profile.email ...................*******************');
        console.log('enter the googleAuth first')
        if (!req.user) {
            res.redirect('/failure')
        }





        let usergoogle = await user.findOne({ email: req.user.email })
        console.log('enter the googleAuth')


        if (usergoogle) {
            console.log('enter the googleAuth,usergoogle')

            req.session.user_id = usergoogle._id
            console.log('it is inside of the existing googleauth')
            res.redirect('/')

        } else {


            const googleRegister = new user({
                username: req.user.name.givenName,
                email: req.user.email,
                // googleId: req.user.id,
                is_verified: 1
            })


            let googledoc = await googleRegister.save()

            req.session.user_id = googledoc._id
            console.log(req.session.user_id)
            res.redirect('/')
        }

    } catch (error) {
        console.log(error)
    }
}

const googleFail = async (req, res) => {
    try {
        res.send('googleFail error')
    } catch (error) {
        console.log('googleFail error', error);
    }
}



const mailVarify = async (req, res) => {
    try {
        console.log('emailverification')
        res.render('user/emailVarification')
    } catch (error) {
        console.log('error', error)
    }
}
const verifyMail = async (req, res) => {
    try {
        const maildata = req.body.email
        const datamail = await user.findOne({ email: maildata })
        req.session.email = maildata
        if (datamail) {
            const mailOtp = generateOTP()
            const varifyData = new Otp({
                otp: mailOtp,
                email: datamail.email
            })
            await varifyData.save()
            console.log('mailOtp', mailOtp);
            const mailOptions = {
                from: process.env.user,
                to: datamail.email,
                subject: 'OTP for Email Verification',
                text: `Your OTP for email verification${mailOtp}`
            }
            await transporter.sendMail(mailOptions)

            console.log("get the otp");
            // req.session.email=email
            res.redirect('/paswordOtp')

        } else {
            res.status(404).json({ message: 'Email not found' });
        }

    } catch (error) {
        console.log('error', error)
    }
}

const paswordOtp = async (req, res) => {
    try {

        res.render('user/forgetOtp')
    } catch (error) {
        console.log('error', error)
    }
}
const otpPasword = async (req, res) => {
    try {
        console.log("enter the OtpPasword page");
        // const email=req.body.email
        const { otp1, otp2, otp3, otp4 } = req.body
        const otp = parseInt([otp1, otp2, otp3, otp4].join(''))
        console.log('otp from otpPasword', otp);


        const otpData = await Otp.findOne({ otp: otp })

        console.log('enter inside the otpData', otpData)
        if (otpData.otp == otp) {
            // const data=await user.findOne({email:email})

            // req.session.user_id=data._id
            // res.redirect('/')
            res.redirect('/updatePassword')
        }
    } catch (error) {

    }
}

const updatePass = async (req, res) => {
    try {
        res.render('user/forgetPassword')
    } catch (error) {
        console.log('error', error)
    }
}

const passUpdate = async (req, res) => {
    try {
        const mail = req.session.email
        console.log('passupdate', mail);
        const newPass = req.body.password
        console.log('new passss', newPass);
        const confirmPass = req.body.confirm_password
        console.log('enter the password')
        if (newPass === confirmPass) {
            const updatePass = await securepassword(confirmPass)
            console.log('enter inside the ')
            const updateData = await user.findOneAndUpdate({ email: mail }, { password: updatePass }, { new: true })
            console.log('updateDataaaa', updateData)
            res.redirect('/login')
        }
    } catch (error) {
        console.log('error', error)
    }
}



const LoadchangePassword = async (req, res) => {
    try {
        console.log('enter the change password')
        const notMatch=req.flash('notMatch')
        res.render('user/changePassword',{notMatch})
    } catch (error) {
        console.log('error', error)
    }
}

const changePassword = async (req, res) => {
    try {
        console.log('Changing password');
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const storedPassword = req.session.password;

        console.log('storedPassword', storedPassword);

        if (currentPassword === storedPassword) {
            const userId = req.session.userId; // Assuming userId is stored in session

            const userData = await user.findOne({ id: userId });
            console.log('enter the userData',userData)
            
            if (userData) {
                console.log('enter the userData if')
                if (newPassword === confirmPassword) {
                    console.log('enter the userData if==')
                    const hashedPassword = await securepassword(newPassword);
                    req.session.cpassword=confirmPassword

                    await user.findOneAndUpdate({ id: userId }, { password: hashedPassword }, { new: true });
                    console.log('Password updated successfully');

                     res.redirect('/Dashboard');
                } else {
                    req.flash('notMatch','New password and confirm password do not match')
                    console.log('New password and confirm password do not match');
                   return res.redirect('/changePassword');
                }
            } else {
                console.log('User data not found');
                res.render('user/changePassword');
            }
        } else {
            console.log('Current password is incorrect');
            req.flash('notMatch','Current password is incorrect')
           return res.redirect('/changePassword');
        }
    } catch (error) {
        console.log('Error:', error);
        
    }
};

const LoadEditProfile = async (req, res) => {
    try {
        console.log('enter the editProfile')
        const editId = req.session.user_id
        const loadData = await user.findOne({ _id: editId })
        if (loadData) {
            console.log('enter the loadData')
            res.render('user/editProfile', { loadData })
        } else {
            console.log('loadData are not exist', error)
        }
    } catch (error) {
        console.log('error', error)
    }
}

const editProfile = async (req, res) => {
    try {
        console.log('enter the editProfile')
        userName = req.body.username
        userPhone = req.body.phone
        id = req.session.user_id
        console.log('id', id)

        const editData = await user.findOne({ _id: id })

        if (editData) {
            console.log('enter the editData')
            const Data = await user.findOneAndUpdate({ _id: id }, { name: userName, mobile: userPhone }, { new: true })
            req.session.id = Data._id
            console.log('req.session.id', req.session.id)
            console.log('enter user ', Data)
            console.log('enter the username and mobiles are update')
            res.redirect('/Dashboard')
        } else {
            console.log('editData are not exist here')
        }


    } catch (error) {
        console.log('error', error)
    }
}

const LoadAddress = async (req, res) => {
    try {
        // const id=req.session.user_id
        // const address=await userAddress.findOne({_id:id})
        console.log('enter the LoadAddress')
        // const AdData=req.session.Address
        // const DataAddress=await Address.findOne({})

        console.log('enter the Address')
        res.render('user/Address')



    } catch (error) {
        console.log('error', error)
    }
}



const verifyAddress = async (req, res) => {
    try {
        console.log('Entering verifyAddress');
        const userId = req.session.user_id

        // Destructure the request body
        const { firstName, lastName, country, streetName, town, state, postCode, phone, email } = req.body;


        console.log('Address Data', firstName, lastName, country, streetName, town, state, postCode, phone, email);

        // Validate required fields

        // Create a new address document
        const addressData = new userAddress({
            firstName,
            lastName,
            country,
            streetName,
            town,
            state,
            postCode,
            phone,
            email,
            userId
        });

        // Save the document to the database
        await addressData.save();

        console.log('Saved Address Data:', addressData);

        // Redirect to the address page
        res.redirect('/Dashboard');
    } catch (error) {
        console.error('Error saving address data:', error);
        res.status(500).send('Internal Server Error');
    }
};

const deleteAddress = async (req, res) => {
    try {
        console.log('entet the deleteAddress')
        const del = req.query.delId
        console.log('del', del)
        if (del) {

            console.log('entet the del', del)
            await userAddress.deleteMany({ _id: del })
            res.redirect('/Dashboard')
        }

    } catch (error) {

    }
}

const LoadEditAddress = async (req, res) => {
    try {
        console.log('enter the LoadEditAddress')

        console.log('enter load', req.query)
        const editid = req.query.editId
        console.log('editid', editid)
        const addresData = await userAddress.find({ _id: editid })
        if (addresData) {

            // console.log('enter the addresData',addresData)
            res.render('user/editAddress', { addresData, editid })
        }
    } catch (error) {
        console.log('error')
    }
}

const verifyEditAddress = async (req, res) => {
    try {
        console.log('enter the verifyEditAddress')
        console.log("body : ", req.body);
        const editid = req.body.id
        console.log('enter ', req.body)
        console.log('ente ', editid)
        const { firstName, lastName, country, streetName, town, state, postCode, phone, email } = req.body;
        const verify = await userAddress.findOne({ _id: editid })
        console.log('enter the verify', verify)
        if (verify) {
            console.log('enter the verify')
            const changeAddress = await userAddress.findOneAndUpdate({ _id: editid },{ firstName, lastName, country, streetName, town, state, postCode, phone, email })
            console.log('enter the changeAddres',changeAddress)
            res.redirect('/Dashboard')
        }
    } catch (error) {
        console.log('enter the catch verifyeditaddress', error)

    }
}
const addAddress = async (req, res) => {
    try {
        const data = req.body;
        const userId=req.session.user_id;
        console.log("data : ", data);
        const newAddress = new Address({...data,userId});
        await newAddress.save();
        // console.log('enter the verifyEditAddress')
        // console.log("body : ",req.body);
        // const editid=req.body.id
        // console.log('enter ',req.body)
        // console.log('ente ',editid)
        // const { firstName, lastName, country, streetName, town, state, postCode, phone, email} = req.body;
        // const verify=await userAddress.findOne({_id:editid})
        // console.log('enter the verify',verify)
        // if(verify){
        //     console.log('enter the verify')
        //     const changeAddress=await userAddress.findOneAndUpdate({firstName, lastName, country, streetName, town, state, postCode, phone, email})
        res.redirect('/Dashboard')

    } catch (error) {
        console.log('enter the catch verifyeditaddress', error)

    }
}






module.exports = {
    loadHome,
    loadShope,
    loadProduct,
    loadLoagin,
    loadRegister,
    creatLoagin,
    findRegister,
    loadOtp,
    otpverification,
    // LoadresendOtp,
    verifyresendOtp,
    logoutHome,
    DetailProduct,
    googleAuth,
    mailVarify,
    verifyMail,
    paswordOtp,
    otpPasword,
    updatePass,
    passUpdate,
    googleFail,
    filterShope,
    shopeSort,
    searchProducts,
    Dashboard,
    LoadchangePassword,
    changePassword,
    LoadEditProfile,
    editProfile,
    LoadAddress,
    verifyAddress,
    deleteAddress,
    LoadEditAddress,
    verifyEditAddress,
    addAddress



}