const mongoose = require('mongoose');

const UsageSchema = mongoose.Schema({
    date:
    {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    task_title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Usage', UsageSchema)