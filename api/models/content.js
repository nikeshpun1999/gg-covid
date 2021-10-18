const mongoose = require('mongoose');

const ContentSchema = mongoose.Schema({
    heading_eng:
    {
        type: String,
        required: true
    },
    heading_nep:
    {
        type: String,
        required: true
    },
    where: {
        type: String,
        required: true
    },
    caption_eng: {
        type: String,
        required: true
    },
    caption_nep: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    media:[{
        media_name: {
            type: String,
            default: null
        }
    }]
})

module.exports = mongoose.model('Content', ContentSchema)