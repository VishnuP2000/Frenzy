const Product = require('../model/product_Model')
const nodemailer = require('nodemailer')
const user = require('../model/userModel')
const session = require('express-session');
const bcrypt = require('bcrypt');
const user_Rout = require('../router/userRout');
const product = require('../model/product_Model');
const Otp = require('../model/otpModel')
const cat=require('../model/categoryModel')


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
        const userId = req.session.user_id;
        const userData = await user.findOne({ _id: userId })
        const productsData = await product.find({is_blocked: false}).populate('category');

        let products = productsData.filter((pro)=> pro.category&&pro.category.is_Listed)

        if (userData) {
            res.render('user/home', { products, name: userData.name })
        } else {
            res.render('user/home', { name: '', products })
        }

    } catch (error) {
        console.log(error);
    }
}

const loadShope = async (req, res) => {
    try {
        const products = await Product.find({ is_blocked: false }).populate('category').exec();
        
        // Filter products that belong to listed categories
        const producters = products.filter(prod => prod.category && prod.category.is_Listed);

        if (producters.length) {
            const que = parseInt(req.query.page) || 1;
            const limit = 7;
            const usersDetails=await Product.find({}).sort({Date:-1})

            const totalUsers=usersDetails.length;
            const totalPages = Math.ceil(totalUsers / limit);
            
            const start = (que - 1) * limit;
            const end = que * limit;
            let users=usersDetails.slice(start,end)

            const paginatedProducts = producters.slice(start, end);

            res.render('user/shope', { producters: paginatedProducts, que:que, totalUsers:totalUsers, totalPages:totalPages,users:users });
        } else {
            res.render('user/shope', { producters: [] });
        }

    } catch (error) {
        console.log(error);
    }
};

const loadProduct = async (req, res) => {
    try {
        res.render('user/product')
    } catch (error) {
        console.log(error);
    }
}

const logoutHome = async (req, res) => {
    try {
        req.session.user_id = null

        res.redirect('/')

    } catch (error) {
        console.log(error)
    }
}

const loadLoagin = async (req, res) => {
    try {
        const block= req.flash('block')
        const login_id = req.session.user_id
        console.log('entering the load login', login_id)

        if (login_id) {
            console.log('login id');

            res.redirect('/')
        } else {
            res.render('user/login',{block})
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
        console.log("data")
        if (data) {
            console.log(data)

            const passwordMatch = await bcrypt.compare(password, data.password)

            if (passwordMatch) {
                console.log('password is corrected');
                if (data.is_blocked == false) {
                    console.log("it is not bloked ");
                    req.session.user_id = data._id;
                    console.log('it is session storage', req.session.user_id)
                    res.redirect('/')
                } else {
                    console.log("it is blocked");
                    req.flash('block','Blocked')
                    return res.redirect('/login')
                }
            } else {
                req.flash('block','email and password are not match')
                return res.redirect('/login' )
            }
        } else {
            req.flash('block','user is not exist')
            return res.render('/login')
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
            //    const{otp,email}=req.body
            const genOtp = generateOTP()
             req.session.regen=generateOTP()
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
        req.session.resend=dbsOtp.otp
        console.log('after the dbsOtp save');
        const mailOptions = {
            from: process.env.user,
            to: email,
            subject: 'OTP for Email Verification',
            text: `Your OTP for email verification${genOtp}`
        }
        await transporter.sendMail(mailOptions)

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
        const regenarate=req.session.regen;
     
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
        const product = await Product.find({ _id: proId }).populate('category')
        const category=await cat.find({})
        
        if (proId) {

            res.render('user/productDetail', { product })
        }
    } catch (error) {
        console.log('error', error)
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
    mailVarify,
    verifyMail,
    paswordOtp,
    otpPasword,
    updatePass,
    passUpdate

}