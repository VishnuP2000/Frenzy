const mongoose = require('mongoose')
const category = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    discription:{
      type: String,
        required:true
   },
   status:{
    type:Boolean,
    default:true
   },
    is_Listed: {
        type: Boolean,
        default:false
    }

})
module.exports = mongoose.model('category', category);