
const response_codes = require('../../language/responsecodes');
const Panic = require('../models/panic');
const User = require('../models/user');

module.exports = {
    getallpanic: (async (req, res) => {
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
                            const panics = await Panic.find().sort({ "created_at": -1 });
                            if (panics) {
                                if (panics.length >= 1) {
                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, panics: panics })

                                }
                                else {
                                    res.json({ message: "No panic request registered yet.", code: response_codes.NO_PANIC });
                                }
                            }
                            else {
                                res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                            }
                        }
                        catch (err) {
                            console.log(err)
                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
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

        
    }),
    checkpanic: (async (req, res) => {
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {

                    const user_id = authorizedData.userdata.id

                    if ((user_id) != undefined &&
                        (user_id) != "") {
                        try {
                            const finduser = await User.findOne({ "_id": user_id })
                            if (finduser) {
                                
                                if (finduser.responsible_person != undefined && finduser.responsible_person != "") {
                                    res.json({ message: "Panic registered.", code: response_codes.PANIC_REGISTERED })
                                }
                                else {
                                    res.json({ message: "Panic not registered.", code: response_codes.PANIC_NOT_REGISTERED })
                                }

                            }
                            else {
                                res.json({ message: "No such user exists.", code: response_codes.INVALID_USER });
                            }
                        }
                        catch (err) {
                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                        }

                    }
                    else {
                        res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
                    }
                }
            })
        }
        else {
            res.json({ message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM })
        }

        }),

        registerpanic: (async (req, res) => {

            const token = req.body.token
            if (token != undefined && token != "") {
                jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
                    if (err) {
                        res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                    }
                    else {
                        const user_id = authorizedData.userdata.id

                        if ((user_id) != undefined &&
                            (user_id) != "") {
                            try {
                                const finduser = await User.findOne({ "_id": user_id })
                                if (finduser) {
                                    const panic = new Panic({
                                        "user_id": user_id
                                    })
                                    try {
                                        const findpanic = await Panic.findOne({ "_id": user_id})
                                        if(findpanic)
                                        {
                                            if (findpanic.length <= 0)
                                            {
                                                const registerpanic = await panic.save();
                                                if (registerpanic) {
                                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK })
                                                }
                                                else {
                                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                                }
                                            }
                                            else
                                            {
                                                
                                            }
                                        }
                                        else
                                        {
                                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                        }                
                                    }
                                    catch (err) {
                                        res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                                    }
                                }
                                else {
                                    res.json({ message: "No such user exists.", code: response_codes.INVALID_USER });
                                }
                            }
                            catch (err) {
                                res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                            }

                        }
                        else {
                            res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
                        }
                    }
                })
            }
            else {
                res.json({ message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM })
            }

        
    }),
    updatepanic: (async (req, res) => {
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    if ((usertype && status != undefined) && (usertype && status != "")) {
                        if(usertype=="superadmin")
                        {
                            const user_id = req.body.user_id;
                            const status = req.body.status;
                            const date = new Date();

                            try {
                                const updatepanic = await Panic.findOneAndUpdate({ "user_id": user_id }, { "status": status });
                                if (updatepanic) {
                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
                                }
                                else {
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                }

                            }
                            catch (err) {
                                res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                            }
                
                        }
                        else
                        {
                            res.json({ message: "Not enough credentials.", code: response_codes.NOT_ENOUGH_CREDENTIALS })
                        }
                        
                    }
                    else {
                        res.json({ message: " Could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                    }
                }
            })
        }
        else {
            res.json({ message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM })
        }

        
    })

}
