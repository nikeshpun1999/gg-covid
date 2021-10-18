const mongoose = require('mongoose');

const OtpSchema = mongoose.Schema({
    otp: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required: true
    },
    created_at:{
        type:Date,
        required:true
    }

})

module.exports = mongoose.model('Otp', OtpSchema)