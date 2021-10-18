const response_codes = require('../../language/responsecodes');
const Photovideo = require('../models/photovideo');

const fs = require('fs')
const jwt = require('jsonwebtoken');

module.exports = {
    deletephotovideo:(async( req,res)=>{
        const token = req.body.token
        const photovideo_id=req.body.photovideo_id
        if ((token && photovideo_id != undefined) && (token && photovideo_id != "")) {
            jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    if (usertype == "superadmin") {
                        const foundphotovideo = await Photovideo.findOne({ _id: photovideo_id })
                        if (foundphotovideo) {
                            var image_array = [];
                            if(foundphotovideo.photovideo.length>=1)
                            {
                                const images=foundphotovideo.photovideo
                                for(i=0;i<images.length;i++)
                                {
                                    image_array.push(images[i])
                                }
                            }
                            if(image_array.length<=0)
                            {
                                const deletedphotovideo = await Photovideo.findByIdAndDelete({ _id: photovideo_id })

                                if (deletedphotovideo) {
                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
                                }
                                else {
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                }
                            }
                            else
                            {
                                image_array.every(async function (img, index) {

                                    fs.unlink("./uploads/" + img, async function (err) {

                                        if (err) {
                                            if (index >= image_array.length - 1) {
                                                console.log(err)
                                                res.json({ message: "Cannot unlink or find file to delete.", code: response_codes.RESPONSE_FAILED });
                                            }
                                        }
                                        else {
                                            if (index >= image_array.length - 1) {
                                                const deletedphotovideo = await Photovideo.findByIdAndDelete({ _id: photovideo_id })

                                                if (deletedphotovideo) {
                                                    const findsamecategory = await Photovideo.find({ "category": foundphotovideo.category})
                                                    if(findsamecategory.length>=1)
                                                    {
                                                        var tochangearray =[]
                                                        findsamecategory.forEach((element,index) => {
                                                            if (parseFloat(foundphotovideo.position) < parseFloat(element.position))
                                                            {
                                                                tochangearray.push(element)
                                                            }
                                                        });
                                                        if(tochangearray.length>=1)
                                                        {
                                                            tochangearray.forEach(async function (element, index){
                                                                id = element._id
                                                                changedposition = parseFloat(element.position) - 1
                                                                const changeposition = await Photovideo.findOneAndUpdate({ _id: id }, { "position": changedposition })
                                                                if (tochangearray.length <= index) {
                                                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
                                                                }
                                                            });
                                                        }
                                                        else
                                                        {
                                                            res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
                                                        }
                                                        
                                                    }
                                                    else
                                                    {
                                                        res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
                                                    }
                                                }
                                                else {
                                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                                }
                                            }
                                        }
                                    })

                                })
                            }
         
                        }
                        else {
                            res.json({ message: "Invalid Photovideo ID.", code: response_codes.INVALID_PHOTO_VIDEO })
                        }
                    }
                    else {
                        res.json({ message: "Not enough credentials.", code: response_codes.NOT_ENOUGH_CREDENTIALS })

                    }
                }
            })
        }
        else {
            res.json({ message: "Incomplete request parameters.", code: response_codes.INCOMPLETE_REQ_PARAM })
        }
    }),
    registerphotovideo: (async (req, res) => {
        const fileuploaded = req.files;
        var photovideoArray = []
        if (!fileuploaded) {

            res.json({ message: "File upload failed.", code: response_codes.RESPONSE_FAILED });
        }
        else {
            const token = req.body.token
            if(req.files.length<=0)
            {
                res.json({ message: "Incomplete request parameters.", code: response_codes.INCOMPLETE_REQ_PARAM })
            }
            else
            {
                const files=req.files
                for (i = 0; i < files.length; i++) {
                    photovideoArray.push(files[i].filename)
                };

                if (token != undefined && token != "") {
                    jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                        if (err) {
                            const resss = { message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN }
                            removeimage(resss)
                        }
                        else {
                            const usertype = authorizedData.userdata.usertype
                            if (usertype == "superadmin") {
                                const category=req.body.category
                                const heading_nep = req.body.heading_nep
                                const heading_eng = req.body.heading_eng
                                const caption_nep = req.body.caption_nep
                                const caption_eng = req.body.caption_eng
                                const photovideo_id = req.body.photovideo_id

                                if ((category && heading_eng && heading_nep && caption_eng && caption_nep != undefined) &&
                                    (category && heading_eng && heading_nep && caption_eng && caption_nep != "")) {
                                    if (photovideo_id != undefined && photovideo_id != "") {
                                        var prephotovideoArray = [];
                                        try {
                                            const foundphotovideo = await Photovideo.findOne({ _id: photovideo_id })
                                            if (foundphotovideo) {
                                                const data = {
                                                    "category": category, "heading_eng": heading_eng, "heading_nep": heading_nep,
                                                    "caption_eng": caption_eng, "caption_nep": caption_nep, "photovideo": photovideoArray
                                                }
                                                if (foundphotovideo.photovideo.length <= 0) {
                                                    updatephotovideo(data)
                                                }
                                                else {
                                                    const foundphovideos = foundphotovideo.photovideo
                                                    for (j = 0; j < foundphovideos.length; j++) {
                                                        prephotovideoArray.push(foundphotovideo.photovideo[j])
                                                    };
                                                    updatephotovideo(data)
                                                }

                                                async function updatephotovideo(data) {
                                                    try {
                                                        const updatephotovideo = await Photovideo.findOneAndUpdate({ _id: photovideo_id }, data)
                                                        if (updatephotovideo) {
                                                            const resss = { message: "Response OK.", code: response_codes.RESPONSE_OK }
                                                            removeprephotovideo(resss)
                                                        }
                                                        else {
                                                            const resss = { message: "Response failed.", code: response_codes.RESPONSE_FAILED }
                                                            removeimage(resss)
                                                        }
                                                    }
                                                    catch (err) {
                                                        console.log(err)

                                                        const resss = { message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err }
                                                        removeimage(resss)
                                                    }
                                                }
                                            }
                                            else {
                                                const resss = { message: "Invalid photovideo ID.", code: response_codes.INVALID_PHOTO_VIDEO }
                                                removeimage(resss)
                                            }

                                            async function removeprephotovideo(resss) {
                                                if (prephotovideoArray.length >= 1) {
                                                    prephotovideoArray.every(async function (img, index) {
                                                        fs.unlink("./uploads/" + img, (err) => {
                                                            if (err) {
                                                                console.log(err)

                                                                if (index >= prephotovideoArray.length - 1) {
                                                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                                                }
                                                            }
                                                            else {
                                                                if (index >= prephotovideoArray.length - 1) {
                                                                    res.json(resss)
                                                                }
                                                            }
                                                        })
                                                    })

                                                }
                                                else {
                                                    res.json(resss);
                                                }
                                            }
                                        }
                                        catch (err) {
                                            console.log(err)
                                            const resss = { message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err }
                                            removeimage(resss)
                                        }
                                    }
                                    else {
                                        try {
                                            const allphotovideo = await Photovideo.find({ "category": category })
                                            const newposition = parseFloat(allphotovideo.length) + 1
                                            console.log(newposition)
                                            const photovideo = new Photovideo({
                                                "category": category, "heading_eng": heading_eng, "heading_nep": heading_nep,
                                                "caption_eng": caption_eng, "caption_nep": caption_nep, "photovideo": photovideoArray, "position": newposition
                                            })
                                            const registerphotovideo = await photovideo.save()
                                            if (registerphotovideo) {
                                                res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK })
                                            }
                                            else {
                                                const resss = { message: "Response failed.", code: response_codes.RESPONSE_FAILED }
                                                removeimage(resss)
                                            }
                                        }
                                        catch (err) {
                                            const resss = { message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err }
                                            removeimage(resss)
                                        }
                                    }
                                }
                                else {
                                    const resss = { message: "Incomplete request parameters.", code: response_codes.INCOMPLETE_REQ_PARAM }
                                    removeimage(resss)
                                }
                            }
                            else {
                                const resss = { message: "Not enough credentials.", code: response_codes.NOT_ENOUGH_CREDENTIALS }
                                removeimage(resss)
                            }
                        }
                    })
                }
                else {
                    const resss = { message: "Incomplete request parameters token missing.", code: response_codes.INCOMPLETE_REQ_PARAM }
                    removeimage(resss)
                }

                async function removeimage(resss)
                {
                    photovideoArray.every(async function (img, index) {

                        fs.unlink("./uploads/" + img, (err) => {
                            if (err) {
                                if (index >= photovideoArray.length - 1) {
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                }
                            }
                            else {
                                if (index >= photovideoArray.length - 1) {
                                    res.json(resss);
                                }
                            }
                        })

                    })
                }

                
            }
            
        }
    }),
    updatephotovideo:(async(req,res)=>{
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    if (usertype == "superadmin") {
                        const category = req.body.category
                        const heading_nep = req.body.heading_nep
                        const heading_eng = req.body.heading_eng
                        const caption_nep = req.body.caption_nep
                        const caption_eng = req.body.caption_eng
                        const photovideo_id = req.body.photovideo_id
                        const position=req.body.position
                        const status=req.body.status

                        if (photovideo_id != undefined && photovideo_id != "") {
                            if ((heading_eng && category && heading_nep && caption_eng && caption_nep != undefined) &&
                                heading_eng && category && heading_nep && caption_eng && caption_nep != undefined) {
                                const data = {
                                    "heading_eng": heading_eng, "heading_nep": heading_nep, "caption_eng": caption_eng,
                                    "caption_nep": caption_nep, "category": category
                                }
                                updatephotovideo(data);

                            }
                            else if (position != undefined && position != "") {
                                try {
                                    var length;
                                    if (position == "up") {
                                        try {
                                            const findphotovideo = await Photovideo.findOne({ _id: photovideo_id })
                                            if (findphotovideo) {
                                                const foundphotovideolength = await Photovideo.find({ "category": findphotovideo.category })
                                                length = foundphotovideolength.length
                                                if (length <= 1) {
                                                    res.json({ message: "Only question of this type registered cannot change position.", code: response_codes.RESPONSE_FAILED });
                                                }
                                                else {
                                                    const initialposition = parseFloat(findphotovideo.position) - 1;
                                                    const finalposition = findphotovideo.position;
                                                    if (initialposition <= 0) {
                                                        res.json({ message: "Position cannot be less than 1.", code: response_codes.RESPONSE_FAILED });
                                                    }
                                                    else {
                                                        const updateposition = await Photovideo.findOneAndUpdate({ "position": initialposition }, { "position": finalposition })
                                                        if (updateposition) {
                                                            const data = {
                                                                "position": initialposition
                                                            }
                                                            updatephotovideo(data)
                                                        }
                                                        else {
                                                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                                        }
                                                    }
                                                }
                                            }
                                            else {
                                                res.json({ message: "NO such photovideo registered.", code: response_codes.INVALID_PHOTO_VIDEO });
                                            }
                                        }
                                        catch (err) {
                                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                                        }
                                    }
                                    else if (position == "down") {
                                        try {
                                            const findphotovideo = await Photovideo.findOne({ _id: photovideo_id })
                                            if (findphotovideo) {
                                                const foundcategory=findphotovideo.category
                                                const foundphotovideolength = await Photovideo.find({ "category": foundcategory })
                                                length = foundphotovideolength.length
                                                const initialposition = parseFloat(findphotovideo.position) + 1;
                                                const finalposition = findphotovideo.position;
                                                if (initialposition > length) {
                                                    res.json({ message: "Position cannot be more than the number of same category photovideo registered.", code: response_codes.RESPONSE_FAILED });
                                                }
                                                else {
                                                    const updateposition = await Photovideo.findOneAndUpdate({ "position": initialposition, "category":foundcategory }, { "position": finalposition })
                                                    if (updateposition) {
                                                        const data = {
                                                            "position": initialposition
                                                        }
                                                        updatephotovideo(data)
                                                    }
                                                    else {
                                                        res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                                    }
                                                }

                                            }
                                            else {
                                                res.json({ message: "NO such photovideo registered.", code: response_codes.INVALID_PHOTO_VIDEO });
                                            }
                                        }
                                        catch (err) {
                                            console.log(err)
                                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                                        }
                                    }
                                    else {
                                        res.json({ message: "Invalid type of position change.", code: response_codes.INVALID_POSITION_CHANGE });
                                    }
                                }
                                catch (err) {
                                    console.log(err)
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                                }

                            }
                            else if (status != undefined) {
                                const data = { "status": status }
                                updatephotovideo(data)

                            }
                            else {
                                res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
                            }

                            async function updatephotovideo(data) {
                                try {

                                    const updatedphotovideo = await Photovideo.findOneAndUpdate({ _id: photovideo_id }, data)

                                    if (updatedphotovideo) {
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
                            res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
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

    getallphotovideos: (async (req, res) => {
        const token = req.body.token
        const usertype = req.body.usertype
        if ((token && usertype != undefined) && (token && usertype != "")) {
            if (usertype == "dashboard") {
                jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                    if (err) {
                        res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                    }
                    else {
                        const usertype = authorizedData.userdata.usertype
                        if (usertype == "superadmin") {
                            getdata();
                        }
                        else {
                            res.json({ message: "Not enough credentials.", code: response_codes.NOT_ENOUGH_CREDENTIALS })

                        }
                    }
                })
            }
            else if (usertype == "app") {
                jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
                    if (err) {
                        res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                    }
                    else {
                        const usertype = authorizedData.userdata.usertype
                        if (usertype == "user") {
                            getdata();
                        }
                        else {
                            res.json({ message: "Not enough credentials.", code: response_codes.NOT_ENOUGH_CREDENTIALS })

                        }
                    }
                })
            }
            else {
                res.json({ message: "Invalid usertype.", code: response_codes.INVALID_USER_TYPE })
            }


            async function getdata() {
                try {
                    const photovideoall = await Photovideo.find();
                    const photovideos = await Photovideo.aggregate([
                        {
                            $project: {
                                home: { $cond: [{ $eq: ["$category", "home"] }, 1, 0] },
                                awareness: { $cond: [{ $eq: ["$category", "awareness"] }, 1, 0] },
                                help: { $cond: [{ $eq: ["$category", "help"] }, 1, 0] },
                                fight: { $cond: [{ $eq: ["$category", "fight"] }, 1, 0] }
                            }
                        },
                        {
                            $group: {
                                _id: null,

                                home: { $sum: "$home" },
                                awareness: { $sum: "$awareness" },
                                help: { $sum: "$help" },
                                fight: { $sum: "$fight" }


                            }
                        },
                    ])
                    if (photovideoall && photovideos) {
                        if (photovideoall.length <= 0) {
                            res.json({ message: "No Photo/videos registered yet.", code: response_codes.NO_PHOTO_VIDEOS });
                        }
                        else {
                            res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, photovideos: photovideos, photovideoall: photovideoall, total: photovideoall.length });
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
        }
        else {
            res.json({ message: "Incomplete request parameters.", code: response_codes.INCOMPLETE_REQ_PARAM })
        }

    }),

    getphotovideobyid: (async (req, res) => {
        const photovideo_id = req.body.photovideo_id
        const token = req.body.token
        if (photovideo_id != undefined && photovideo_id != "") {
            if (token != undefined && token != "") {
                jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                    if (err) {
                        res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                    }
                    else {
                        const usertype = authorizedData.userdata.usertype
                        if (usertype == "superadmin") {
                            try {
                                const foundphotovideo = await Photovideo.findOne({ _id: question_id })
                                if (foundphotovideo) {
                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
                                }
                                else {
                                    res.json({ message: "Invalid photovideo ID.", code: response_codes.INVALID_PHOTO_VIDEO });
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
        }
        else {
            res.json({ message: "Incomplete request parameters.", code: response_codes.INCOMPLETE_REQ_PARAM })
        }

    }),

}