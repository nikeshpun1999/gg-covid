const mongoose = require('mongoose');

const DashboarduserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    usertype:{
        type: String,
        required: true
    },
    status:{
        type:Boolean,
        default:true
    }


})

module.exports = mongoose.model('Dashuser', DashboarduserSchema)