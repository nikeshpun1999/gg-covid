
const response_codes = require('../../language/responsecodes');
const Helpline = require('../models/helpline');
const DashUser = require('../../dashboard/models/dashuser');
const User = require('../models/user');
const fs = require('fs');

const jwt = require('jsonwebtoken')

module.exports = {
    getallhelplineapp: (async (req, res) => {
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else { 
                    try {
                        const helplines = await Helpline.find({ "active": true, "verified": true }).select('organization_name_eng organization_name_nep help_type contact location logo');
                        if (helplines.length >= 1) {
                            if (helplines) {
                                res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, helplines: helplines })
                            }
                            else {
                                res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                            }
                        }
                        else {
                            res.json({ message: "No helplines registered yet.", code: response_codes.NO_HELPLINE });
                        }
                    }
                    catch (err) {
                        res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                    }
                }
            })
        }
        else {
            res.json({ message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM })
        }
        
    }),
    getallhelpline:(async(req,res)=>{
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: " Could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else { 
                    try {
                        const helplines = await Helpline.find();
                        if (helplines.length >= 1) {
                            if (helplines) {
                                res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, helplines: helplines })
                            }
                            else {
                                res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                            }
                        }
                        else {
                            res.json({ message: "No helplines registered yet.", code: response_codes.NO_HELPLINE });
                        }
                    }
                    catch (err) {
                        res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                    }
                }
            })
        }
        else {
            res.json({ message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM })
        }
        
    }),
    registerhelpline: (async (req, res) => {
        const token = req.body.token
        const registerfrom=req.body.registerfrom
        const file = req.file
        if (!file) {
            res.json({ message: "file upload failed.",code:response_codes.FILE_UPLOAD_FAILED })
        }
        else {
            const helplinelogo = req.file.filename
            if ((token && registerfrom != undefined) && (token && registerfrom != "")) {
                if (registerfrom == "app") {
                    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
                        if (err) {
                            console.log(err)
                            const response = { message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN }
                            removeimage(helplinelogo, response);
                        }
                        else {
                            user_id = authorizedData.userdata.id
                            regiserhelpline(user_id);
                        }
                    })
                }
                else if (registerfrom == "dashboard") {
                    jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                        if (err) {
                            console.log(err)
                            const response = { message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN }
                            removeimage(helplinelogo, response);
                        }
                        else {
                            user_id = authorizedData.userdata.id
                            regiserhelpline(user_id);
                        }
                    })
                }
                else {
                    res.json({ message: "Invalid register method.", code: response_codes.INVALID_REGISTER_METHOD })
                }
                async function regiserhelpline(user_id) {
                    const userid = user_id
                    const organization_name_nep = req.body.organization_name_nep
                    const organization_name_eng = req.body.organization_name_eng
                    const help_type = req.body.help_type
                    const contact = req.body.contact
                    const location = req.body.location

                    if ((organization_name_eng && organization_name_nep && help_type && contact && location && helplinelogo && userid) != undefined &&
                        (organization_name_eng && organization_name_nep && help_type && contact && location && helplinelogo && userid) != "") {
                        try {
                            var checkuserverify;
                            if(registerfrom == "app")
                            {
                                checkuserverify = await User.findOne({ _id: userid })
                            }
                            else
                            {
                                checkuserverify = await DashUser.findOne({ _id: userid })
                            }
                            if (checkuserverify) {
                                const findhelpline=await Helpline.find()
                                if(findhelpline)
                                {
                                    var position
                                    if (findhelpline.length <= 0) {
                                        position = 1
                                    }
                                    else {
                                        position = parseFloat(findhelpline.length) + 1
                                    }

                                    const helpline = new Helpline({
                                        "organization_name_nep": organization_name_nep, "organization_name_eng": organization_name_eng, "help_type": help_type,
                                        "contact": contact, "location": location, "user_id": userid, "logo": helplinelogo, "position":position
                                    })
                                    try {
                                        const registerhelpline = await helpline.save();
                                        console.log(registerhelpline)
                                        if (registerhelpline) {
                                            res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK })
                                        }
                                        else {
                                            const response = { message: "Response failed.", code: response_codes.RESPONSE_FAILED }
                                            removeimage(helplinelogo, response);
                                        }
                                    }
                                    catch (err) {
                                        console.log(err)
                                        const response = { message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err }
                                        removeimage(helplinelogo, response);
                                    }
                                 }  
                                 else
                                 {
                                    const response = { message: "Response failed.", code: response_codes.RESPONSE_FAILED }
                                    removeimage(helplinelogo, response);
                                 } 
                                
                            }
                            else {
                                const response = { message: "Invalid user.", code: response_codes.INVALID_USER }
                                removeimage(helplinelogo, response);
                            }
                        }
                        catch (err) {
                            console.log(err)
                            const response = { message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err }
                            removeimage(helplinelogo, response);
                        }

                    }
                    else {
                        const response = { message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM }
                        removeimage(helplinelogo, response);
                    }
                }
                
            }
            else {
                const response={ message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM }
                removeimage(helplinelogo,response);
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
    updatehelpline:(async(req,res)=>{
        const id=req.body.helpline_id
        const verifystatus=req.body.verify_status;
        const organization_name_eng = req.body.organization_name_eng
        const organization_name_nep = req.body.organization_name_nep
        const help_type = req.body.help_type
        const contact = req.body.contact
        const location = req.body.location
        const status = req.body.status
        const position = req.body.position
        if(id !=undefined && id!="")
        {
            if ((organization_name_nep && organization_name_eng && help_type && contact && location) != undefined &&
                (organization_name_nep && organization_name_eng && help_type && contact && location) != "") {
                const data = {
                    "organization_name_nep": organization_name_nep, "organization_name_eng": organization_name_eng,
                    "help_type": help_type, "contact": contact, "location": location
                }
                update(data)
            }
            else if ((verifystatus) != undefined && ( verifystatus) != "") {
                const data = { "verified": verify_status }
                update(data)
            }
            else if (( status) != undefined && ( status) != "") {
                const data = { "active": status }
                update(data)
            }
            else if ((position) != undefined && (position) != "") {
                const gethelplines=await Helpline.find()
                if(gethelplines.length<position)
                {
                    res.json({ message: "Position cannot be larger than the number of total helplines.", code: response_codes.INVALID_POSITION })
                }
                else
                {
                    try
                    {
                        const findhelpline = await Helpline.findOne({ _id: id })
                        if (findhelpline) {
                            const storedposition = findhelpline.position
                            if (storedposition>position)
                            {
                                const iteration = parseFloat(storedposition)-parseFloat(position)
                                const flow="up"
                                updateposition(iteration, flow, storedposition, position)
                            }
                            else if (storedposition<position)
                            {
                                const iteration = parseFloat(position)- parseFloat(storedposition)
                                const flow="down"
                                updateposition(iteration, flow, storedposition, position)
                            }
                            else
                            {
                                res.json({ message: "Same position nothing updated.", code: response_codes.INVALID_POSITION })
                            }
                         }
                        else { 
                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                        }
                        async function updateposition(iteration, flow, storedposition, position)
                        {
                            if(flow=="up")
                            {
                                var at = parseFloat(storedposition)-1
                                for (i = 0; i < iteration; i++) {
                                    
                                    var moveto=parseFloat(at)+1
                                    console.log(at)
                                    console.log(moveto)
                                    const updatingposition = await Helpline.findOneAndUpdate({ "position": at }, { "position": moveto})
                                    at--;
                                    if (i == iteration - 1) {
                                        const lastupdatingposition = await Helpline.findOneAndUpdate({ "position": storedposition,"_id":id }, { "position": position })
                                        res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
                                    }
                                    
                                }
                            }
                            else {
                                var at = parseFloat(storedposition) + 1
                                for (i = 0; i < iteration; i++) {

                                    var moveto = parseFloat(at) - 1
                                    console.log(at)
                                    console.log(moveto)
                                    const updatingposition = await Helpline.findOneAndUpdate({ "position": at }, { "position": moveto })
                                    at++;
                                    if (i == iteration - 1) {
                                        const lastupdatingposition = await Helpline.findOneAndUpdate({ "position": storedposition, "_id": id }, { "position": position })
                                        res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
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
            }
            else {
                res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
            }
            async function update(data) {

                try {
                    const updatehelpline = await Helpline.findByIdAndUpdate(id, data)
                    if (updatehelpline) {
                        res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK })
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
        else
        {
            res.json({ message: "Incomplete request parameters, no helpline id.", code: response_codes.INCOMPLETE_REQ_PARAM })

            res.json({ message: "No such helpline registered.", code: response_codes.INVALID_HELPLINE_ID });
        }
        
    }),
    deletehelpline:(async(req,res)=>{
        const id=req.body.helpline_id;
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: " Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else { 
                    if (id != undefined && id != "") {

                        try {
                            const findimage = await Helpline.findOne({"_id":id})
                            if(findimage)
                            {
                                const image=findimage.logo
                                const deletehelpline = await Helpline.findByIdAndDelete(id)

                                if (deletehelpline) {
                                    fs.unlink("./uploads/" + image, (err) => {
                                        if (err) {
                                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                        } else {
                                            res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
                                        }
                                    });
                                }
                                else {
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });

                                }
                            }
                            else
                            {
                                res.json({ message: "No such helpline registered.", code: response_codes.INVALID_HELPLINE_ID });
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
        else {
            res.json({ message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM })
        }
        
    })

}
