const mongoose = require('mongoose');

const HelplineSchema = mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    organization_name_eng: {
        type: String,
        required: true
    },
    organization_name_nep: {
        type: String,
        required: true
    },
    help_type: {
        type: String,
        required: true
    },
    contact:
    {
        type: Number,
        required: true
    },
    location:
    {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    active:{
        type:Boolean,
        default:true
    },
    logo:{
        type:String,
        default:null
    },
    position:{
        type:Number,
        required:true
    }
})

module.exports = mongoose.model('Helpline', HelplineSchema)