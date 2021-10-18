const User = require('../models/user');
const Otp = require('../models/otp');
const Passwordreset=require('../models/passwordreset')
const bcrypt = require('bcryptjs');
const response_codes = require('../../language/responsecodes');
const jwt=require('jsonwebtoken')
var moment=require('moment')

module.exports = {
    register_user: (async (req, res) => {
        const email = req.body.email
        const name = req.body.name
        const phone = req.body.phone
        const password = req.body.password

        if ((email && phone && name && password != undefined) &&
            (email && phone && name && password != "")) {
            try {
                const checkEmail = await User.findOne({ email: email })
                console.log(checkEmail)
                if (checkEmail) {
                    res.json({ message: "Email already exists.", code: response_codes.EMAIL_ALREADY_EXISTS });
                }
                else {
                    const saltRounds = 10;
                    try {   
                        const hashedpassword = await bcrypt.hash(password, saltRounds); 
                        const user = new User({
                            "password": hashedpassword,
                            "email": email,
                            "name": name,
                            "phone": phone     
                        })
                        try {
                            const saveduser = await user.save();
                            if (saveduser) {
                                var date=Date.now()
                                var OTP=Math.random().toString(36).substr(2, 6);
                                const otp = new Otp({
                                    "created_at":date,
                                    "email": email,
                                    "otp": OTP
                                })
                                try {

                                    const saveotp = await otp.save();
                                    if (saveotp) {
                                        res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK,otp:OTP,email:email,phone:phone });
                                    }
                                    else {
                                        deleteuser(email)
                                    }
                                }
                                catch (err) {
                                    console.log(err)
                                    deleteuser(email)
                                }

                                async function deleteuser(email)
                                {
                                    try {
                                        const deleteuser = Otp.findOneAndDelete({"email":email})
                                        if (deleteuser) {
                                            res.json({ message: "Something went wrong, user not saved.", code: response_codes.RESPONSE_FAILED });
                                        }
                                        else {
                                            res.json({ message: "Something went wrong, user not deleted.", code: response_codes.RESPONSE_FAILED });
                                        }
                                    }
                                    catch (err) {
                                        res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                                    }  
                                }
                            }
                            else {
                                res.json({ message: "Something went wrong, user not saved.", code: response_codes.RESPONSE_FAILED });
                            }

                        }
                        catch (err) {
                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
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
            res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
        }
    }),
    otp_activate:(async(req,res)=>{
        const otp=req.body.otp;
        const email=req.body.email;
        if((otp&&email!=undefined) && (otp&&email!=""))
        {
            const foundotpregistered=await Otp.find({"email":email,"created_at": {
                "$gte": moment().startOf('day').format("YYYY-MM-DDTHH:mm:SS"),
                "$lt": moment().add(1,'days').startOf('day').format("YYYY-MM-DDTHH:mm:SS")
                }}).sort({created_at:-1}).limit(1)
                console.log(foundotpregistered[0])
            if(foundotpregistered.length<=0)
            {
                res.json({ message: "OTP not initatied for today.", code: response_codes.OTP_NOT_INITiATED })        
            }
            else
            {   
                const isactiveuser=await User.findOne({"email":email,"active":false})
                if(isactiveuser !=null)
                {
                    if(foundotpregistered[0].otp==otp)
                    {
                        const idtoupdate=isactiveuser._id
                        const updateuser=await User.findByIdAndUpdate(idtoupdate,{"active":true})
                        if(updateuser)
                        {
                                res.json({ message: "Response OK", code: response_codes.RESPONSE_OK })        
                        }
                        else
                        {
                            res.json({ message: "Response failed", code: response_codes.RESPONSE_FAILED })
                        }
                    }
                    else
                    {
                        res.json({ message: "Invalid or expired OTP", code: response_codes.INVALID_OTP })
                    }
                }
                else
                {
                res.json({ message: "Account is either already activated or not registered", code: response_codes.INVALID_MAIL_OTP })
                }
            }
        }
        else
        {
            res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
        }
    }),
    otp_resend:(async(req,res)=>{
        const email=req.body.email;
        if((email!=undefined) && (email!=""))
        {
            try{
                const finduser=await User.findOne({"email":email})
                console.log(finduser)
                if(finduser)
                {
                    try{
                        const activated=finduser.active
                        console.log(activated)
                        if(activated)
                        {
                            res.json({ message: "User already activated.", code: response_codes.ALREADY_ACTIVE })     
                        }
                        else
                        {
                            const oldotp=await Otp.findOne({"email":email})
                            if(!oldotp)
                            {
                                res.json({ message: "User not registered.", code: response_codes.USER_NOT_REGISTERED })     
                            }
                            else
                            {
                                const activeotps=await Otp.find({"email":email,"created_at": {
                                    "$gte": moment().startOf('day').format("YYYY-MM-DDTHH:mm:SS"),
                                    "$lt": moment().add(1,'days').startOf('day').format("YYYY-MM-DDTHH:mm:SS")
                                    }}).sort({created_at:-1}).limit(3)

                                if(activeotps.length>=3)
                                {
                                    res.json({ message: "Daily OTP daily limit reached.", code: response_codes.DAILY_OTP_LIMIT })     
                                }
                                else
                                {
                                    try{
                                        var date=Date.now()
                                        var OTP=Math.random().toString(36).substr(2, 6);
                                        const otp = new Otp({
                                        "created_at":date,
                                        "email": email,
                                        "otp": OTP
                                        })
                                        const saveotp = await otp.save();
                                        if(saveotp)
                                        {
                                            res.json({ message: "Response OK", code: response_codes.RESPONSE_OK,email:email,otp:OTP,phone:finduser.phone })        
                                        }
                                        else
                                        {
                                        res.json({ message: "Response failed", code: response_codes.RESPONSE_FAILED })
                                        }
                                    }
                                    catch(err)
                                    {
                                        res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err }); 
                                    }
                                }
                            }
                        }
                    }
                    catch(err)
                    {
                        res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err }); 
                    }
                    
                }
                else
                {
                    res.json({ message: "Response failed", code: response_codes.RESPONSE_FAILED })
                }
            }
            catch(err)
            {
                res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err }); 
            }  
        }
        else
        {
            res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
        }
    }),
    user_login: (async (req, res) => {
        const email = req.body.email
        const password = req.body.password
        if ((email && password != undefined) &&
            (email && password != "")) {
            try {
                const checkEmail = await User.findOne({ email: email })
                if(checkEmail.active)
                {
                    if (checkEmail) {
                        const userdata = {
                            id: checkEmail._id,
                            "usertype":"user"
                        }
                        try {
                            const compare = await bcrypt.compare(req.body.password, checkEmail.password)
                            if (compare) {
                                jwt.sign({ userdata }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' }, (err, token) => {
                                    if (err) { console.log(err) }
                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, token: token })
                                });
                            }
                            else {
                                res.json({ message: "Email and password mismatch Please Try again.", code: response_codes.EMAIL_PASSWORD_MISMATCH });
                            }
                        }
                        catch (err) {
                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                        }
    
                    }
                    else {
                        res.json({ message: "Email and password mismatch Please Try again.", code: response_codes.EMAIL_PASSWORD_MISMATCH });
                    }
                }
                else
                {
                    res.json({ message: "User not active.", code: response_codes.USER_NOT_ACTIVE });
                } 
            }
            catch (err) {
                res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });

            }
        }

        else {
            res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })

        }

    }),
    update_user: (async (req, res) => {
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    if (usertype == "user") {
                        const id = authorizedData.userdata.id
                        const name = req.body.name
                        const email = req.body.email
                        const phone = req.body.phone
                        const location = req.body.location
                        const blood_type = req.body.blood_type
                        const vaccine = req.body.vaccine
                        const was_corona_patient = req.body.was_corona_patient
                        const password = req.body.password
                        const plasma_donator = req.body.plasma_donator
                        const userstatus = req.body.user_status
                        const responsible_person = req.body.responsible_person
                        const province = req.body.province
                        const district = req.body.district
                        const municipality = req.body.municipality
                        const ward_no = req.body.ward_no
                        const tole = req.body.tole

                        if ((id && location && name && email && phone && blood_type && was_corona_patient) != undefined &&
                            (id && location && name && email && phone && blood_type) != "") {
                            const data = { "location": location, "name": name, "email": email, "phone": phone, "blood_type": blood_type, "was_corona_patient": was_corona_patient }
                            update(data)
                        }
                        else if ((id && password != undefined) && (id && password != "")) {
                            const saltRounds = 10;
                            const hashedpassword = await bcrypt.hash(password, saltRounds);
                            const data = { "password": hashedpassword }
                            update(data)
                        }
                        else if (vaccine != undefined && vaccine != "") {
                            const data = { "vaccine": vaccine }
                            update(data)
                        }
                        else if ((responsible_person && province && district && municipality && ward_no && tole != undefined) &&
                            (responsible_person && province && district && municipality && ward_no && tole != "")) {
                            const data = {
                                "responsible_person": responsible_person, "province": province,
                                "municipality": municipality, "ward_no": ward_no,
                                "tole": tole, "district": district
                            }
                            update(data)
                        }

                        else if (plasma_donator != undefined && plasma_donator != "") {
                            const userdata = await User.findOne({ _id: id })
                            if (userdata) {
                                const blood_type = userdata.blood_type;
                                const coronapatient = userdata.was_corona_patient;
                                if (!blood_type) {
                                    res.json({ message: "Register your blood type first.", code: response_codes.UNQUALIFIED_FOR_PLASMA_DONOR });
                                }
                                if (!coronapatient) {
                                    res.json({ message: "You cannot donate for plasma if you were not COVID-19 patient before.", code: response_codes.UNQUALIFIED_FOR_PLASMA_DONOR });
                                }
                                if (blood_type && coronapatient) {
                                    const data = { "plasma_donator": plasma_donator }
                                    update(data)
                                }
                            }
                            else {
                                res.json({ message: "Invalid user.", code: response_codes.INVALID_USER });
                            }

                        }
                        else if (userstatus != undefined ) {
                            const data = { "active": userstatus }
                            update(data)
                        }
                        else {
                            res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
                        }
                        async function update(data) {
                            try {
                                const updateduser = await User.findByIdAndUpdate(id, data)
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
    getuserbyid:(async (req,res)=>{
        const token=req.body.token
        if(token!=undefined && token!="")
        {
            jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: "Invalid token cannot access this route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const id = authorizedData.userdata.id
                    if (id != undefined && id != "") {
                        try {
                            const founduser = await User.findOne({ _id: id })
                            if (founduser) {
                                res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, user: founduser })
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
                        res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
                    }
                }
            })
        }
        else
        {
            res.json({ message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM })
        }
             
    }),
    getplasmadonatorlist: (async (req, res) => {
        
        jwt.verify(req.token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
            if (err) {
                res.json({ message: " Could not connect to the protected route", code: response_codes.INVALID_TOKEN })
            }
            else {
                try {
                    const plasmadonors = await User.find({ "plasma_donator": true, "blood_dontation_status": true })
                    if (plasmadonors.length >= 1) {
                        res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, plasmadonors: plasmadonors })
                    }
                    else {
                        res.json({ message: "No plasma donors available.", code: response_codes.NO_PLASMA_DONORS });
                    }
                }
                catch (err) {
                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                }
            }
        })
        
    }),
    registerpasswordreset: (async (req, res) => {
        jwt.verify(req.token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
            if (err) {
                res.json({ message: " Could not connect to the protected route", code: response_codes.INVALID_TOKEN })
            }
            else {
                var now = new Date();
                var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const id = authorizedData.userdata.id
                if (id != undefined && id != "") {
                    try {
                        const founduser = await User.findOne({ _id: id })
                        const foundresetrequest = await Passwordreset.find({ user_id: id, created_at: { $gte: startOfToday } })
                        console.log(foundresetrequest)
                        if (founduser) {
                            if (foundresetrequest.length <= 2)
                            {
                            function randomString() {
                                const length=8;
                                const chars ="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
                                var result = '';
                                for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
                                return result;
                            }
                            
                            const passwordreset= new Passwordreset({
                                "user_id":id,
                                "reset_token": randomString(),

                            })
                            try{
                                const registerresetpassword=await passwordreset.save();
                                if(registerresetpassword)
                                {
                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK })
                                }
                            }
                            catch(err){
                                res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                            }
                        }
                        else
                        {
                                res.json({ message: "Daily reset password request limit reached.", code: response_codes.RESET_PASSWORD_LIMIT });
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
                    res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
                }
            }
        })


    }),
    resetpassword: (async (req, res) => {
        jwt.verify(req.token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
            if (err) {
                res.json({ message: " Could not connect to the protected route", code: response_codes.INVALID_TOKEN })
            }
            else {
                const resettoken=req.body.passwordresettoken
                const password=req.body.password
                var now = new Date();
                var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const id = authorizedData.userdata.id
                if ((id && resettoken && password) != undefined && (id && resettoken && password) != "") {
                    try {
                        const founduser = await User.findOne({ _id: id })
                        const foundresetrequest = await Passwordreset.find({ user_id: id, created_at: { $gte: startOfToday } }).sort({ created_at:-1})
                        console.log(foundresetrequest)
                        if (founduser) {
                            if(foundresetrequest.length<=0)
                            {
                                res.json({ message: "Password reset not initiated.", code: response_codes.NO_PASSWORD_REQUEST })
                            }
                            else
                            {
                                if (foundresetrequest[0].status==true)
                                {
                                    res.json({ message: "Password reset token already used reinitate reset.", code: response_codes.RESET_TOKEN_ALREADY_USED })
                                }
                                else
                                {
                                const resetid = foundresetrequest[0]._id
                                const storedresettoken=foundresetrequest[0].reset_token
                                console.log(resetid)
                                if (resettoken == storedresettoken) {
                                    try {
                                        const saltRounds = 10;
                                        const hashedpassword = await bcrypt.hash(password, saltRounds);
                                        const updatepassword = await User.findOneAndUpdate({ _id: id }, {"password": hashedpassword})
                                        const updateresetpassword = await Passwordreset.findOneAndUpdate({ _id: resetid }, { "status": true })
                                        if (updatepassword && updateresetpassword)
                                        {
                                            res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
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
                                else
                                {
                                    res.json({ message: "Invalid password reset token.", code: response_codes.INVALID_RESET_TOKEN })
                                }
                                }
                                
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
                    res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
                }
            }
        })


    }),

}
