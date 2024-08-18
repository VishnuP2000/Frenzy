const usersmodel=require('../model/userModel')

const isLogin = async (req, res, next) => {
    const use=await usersmodel.findOne({_id:req.session.user_id})
    try {
        
        console.log("userAuth......");
        if (req.session.user_id) {

            if(use.is_blocked==false){
                next()
            }else{
                req.session.user_id=null;
               res.redirect('/login')
            }
            
        }
        else {
            return res.redirect('/login');
        }

    } catch (error) {
        console.log(error.message);
    }
}
const isLogout = async (req, res, next) => {

    try {
        if (req.session.user_id) {
            res.redirect("/");

        } else {

            next();
        }

    } catch (error) {

        console.log(error.message);

    }
}


module.exports = {
    isLogin,
    isLogout
}