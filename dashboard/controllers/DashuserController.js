const User = require('../models/dashuser');
const bcrypt = require('bcrypt');
const response_codes = require('../../language/responsecodes');
const jwt=require('jsonwebtoken')

module.exports = {
    registeruser:(async(req,res)=>{
        const name=req.body.name
        const email=req.body.email
        const password=req.body.password
        const usertype=req.body.usertype
        if ((name && email && password && usertype != "") 
        && (name && email && password && usertype != undefined))
        {
            try{
                const checkEmail = await User.findOne({ email: email })
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
                            "usertype": usertype
                        })
                        try {
                            const saveduser = await user.save();
                            if (saveduser) {
                                res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
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
                if (checkEmail) {
                    const userdata={
                        usertype: checkEmail.usertype,
                        id:checkEmail._id
                    }
                    try {
                        const compare = await bcrypt.compare(req.body.password, checkEmail.password)
                        if (compare) {
                            jwt.sign({ userdata }, process.env.JWT_SECRET_DASH_KEY, { expiresIn: '1h' }, (err, token) => {
                                if (err) { console.log(err) }
                                res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK,token:token })
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
        if(token!=undefined && token!="")
        {
        jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
            if (err) {
                res.json({ message: "Invalid token cannot access this route.", code: response_codes.INVALID_TOKEN })
            }
            else {

                const id = authorizedData.userdata.id
                const name = req.body.name
                const email = req.body.email
                const password = req.body.password
                const usertype = req.body.usertype
                const status = req.body.status

                if ((id && name && email && usertype) != undefined &&
                    (id && name && email && usertype) != "") {
                    const data = { "name": name, "email": email, "usertype": usertype }
                    update(data)
                }
                else if ((status) != undefined &&
                    (status) != "") {
                    const data = { "status": status }
                    update(data)
                }
                else if ((id && password != undefined) && (id && password != "")) {
                    const saltRounds = 10;
                    const hashedpassword = await bcrypt.hash(password, saltRounds);
                    const data = { "password": hashedpassword }
                    update(data)
                }
                else {
                    res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
                }
                async function update(data) {
                    try {
                        const updateduser = await User.findByIdAndUpdate(id, data)
                        console.log(updateduser)
                        console.log(data)
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
        })
    }
    else
    {
            res.json({ message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM })
    }
       

        

    }),
    decode:(async(req,res)=>{

        jwt.verify(req.token, 'privatekey', (err, authorizedData) => {
            if (err) {
                //If error send Forbidden (403)
                console.log('ERROR: Could not connect to the protected route');
                res.sendStatus(403);
            } else {
                //If token is successfully verified, we can send the autorized data 
                res.json({
                    message: 'Successful log in',
                    authorizedData
                });
            }
        })
    }),
    //Testing SMS verfication for the mobile. 
    // twilio: (async (req, res) => {

    //     var accountSid = 'AC5ae3fe64f2166190a025691e63d50c25'; // Your Account SID from www.twilio.com/console
    //     var authToken = '72568cace75aec3e238e03e0482d9171';   // Your Auth Token from www.twilio.com/console

    //     var twilio = require('twilio');
    //     var client = new twilio(accountSid, authToken);
    //     console.log("here i am")
    //     client.messages.create({
    //         body: 'Hello from Node',
    //         to: '+9779845799254',  // Text this number
    //         from: '+9779845023020' // From a valid Twilio number
    //     })
    //         .then((message) => console.log(message.sid));
    // })
    testing_body_token: (async (req, res) => {
        const token=req.body.token
        
        jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
            if (err) {
                res.json({ message: " Could not connect to the protected route", code: response_codes.INVALID_TOKEN })
            }
            else
            {
                res.json({message:"ok",code:response_codes.RESPONSE_OK})
            }
        })
    })
}