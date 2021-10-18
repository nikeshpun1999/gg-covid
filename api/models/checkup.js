const mongoose = require('mongoose');
var date = new Date()
const CheckupSchema = mongoose.Schema({
    user_id: {
        type: String,
        default: null
    },
    date: {
        type: Date,
        default: date
    },
    answers: {
        type: Array,
        required:true
    },   
    status: {
        type: String,
        required:true
    }
 
})

module.exports = mongoose.model('Checkup', CheckupSchema)