const mongoose = require('mongoose');

const PhotovideoSchema = mongoose.Schema({
    heading_eng:
    {
        type: String,
        required: true
    },
    heading_nep: {
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
        type: Boolean,
        default:true
    },
    category:{
        type: String,
        required: true
    },
    photovideo: {
        type: Array,
        default: []
    },
    position: {
        type: Number,
        required: true
    },

})

module.exports = mongoose.model('Photovideo', PhotovideoSchema)