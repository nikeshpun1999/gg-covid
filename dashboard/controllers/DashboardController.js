const User = require('../../api/models/user');
const Panic = require('../../api/models/panic');
const jwt = require('jsonwebtoken')
const response_codes = require('../../language/responsecodes');
const Donation = require('../../api/models/donation');

module.exports = {
    getdashboard_data: (async (req, res) => {

        const token = req.body.token
        if(token!=undefined && token!="")
        {
            jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: " Could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    if (usertype != undefined && usertype == "superadmin") {
                        try {
                            const latest_user = await User.find().sort({ _id: -1 }).limit(5)
                            const panics = await Panic.find({ status: { $in: ['pending', 'inprogress'] } })

                            if (latest_user && panics) {
                                const totalpanic = panics.length
                                const users = await User.aggregate([
                                    {
                                        $project: {
                                            healthy: { $cond: [{ $eq: ["$current_health", 0] }, 1, 0] },
                                            unhealthy: { $cond: [{ $eq: ["$current_health", 1] }, 1, 0] },
                                            covid_prediction: { $cond: [{ $eq: ["$current_health", 2] }, 1, 0] }
                                        }
                                    },
                                    {
                                        $group: {
                                            _id: null,
                                            healthy: { $sum: "$healthy" },
                                            unhealthy: { $sum: "$unhealthy" },
                                            covid_prediction: { $sum: "$covid_prediction" },
                                            total: { $sum: 1 },
                                        }
                                    },
                                ])
                                if (users) {
                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, latestusers: latest_user, users: users, totalpanic: totalpanic });
                                }
                                else {
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                }
                            }
                            else {
                                res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                            }
                        }
                        catch (err) {

                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                        }
                    }
                    else {
                        res.json({ message: " Could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                    }
                }
            })
        }
        else
        {
            res.json({ message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM })
        }

    }),
    getusers_data: (async (req, res) => {
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: " Could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    if (usertype != undefined && usertype == "superadmin") {
                        try {

                            const latest_user = await User.find().sort({ _id: -1 })
                            const vaccinated = await User.find({ is_vaccinated: true })

                            if (latest_user && vaccinated) {
                                const totalvaccinated = vaccinated.length
                                const users = await User.aggregate([
                                    {
                                        $project: {
                                            healthy: { $cond: [{ $eq: ["$current_health", 0] }, 1, 0] },
                                            unhealthy: { $cond: [{ $eq: ["$current_health", 1] }, 1, 0] },
                                            covid_prediction: { $cond: [{ $eq: ["$current_health", 2] }, 1, 0] }
                                        }
                                    },
                                    {
                                        $group: {
                                            _id: null,
                                            healthy: { $sum: "$healthy" },
                                            unhealthy: { $sum: "$unhealthy" },
                                            covid_prediction: { $sum: "$covid_prediction" },
                                            total: { $sum: 1 },
                                        }
                                    },
                                ])
                                if (users) {
                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, latestusers: latest_user, users: users, totalvaccinated: totalvaccinated });
                                }
                                else {
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                }
                            }
                            else {
                                res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                            }
                        }
                        catch (err) {
                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
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

        
       
    }),
    getpanics_data: (async (req, res) => {
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: " Could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    if (usertype != undefined && usertype == "superadmin") {
                        try {
                            const allpanics = await Panic.find()
                            if (allpanics) {
                                const panicusers = await Panic.aggregate([
                                    {
                                        $project: {
                                            pending: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                                            inprogress: { $cond: [{ $eq: ["$status", "inprogress"] }, 1, 0] },
                                            helped: { $cond: [{ $eq: ["$status", "helped"] }, 1, 0] }
                                        }
                                    },
                                    {
                                        $group: {
                                            _id: null,
                                            pending: { $sum: "$pending" },
                                            inprogress: { $sum: "$inprogress" },
                                            helped: { $sum: "$helped" },
                                            total: { $sum: 1 },
                                        }
                                    },
                                ])
                                if (panicusers) {
                                    const totalvaccinated = allpanics.length
                                    if (totalvaccinated >= 1) {
                                        res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, allpanics: allpanics, panic_data: panicusers });
                                    }
                                    else {
                                        res.json({ message: "No panic registered yet.", code: response_codes.NO_PANIC, panic_data: panicusers });
                                    }
                                }
                                else {
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                }
                            }
                            else {
                                res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                            }
                        }
                        catch (err) {
                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
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
    }),
    getblood_data: (async (req, res) => {
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: " Could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    if (usertype != undefined && usertype == "superadmin") {
                        try {
                            const allusers = await User.find({ blood_type: { $in: ['AB+', 'A+', 'B+', 'O+', 'AB-', 'A-', 'B-', 'O-', 'AB+-', 'A+-', 'B+-', 'O+-'] } })
                            if (allusers) {
                                const usersbloodtype = await User.aggregate([
                                    {
                                        $project: {
                                            ABpos: { $cond: [{ $eq: ["$blood_type", "AB+"] }, 1, 0] },
                                            Apos: { $cond: [{ $eq: ["$blood_type", "A+"] }, 1, 0] },
                                            Bpos: { $cond: [{ $eq: ["$blood_type", "B+"] }, 1, 0] },
                                            Opos: { $cond: [{ $eq: ["$blood_type", "O+"] }, 1, 0] },
                                            ABneg: { $cond: [{ $eq: ["$blood_type", "AB-"] }, 1, 0] },
                                            Aneg: { $cond: [{ $eq: ["$blood_type", "A-"] }, 1, 0] },
                                            Bneg: { $cond: [{ $eq: ["$blood_type", "B-"] }, 1, 0] },
                                            Oneg: { $cond: [{ $eq: ["$blood_type", "O-"] }, 1, 0] },
                                            unverified: { $cond: [{ $eq: ["$blood_type", "unverified"] }, 1, 0] }
                                        }
                                    },
                                    {
                                        $group: {
                                            _id: null,

                                            ABpos: { $sum: "$ABpos" },
                                            Apos: { $sum: "$Apos" },
                                            Bpos: { $sum: "$Bpos" },
                                            Opos: { $sum: "$Opos" },
                                            ABneg: { $sum: "$ABneg" },
                                            Aneg: { $sum: "$Aneg" },
                                            Bneg: { $sum: "$Bneg" },
                                            Oneg: { $sum: "$Oneg" },
                                            unverified: { $sum: "$unverified" },
                                        }
                                    },
                                ])
                                if (usersbloodtype) {
                                    const usercount = allusers.length
                                    if (usercount >= 1) {
                                        res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, allusers: allusers, userblood_data: usersbloodtype, totalverfiedusers: allusers.length });
                                    }
                                    else {
                                        res.json({ message: "No user registered yet.", code: response_codes.NO_USER, userblood_data: usersbloodtype });
                                    }
                                }
                                else {
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                }
                            }
                            else {
                                res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                            }
                        }
                        catch (err) {
                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
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

        
    }),
    update_user: (async (req, res) => {
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: " Could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    const user_id=req.body.user_id
                    
                    if (((usertype && user_id ) != undefined) && ((usertype && user_id) != "") && usertype == "superadmin") {
                        try {
                            const vaccine=req.body.vaccine
                            if((vaccine !=undefined) && (vaccine!=""))
                            {
                                data={"vaccine":vaccine}
                                update(data)
                            }
                            else
                            {
                                res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
                            }
                            async function update(data) {
                                try {
                                    const updateduser = await User.findByIdAndUpdate(user_id, data)
                                    if (updateduser) {
                                        res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, user: updateduser })
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
                        catch (err) {
                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
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

        
    }),
    approvedonation: (async (req, res) => {
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: " Could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    if (((usertype ) != undefined) && usertype == "superadmin") {
                        try {
                            const donation_id=req.body.donation_id
                            if((donation_id !=undefined) && (donation_id!=""))
                            {
                                try {
                                const verifydonation = await Donation.findByIdAndUpdate(donation_id, {"verified":true})
                                if (verifydonation) {
                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK1 })
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
                                res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
                            }
                            async function update(data) {
                                try {
                                    const updateduser = await User.findByIdAndUpdate(user_id, data)
                                    if (updateduser) {
                                        res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, user: updateduser })
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
                        catch (err) {
                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
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

        
    }),
    
}

