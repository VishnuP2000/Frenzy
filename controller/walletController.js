
const { format } = require('date-fns');
const wallet=require('../model/walletModel')
const users=require('../model/userModel')

const loadWallet=async(req,res)=>{
    try {
        console.log('enter the loadWallet')
        res.render('user/wallet')
    } catch (error) {
        console.log('error',error)
        
    }
}
const verifyWallet=async(req,res)=>{
    try {
        console.log('enter the verifyWallet')
        const userId=req.session.user_id
        console.log('enter the userId',userId)
        const {amount,paymentMethod}=req.body
        console.log('req.body',amount,paymentMethod)
        console.log('type',typeof paymentMethod)
        const date=format(new Date(),'dd/MM/yy, hh:mm a');
        console.log('date',date)
        
        const userExist=await wallet.findOne({userId:userId})
        console.log('userExist',userExist)
        // const wallets=await wallet.findOne({userId:userId})
       
        if(!userExist){
            const userWallet=new wallet({
                userId:userId,
                balance:amount,
                transactionHistory:{
                    amount:amount,
                    date:date,
                    paymentMethod:paymentMethod,
                    status:'credit'
                }
            })
           await userWallet.save()
          return res.json({success:true})
        }else{
            console.log('enter the userExist else case')
            const Wallets=await wallet.findOneAndUpdate( 
                {userId:userId},
                {
                    $inc: { balance:amount },  
                     $addToSet: {
                transactionHistory: {
                    amount,
                    date,
                    paymentMethod,
                    status: 'credit'
                },
                
            }
        },
        { new: true }
        );
        console.log('enter the Wallets',Wallets)
       return res.json({success:true})
        }   
        
      
      
        
    } catch (error) {
        console.log('enter the catch error',error)
       return res.status(400).send(error.message);
        
    }
}

const withdrowFormWallet=async(req,res)=>{
    try {
        console.log('enter the with withdrowFormWallet')
        const userId=req.session.user_id;
        const {amount,paymentMethod}=req.body
        const date=format(new Date(),'dd/MM/yy, hh:mm a');
        const transactionAmount=parseFloat(amount) 
        const wallets=await wallet.findOne({userId:userId})
        console.log('wallets',wallets)
        if(!wallet){
           return res.json({success:false})
        }
        if(wallet.balance<transactionAmount){
            return res.json({success:false})

        }
        const updatedWallet=await wallet.findOneAndUpdate({userId:userId},{$inc:{balance:-transactionAmount},$addToSet:{transactionHistory:{amount:transactionAmount,date,paymentMethod:'wallet',status:'debit'}}},{new:true});
        console.log('updatedWallet',updatedWallet)
        return res.json({success:true})

    } catch (error) {
        console.log('enter the catch error',error)
        
    }
}

module.exports={
    loadWallet,
    verifyWallet,
    withdrowFormWallet
}