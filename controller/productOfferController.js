const prod=require('../model/product_Model')
const prodOffer=require('../model/productOfferModel')

const productOffer=async(req,res)=>{
    try {
        console.log('enter the productOffer')
        // const userId=req.session.user_id
        // console.log('enter the userId',userId)
        const err=req.flash('errmsg')
        const productData=await prod.find({})
        const productOffer=await prodOffer.find({}).populate('product')
        console.log('ener the productdata',productData)
        res.render('productOffer',{productData,productOffer,err})
    } catch (error) {
        console.log('enter the error',error)
    }
}
const verifyProductOffer=async(req,res)=>{
    try {
        console.log('enter the verifyProductOffer')
        const proId=req.body.offer
        const {discount,expiryDate,offer}=req.body
        console.log('enter the pro',proId)
        
        const proOffer=await prodOffer.findOne({product:proId})
        console.log('enter the proOffer',proOffer)

        if(proOffer){
            console.log(' proOffer is already exists')
        return req.flash('errmsg','product is already exist')
        }else{
            console.log('enter the proOffer ')
            const offerData=new prodOffer({
                product:offer,
                discount:discount,
                expireDate:expiryDate,
                is_activated:true
            })
            await offerData.save()
        }
        res.redirect('productOffer')
    } catch (error) {
        console.log('enter the error',error)
        
    }
}
const offerActive=async(req,res)=>{
    try {
        console.log('enter the offerActive')
        const offer_id= req.query.id;
        console.log('enter the offer',offer_id)
        const data=await prodOffer.findOne({_id:offer_id})
        console.log('enter data',data)
        if(data.is_activated==true){
            const result = await  prodOffer.findOneAndUpdate({_id: offer_id},{$set:{is_activated:false}})
            res.json(result)
            console.log('enter the result data true')
        }else{
            const result = await  prodOffer.findOneAndUpdate({_id: offer_id},{$set:{is_activated:true}})
            console.log('enter the result data false')
            res.json(result)

        }
    } catch (error) {
        console.log('enter the error',error)
        
    }
}
const offerDelId=async(req,res)=>{
    try {
        console.log('enter the offerDelId')
        const offerDelete=req.body.del_id
        console.log('enter the offerDelete',offerDelete)
        const offerData=await prodOffer({_id:offerDelete})
        console.log('enter the offerData',offerData)
        if(offerData){
            await prodOffer.findOneAndDelete({_id:offerDelete});
           res.json({success:true})
        }
    } catch (error) {
        console.log('ener the error',error)
        
    }
}
const offerEdit=async(req,res)=>{
    try {
        console.log('enter the offerEdit')
      
        const ofId=req.query.id
        console.log('enter the ofId',ofId)
        const producters=await prod.find({})
        const offData=await prodOffer.findOne({_id:ofId})
        console.log('enter the offData',offData)
        

        res.render('editOffer',{offData,producters,ofId})
        
    } catch (error) {
        console.log('enter the error',error)
    }
}
const VerifyOfferEdit=async(req,res)=>{
    try {
        console.log('enter the veryfyOfferEdit')
        const idd=req.query.id
        const {offer,discount,expiryDate}=req.body
        console.log('enter the idd',idd)
        console.log('enter the form datas',offer)
        console.log('enter the form datas',discount)
        console.log('enter the form datas',expiryDate)
        const offerDt=await prodOffer.findOne({_id:idd})
        console.log('enter the offer',offerDt)
        if(offerDt){
          const updatOffer=await prodOffer.findByIdAndUpdate({_id:idd},{$set:{product:offer,discount,expireDate:expiryDate}},{new:true})
          console.log('enter the updatOffer',)
        }
        res.redirect('productOffer')

    } catch (error) {
        console.log('enter the error',error)
        
    }

}

module.exports={
    productOffer,
    verifyProductOffer,
    offerActive,
    offerDelId,
    offerEdit,
    VerifyOfferEdit

}