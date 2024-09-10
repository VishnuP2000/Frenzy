const categotyData=require('../model/categoryModel')
const categoryOffer=require('../model/categoryOfferModel')

const LoadCategoryOffer=async(req,res)=>{
    try {
        console.log('enter the LoadCategoryOffer')
        const catData=await categotyData.find({})
        const catOffer=await categoryOffer.find({}).populate('category')
        res.render('categoryOffer',{catData,catOffer})
    } catch (error) {
        console.log('enter the error',error)
        
    }
}

const verifyCategoryOffer=async(req,res)=>{
    try {
        console.log('enter the verifyProductOffer')
        const catId=req.body.offer
        const {discount,expiryDate,offer}=req.body
        console.log('enter the catId',catId)
        
        const catOffer=await categoryOffer.findOne({category:catId})
        console.log('enter the catOffer',catOffer)

        if(catOffer){
            console.log(' proOffer is already exists')
        return req.flash('errmsg','product is already exist')
        }else{
            console.log('enter the proOffer ')
            const catofferData=new categoryOffer({
                category:offer,
                discount:discount,
                expireDate:expiryDate,
                is_activated:true
            })
            await catofferData.save()
        }
        res.redirect('categoryOffer')
    } catch (error) {
        console.log('enter the error',error)
        
    }
}
const categoryDelete=async(req,res)=>{
    try {
        console.log('enter the offerDelId')
        const offerDelete=req.body.del_id
        console.log('enter the offerDelete',offerDelete)
        const offerData=await categoryOffer({_id:offerDelete})
        console.log('enter the offerData',offerData)
        if(offerData){
            await categoryOffer.findOneAndDelete({_id:offerDelete});
           res.json({success:true})
        }
    } catch (error) {
        console.log('ener the error',error)
        
    }
}
const cateofferActive=async(req,res)=>{
    try {
        console.log('enter the cateofferActive')
        const offer_id= req.query.id;
        console.log('enter the offerid',offer_id)
        const data=await categoryOffer.findOne({_id:offer_id})
        console.log('enter data',data)
        if(data.is_activated==true){
            const result = await  categoryOffer.findOneAndUpdate({_id: offer_id},{$set:{is_activated:false}})
            res.json(result)
            console.log('enter the result data true')
        }else{
            const result = await  categoryOffer.findOneAndUpdate({_id: offer_id},{$set:{is_activated:true}})
            console.log('enter the result data false')
            res.json(result)

        }
    } catch (error) {
        console.log('enter the error',error)
        
    }
}
const cateofferEdit=async(req,res)=>{
    try {
        console.log('enter the cateofferEdit')
      
        const ofId=req.query.id
        console.log('enter the ofId',ofId)
        const producters=await categotyData.find({})
        const offData=await categoryOffer.findOne({_id:ofId})
        console.log('enter the offData',offData)
        

        res.render('editCatOffer',{offData,producters,ofId})
        
    } catch (error) {
        console.log('enter the error',error)
    }
}
const verifycateofferEdit=async(req,res)=>{
    try {
        console.log('enter the veryfyOfferEdit')
        const idd=req.query.id
        const {offer,discount,expiryDate}=req.body
     
        const offerDt=await categoryOffer.findOne({_id:idd})
        console.log('enter the offer',offerDt)
        if(offerDt){
          const updatOffer=await categoryOffer.findByIdAndUpdate({_id:idd},{$set:{category:offer,discount,expireDate:expiryDate}},{new:true})
          console.log('enter the updatOffer',)
        }
        res.redirect('categoryOffer')

    } catch (error) {
        console.log('enter the error',error)
        
    }
}


 
module.exports={
    LoadCategoryOffer,
    verifyCategoryOffer,
    categoryDelete,
    cateofferActive,
    cateofferEdit,
    verifycateofferEdit,
    
}