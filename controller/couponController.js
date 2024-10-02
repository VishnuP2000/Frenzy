
const coupon=require('../model/coupomModel')


const LoadCoupon=async(req,res)=>{
    try {
        console.log('enter the data')
        
        const coupData=await coupon.find({})
        if(coupData){
            console.log('enter the coupData',coupData)
            res.render('coupon',{coupData})
        }
    } catch (error) {
        console.log('enter the eroor',error)
        
    }
 }

 const verifyCoupon=async(req,res)=>{
    try {
        console.log('enter the verifyCoupon')
       
        
        const {discount,Amount,expiryDate,couponName}=req.body
        console.log('enter the datas',discount,Amount,expiryDate,couponName)
        const couponData=new coupon({
            couponCode:couponName,
            discount:discount,
            criteriaAmount:Amount,  
            expireDate:expiryDate,
            is_claimed:false
        })
        await couponData.save()
        res.redirect('coupon')
    } catch (error) {
        console.log('enter the error',error)
        
    }
 }
 const couponDelete=async(req,res)=>{
    try {
        console.log('enter the couponDelete')
        const couponid=req.body.del_id
        console.log('enter the couponid',couponid)
        const couponUser=await coupon.findOne({_id:couponid})
        console.log('enter the couponUser',couponUser)
        if(couponUser){
            await couponUser.deleteOne({_id:couponid})
            res.redirect('coupon')
        }

        
    } catch (error) {
        
    }
 }
 const couponActieve=async(req,res)=>{
    try {
        console.log('enter the couponActieve')
        const couponId= req.query.id;
        console.log('enter the offer',couponId)
        const data=await coupon.findOne({_id:couponId})
        console.log('enter data',data)
        if(data.is_activated==true){
            const result = await  coupon.findOneAndUpdate({_id: couponId},{$set:{is_activated:false}})
            res.json({result})
            console.log('enter the result data true')
        }else{
            const result = await  coupon.findOneAndUpdate({_id: couponId},{$set:{is_activated:true}})
            console.log('enter the result data false')
            res.json({result})

        }
    } catch (error) {
        console.log('enter the error',error)
        
    }
 }
 const couponEdit=async(req,res)=>{
    try {
        console.log('enter the couponEdit')
        const coupid=req.query.id
        console.log('enter the coupid',coupid)
        const coupondata=await coupon.findOne({_id:coupid})
        console.log('enter the couponData',coupondata)
        if(coupondata){

            res.render('couponEdit',{coupondata,coupid})
        }
    } catch (error) {
        console.log('enter error',error)
    }
 }

 const varifyCouponEdit=async(req,res)=>{
    try {
        console.log('enter the veryfyOfferEdit')
        const cid=req.query.id
        const {Amount,discount,expiryDate}=req.body
        console.log('enter the cid',cid)
        console.log('enter the form datas',discount)
        console.log('enter the form datas',Amount)
        console.log('enter the form datas',expiryDate)
        const offerDt=await coupon.findOne({_id:cid})
        console.log('enter the offer',offerDt)
        if(offerDt){
          const updatOffer=await coupon.findByIdAndUpdate({_id:cid},{$set:{criteriaAmount:Amount,discount,expireDate:expiryDate}},{new:true})
          console.log('enter the updatOffer',)
        }
        res.redirect('coupon')
    
    } catch (error) {
        console.log('enter the error',error)
        
    }
 }

 module.exports={
    LoadCoupon,
    verifyCoupon,
    couponDelete,
    couponActieve,
    couponEdit,
    varifyCouponEdit
 }