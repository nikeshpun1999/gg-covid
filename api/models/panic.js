const mongoose = require('mongoose');
var date=new Date()
const PanicSchema = mongoose.Schema({
    user_id:
    {
        type: String,
        required: true
    },
    panics: [{
        status:{
            type: String,
            default: "pending"
        },
        created_at: {
            type: Date,
            default: date
        }
    }]
    
})

module.exports = mongoose.model('Panic', PanicSchema)