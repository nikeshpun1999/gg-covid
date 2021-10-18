const mongoose = require('mongoose');
var date = new Date()
const PasswordresetSchema = mongoose.Schema({
    user_id:
    {
        type: String,
        required: true
    },
    reset_token:
    {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: date
    }
})

module.exports = mongoose.model('Passwordreset', PasswordresetSchema)