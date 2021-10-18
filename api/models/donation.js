const mongoose = require('mongoose');
var date=new Date();
const DonationSchema = mongoose.Schema({
    date:
    {
        type: Date,
        default: date
    },
    amount: {
        type: Number,
        required: true
    },
    donator: {
        type: String,
        required: true
    },
    testimonial: {
        type: String,
        required: true
    },
    voucher: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    }

})

module.exports = mongoose.model('Donation', DonationSchema)