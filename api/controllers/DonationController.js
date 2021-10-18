
const response_codes = require('../../language/responsecodes');
const Donation = require('../models/donation');
const User = require('../models/user');
const jwt=require('jsonwebtoken')
const fs =require('fs')

module.exports = {
    getalldonations: (async (req, res) => {
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else { 
                    const usertype=authorizedData.userdata.usertype
                    if(usertype=="user")
                    {
                        try {
                            const donations = await Donation.find({"verified":true}).sort({ "date": -1 });
                            if (donations.length >= 1) {
                                if (donations) {
                                    let total = 0;
                                    var nameArray=[];
                                    donations.forEach(async function(donation,index){
                                        try{
                                            console.log(donation.donator)
                                            const finduser = await User.findOne({ _id: donation.donator},'name')
                                            nameArray.push(finduser.name)
                                        }
                                        catch(err)
                                        {
                                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                                        }
                                        total = total + parseFloat(donation.amount)
                                        if(donations.length<=index+1)
                                        {
                                            res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, donations: donations, totaldonation: total, names:nameArray })
                                        }
                                    });
                                }
                                else {
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                }
                            }
                            else {
                                res.json({ message: "No valid donations registered yet.", code: response_codes.NO_DONATIONS });
                            }
                        }
                        catch (err) {
                            console.log(err)
                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                        }
                    }
                    else
                    {
                    res.json({ message: "Not enough credentials.", code: response_codes.NOT_ENOUGH_CREDENTIALS })

                    }
                }
            })
        }
        else {
            res.json({ message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM })
        }
        
    }),
    registerdonation: (async (req, res) => {
        const file=req.file
        if(!file)
        {
            res.json({ message: "file upload failed.", code: response_codes.FILE_UPLOAD_FAILED })
        }
        else
        {
            const voucherimage = req.file.filename
            const token = req.body.token

            if (token != undefined && token != "") {
                jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
                    if (err) {
                        const response = { message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN }
                        removeimage(voucherimage, response);
                    }
                    else {
                        const usertype = authorizedData.userdata.usertype
                        if (usertype == "user") {

                            let currentdate = new Date();
                            var date = currentdate;
                            const donator = authorizedData.userdata.id;
                            const amount = req.body.amount;
                            const testimonial=req.body.testimonial

                            if ((donator && amount && voucherimage && testimonial) != undefined &&
                                (donator && amount && voucherimage && testimonial) != "") {

                                const donation = new Donation({
                                    "donator": donator, "amount": amount,
                                     "testimonial":testimonial, "voucher":voucherimage
                                })
                                try {
                                    const registerdonation = await donation.save();
                                    if (registerdonation) {
                                        res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK })
                                    }
                                    else {
                                        const response = { message: "Response failed.", code: response_codes.RESPONSE_FAILED }
                                        removeimage(voucherimage, response);
                                    }
                                }
                                catch (err) {
                                    const response = { message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err }
                                    removeimage(voucherimage, response);
                                }
                            }
                            else {
                                const response = { message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM }
                                removeimage(voucherimage, response);
                            }
                        }
                        else {
                            const response = { message: "Not enough credentials.", code: response_codes.NOT_ENOUGH_CREDENTIALS }
                            removeimage(voucherimage, response);
                        }
                    }
                })
            }
            else {
                const response = { message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM }
                removeimage(voucherimage, response);
            }

            async function removeimage(image, response) {
                fs.unlink("./uploads/" + image, (err) => {
                    if (err) {
                        res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                    } else {
                        res.json(response);
                    }
                });
            }
        } 
    }),

    updatedonation: (async (req, res) => {
        const token = req.body.token

        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    if (usertype == "superadmin") {
                        try {
                            const verified = req.body.verified
                            const donation_id = req.body.donation_id
                            if ((verified && donation_id != undefined) && (donation_id != "") && verified) {
                                const data = {
                                    "verified": verified
                                }
                                const updateddonation = await Donation.findOneAndUpdate({ _id: donation_id }, data)
                                if (updateddonation) {
                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK })
                                }
                                else {
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED })
                                }
                            }
                            else {
                                res.json({ message: "Incomplete request parameters.", code: response_codes.INCOMPLETE_REQ_PARAM })
                            }
                        }
                        catch (err) {
                            res.json({ message: "response failed.", code: response_codes.RESPONSE_FAILED, error: err })
                        }
                    }
                    else {
                        res.json({ message: "Not enough credentials.", code: response_codes.NOT_ENOUGH_CREDENTIALS })
                    }
                }
            })
        }
        else {
            res.json({ message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM })
        }
    })

}
