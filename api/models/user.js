const mongoose = require('mongoose');
var date=new Date()
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        default:"Nepal"
    },
    password: {
        type: String,
        required: true
    },
    plasma_donator: {
        type: Boolean,
        default:false
    },
    OTP_confirmed: {
        type: Boolean,
        default:false
    },
    survey:[{
        date:{
            type:Date
        },
        answers:{
            type:Array,
            default:[]
        }
    }],
    reset_token:{
        type:String,
        default:null
    },
    recent_health:{
        type:Array,
        default:
        [{
            updated_at: {
                type: Date,
                default: date
            },
            status: {
                type: Number,
                default: 0
            }
        }]
    },
    location:
    {
        type: String,
        default: null
    },
    blood_type:
    {
        type: String,
        default: "unverified"
    },
    blood_donation_history: [{
        donated_at:{
            type:Date,
            default:null
        }
    }],
    date_of_birth:
    {
        type: Date,
        default: null
    },
    vaccine:
    {
        type: String,
        default: null
    },
    was_corona_patient:
    {
        type: Boolean,
        default: false
    },
    active:{
        type:Boolean,
        default:false
    },
    language_nepali:{
        type:Boolean,
        default:false
    },
    blood_dontation_status:
    {
        type:Boolean,
        default:false
    },
    responsible_person:{
        type:String,
        default:null
    },
    province:{
        type:String,
        default:null
    },
    district: {
        type: String,
        default: null
    },
    municipality: {
        type: String,
        default: null
    },
    ward_no: {
        type: Number,
        default: null
    },
    tole: {
        type: String,
        default: null
    }


})

module.exports = mongoose.model('User', UserSchema)