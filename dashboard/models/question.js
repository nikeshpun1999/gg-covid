const mongoose = require('mongoose');

const QuestionSchema = mongoose.Schema({
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
        type: String,
        default: true
    },
    position: {
        type: String,
        required: true
    },
    main_img: {
        type: String,
        required: true
    },
    question_type: {
        type: String,
        required: true
    },
    awareness_img: {
        type: String,
        required: true
    },
    survey: [{
        survey_heading: {
            type: String,
            default: null
        },
        survey_img: {
            type: String,
            default: null
        }
    }]

})

module.exports = mongoose.model('Question', QuestionSchema)