
const response_codes = require('../../language/responsecodes');
const Usage = require('../models/usage');
const Donation = require('../models/donation');

module.exports = {
    getusagehistory: (async (req, res) => {
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
                            const usages = await Usage.find().sort({ "date": -1 });
                            if (usages.length >= 1) {
                                if (usages) {
                                    let total = 0;
                                    usages.forEach(usage => {
                                        total = total + parseFloat(usage.amount)
                                    });

                                    try {
                                        const donations = await Donation.find();

                                        let totaldonation = 0;
                                        donations.forEach(donation => {
                                            totaldonation = totaldonation + parseFloat(donation.amount)
                                        });
                                        let remaining = parseFloat(totaldonation - total)

                                        res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, usages: usages, totalusage: total, remainingdonations: remaining })
                                    }
                                    catch (err) {
                                        res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                                    }

                                }
                                else {
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                }
                            }
                            else {
                                res.json({ message: "No usage registered yet.", code: response_codes.NO_USAGE });
                            }
                        }
                        catch (err) {
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
    registerusage: (async (req, res) => {

        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    if (usertype == "superadmin") {
                        let currentdate = new Date();
                        const date = currentdate;
                        const task_title = req.body.task_title;
                        const amount = req.body.amount;
                        const description = req.body.description;

                        if ((task_title && amount && date && description) != undefined &&
                            (task_title && amount && date && description) != "") {

                            const usage = new Usage({
                                "task_title": task_title, "amount": amount,
                                "date": date, "description": description
                            })

                            try {
                                const donations = await Donation.find()

                                if (donations.length >= 1) {
                                    if (donations) {
                                        let totaldonation = 0;
                                        donations.forEach(donation => {
                                            totaldonation = totaldonation + parseFloat(donation.amount)
                                        });

                                        try {
                                            const usages = await Usage.find()

                                            if (usages.length >= 1) {
                                                if (usages) {
                                                    let totalusage = 0;
                                                    usages.forEach(usage => {
                                                        totalusage = totalusage + parseFloat(usage.amount)
                                                    });
                                                    if ((parseFloat(totalusage) + parseFloat(amount)) > parseFloat(totaldonation)) {
                                                        res.json({ message: "Insufficient to fund for the task get more donations first.", code: response_codes.INSUFFICIENT_FUND });
                                                    }
                                                    else {
                                                        register(usage);
                                                    }
                                                }
                                                else {
                                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                                }
                                            }
                                            else {
                                                if (amount <= totaldonation) {
                                                    register(usage);
                                                }
                                                else {
                                                    res.json({ message: "Insufficient to fund for the task get more donations first.", code: response_codes.INSUFFICIENT_FUND });
                                                }
                                            }
                                        }
                                        catch (err) {
                                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                                        }

                                    }
                                    else {
                                        res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                    }
                                }
                                else {
                                    res.json({ message: "Insufficient to fund for the task get more donations first.", code: response_codes.INSUFFICIENT_FUND });
                                }
                            }
                            catch (err) {
                                res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                            }
                        }
                        else {
                            res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
                        }


                        async function register(data) {
                            try {
                                const registerusage = data.save();
                                if (registerusage) {
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
