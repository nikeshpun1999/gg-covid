const response_codes = require('../../language/responsecodes');
const Question = require('../models/question');

const fs = require('fs')
const jwt = require('jsonwebtoken')

module.exports = {
    getallquestions: (async (req, res) => {
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
                    const questionsall = await Question.find();
                    const questions = await Question.aggregate([
                        {
                            $project: {
                                question: { $cond: [{ $eq: ["$question_type", "question"] }, 1, 0] },
                                symptom: { $cond: [{ $eq: ["$question_type", "symptom"] }, 1, 0] },
                                notification: { $cond: [{ $eq: ["$question_type", "notification"] }, 1, 0] }
                            }
                        },
                        {
                            $group: {
                                _id: null,

                                question: { $sum: "$question" },
                                symptom: { $sum: "$symptom" },
                                notification: { $sum: "$notification" }

                            }
                        },
                    ])
                    if (questionsall && questions) {
                        if (questionsall.length <= 0) {
                            res.json({ message: "No questions registered yet.", code: response_codes.NO_QUESTIONS });
                        }
                        else {
                            res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK, questions: questions, questionsall: questionsall, total: questionsall.length });
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
    registerquestion: (async (req, res) => {
        const token = req.body.token
        const files = req.files
        const issurvey=req.body.issurvey
        var main_img
        var awareness_img
        var survey_img
        var image_array = []
        var del_image_array = []
        if (req.files.main_img != undefined && req.files.main_img != "") {
            main_img = req.files.main_img[0].filename
            image_array.push(main_img)
        }
        if (req.files.awareness_img != undefined && req.files.awareness_img != "") {
            awareness_img = req.files.awareness_img[0].filename
            image_array.push(awareness_img)

        }
        if (req.files.survey_img != undefined && req.files.survey_img != "") {
            survey_img = req.files.survey_img[0].filename
            image_array.push(survey_img)

        }

        if (!files) {
            res.json({ message: "File upload failed.", code: response_codes.RESPONSE_FAILED });
        }
        else {

            if (token != undefined && token != "") {
                jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                    if (err) {
                        res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                    }
                    else {
                        const usertype = authorizedData.userdata.usertype
                        if (usertype == "superadmin") {
                            const heading_eng = req.body.heading_eng
                            const heading_nep = req.body.heading_nep
                            const caption_eng = req.body.caption_eng
                            const caption_nep = req.body.caption_nep
                            const question_type = req.body.question_type
                            const question_id = req.body.question_id
                            const survey_heading = req.body.survey_heading
                            
                            if ((heading_eng && question_type && heading_nep && caption_eng && caption_nep && main_img && awareness_img != undefined) &&
                                (heading_eng && question_type && heading_nep && caption_eng && caption_nep && main_img && awareness_img != "")) {

                                if (question_id != undefined && question_id != "") {
                                    try {
                                        const foundquestion = await Question.findOne({ _id: question_id })
                                        if (foundquestion) {
                                            const del_main_img = foundquestion.main_img
                                            const del_awareness_img = foundquestion.awareness_img
                                            if(foundquestion.survey.length>=1 && survey_img!=undefined && survey_img!="")
                                            {
                                                const del_survey_img = foundquestion.survey[0].survey_img
                                                del_image_array.push(del_survey_img)
                                            }
                                            del_image_array.push(del_main_img)
                                            del_image_array.push(del_awareness_img)
                                            var data;
                                            data = {
                                                "main_img": main_img, "awareness_img": awareness_img, "heading_eng": heading_eng, "heading_nep": heading_nep, "caption_eng": caption_eng,
                                                "caption_nep": caption_nep, "question_type": question_type
                                            }
                                            if ((survey_img != undefined) && (survey_img != "")) {
                                                if ((survey_heading != undefined) && (survey_heading != "")) {
                                                    data = {
                                                        "main_img": main_img, "awareness_img": awareness_img, "heading_eng": heading_eng, "heading_nep": heading_nep, "caption_eng": caption_eng,
                                                        "caption_nep": caption_nep, "survey": [{ "survey_img": survey_img, "survey_heading": survey_heading }], "question_type": question_type
                                                    }
                                                    updatequestion(data)
                                                }
                                                else {
                                                    const resss = { message: "Incomplete request parameters upload both survey heading and image.", code: response_codes.INCOMPLETE_REQ_PARAM }
                                                    removeimage(resss)
                                                }
                                            }
                                            else {
                                                updatequestion(data)
                                            }
                                            
                                            async function updatequestion(data) {
                                                try {
                                                    const updatequestion = await Question.findByIdAndUpdate({ _id: question_id }, data )
                                                    if (updatequestion) {
                                                        const resss = { message: "Response OK.", code: response_codes.RESPONSE_OK }
                                                        delexistingimage(resss)
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
                                else {

                                    try {
                                        const questions = await Question.find({"question_type":question_type})
                                        if (questions) {
                                            const position = parseFloat(questions.length) + 1

                                            var question;
                                            if (issurvey != undefined && issurvey) {
                                                if ((survey_heading && survey_img != undefined) && (survey_heading && survey_img != "")) {
                                                    question = new Question({
                                                        "heading_eng": heading_eng, "heading_nep": heading_nep, "caption_eng": caption_eng,
                                                        "caption_nep": caption_nep, "main_img": main_img, "awareness_img": awareness_img, "position": position,
                                                        "survey": [{ "survey_heading": survey_heading, "survey_img": survey_img }], "question_type": question_type

                                                    })
                                                    uploadquestion()

                                                }
                                                else {
                                                    const resss = { message: "Incomplete request parameters upload both survey heading and image.", code: response_codes.INCOMPLETE_REQ_PARAM }
                                                    removeimage(resss)
                                                }
                                            }
                                            else {

                                                question = new Question({
                                                    "heading_eng": heading_eng, "heading_nep": heading_nep, "caption_eng": caption_eng,
                                                    "caption_nep": caption_nep, "main_img": main_img, "awareness_img": awareness_img, "position": position
                                                    , "question_type": question_type
                                                })
                                                if (survey_img != undefined && survey_img != "") {
                                                    fs.unlink("./uploads/" + survey_img, (err) => {
                                                        if (err) {
                                                         console.log(err)
                                                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                                                        }
                                                        else {
                                                            uploadquestion()
                                                        }
                                                    })
                                                }
                                                else {
                                                    uploadquestion()
                                                }

                                            }

                                            async function uploadquestion() {
                                                try {
                                                    const registerquestion = await question.save()
                                                    if (registerquestion) {
                                                        res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK })
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
                                    }
                                    catch (err) {
                                        console.log(err)
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

        }
        async function removeimage(resss) {

            image_array.every(async function (img, index) {

                fs.unlink("./uploads/" + img, (err) => {
                    if (err) {
                        if (index >= image_array.length - 1) {
                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                        }
                    }
                    else {
                        if (index >= image_array.length - 1) {
                            res.json(resss);
                        }
                    }
                })

            })
        }

        async function delexistingimage(resss) {

            del_image_array.every(async function (img, index) {

                fs.unlink("./uploads/" + img, (err) => {
                    if (err) {
                        res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                    }
                    else {
                        if (index >= del_image_array.length - 1) {
                            res.json(resss);
                        }
                    }
                })

            })
        }

    }),
    getquestionbyid: (async (req, res) => {
        const question_id = req.body.question_id
        const token = req.body.token
        if (question_id != undefined && question_id != "") {
            if (token != undefined && token != "") {
                jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                    if (err) {
                        res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                    }
                    else {
                        const usertype = authorizedData.userdata.usertype
                        if (usertype == "superadmin") {
                            try {
                                const foundquestion = await Question.findOne({ _id: question_id })
                                if (foundquestion) {
                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
                                }
                                else {
                                    res.json({ message: "Invalid question ID.", code: response_codes.INVALID_QUESTION });
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
    deletequestion: (async (req, res) => {
        const id = req.body.id
        const question_id = req.body.question_id

        if ((question_id != undefined) && (question_id != "")) {
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
                                const foundquestion = await Question.findOne({ _id: question_id })
                                if(foundquestion)
                                {
                                    const main_img = foundquestion.main_img
                                    const awareness_img = foundquestion.awareness_img
                                    const survey_img = foundquestion.survey[0].survey_img
                                    var image_array = [];
                                    image_array.push(main_img);
                                    image_array.push(awareness_img)
                                    if (survey_img != undefined && survey_img != "") {
                                        image_array.push(survey_img)
                                    }
                                    console.log(image_array);
                                    const deletequestion = await Question.findOne({ _id: question_id });
                                    if (deletequestion) {
                                        image_array.every(async function (img, index) {

                                            fs.unlink("./uploads/" + img, async function (err) {
                                                console.log(img)
                                                if (err) {
                                                    if (index >= image_array.length - 1) {
                                                        res.json({ message: "Cannot unlink or find file to delete.", code: response_codes.RESPONSE_FAILED });
                                                    }
                                                }
                                                else {
                                                    if (index >= image_array.length - 1) {
                                                        const deletedquestion = await Question.findByIdAndDelete({ _id: question_id })

                                                        if (deletedquestion) {
                                                            const findsamequestiontype = await Question.find({ "question_type": foundquestion.question_type })
                                                            if (findsamequestiontype.length >= 1) {
                                                                var tochangearray = []
                                                                findsamequestiontype.forEach((element, index) => {
                                                                    if (parseFloat(foundquestion.position) < parseFloat(element.position)) {
                                                                        tochangearray.push(element)
                                                                    }
                                                                });
                                                                if (tochangearray.length >= 1) {
                                                                    tochangearray.forEach(async function (element, index) {
                                                                        id = element._id
                                                                        changedposition = parseFloat(element.position) - 1
                                                                        const changeposition = await Question.findOneAndUpdate({ _id: id }, { "position": changedposition })
                                                                        if (tochangearray.length <= index) {
                                                                            res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    res.json({ message: "Response OK.", code: response_codes.RESPONSE_OK });
                                                                }

                                                            }
                                                            else {
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
                                    else {
                                        res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                    }
                                }
                                else
                                {
                                    res.json({ message: "Invalid question ID.", code: response_codes.INVALID_QUESTION })
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
            res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
        }
    }),
    updatequestion: (async (req, res) => {
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_DASH_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    if (usertype == "superadmin") {
                        const heading_eng = req.body.heading_eng
                        const heading_nep = req.body.heading_nep
                        const caption_nep = req.body.caption_nep
                        const caption_eng = req.body.caption_eng
                        const question_id = req.body.question_id
                        const question_type = req.body.question_type
                        const position = req.body.position
                        const status = req.body.status
                        const survey_heading = req.body.survey_heading
                        const removesurvey=req.body.removesurvey
                        if (question_id != undefined && question_id != "") {
                            if ((heading_eng && question_type && heading_nep && caption_eng && caption_nep != undefined) &&
                                heading_eng && question_type && heading_nep && caption_eng && caption_nep != undefined) {
                                const data = {
                                    "heading_eng": heading_eng, "heading_nep": heading_nep, "caption_eng": caption_eng,
                                    "caption_nep": caption_nep, "question_type": question_type
                                }
                                updatequestion(data);
                                
                            }
                            else if( survey_heading!=undefined && survey_heading!='')
                            {
                                try {
                                    const questionsurvey = await Question.findOne({ _id: question_id })
                                    if (questionsurvey) {
                                        if (questionsurvey.survey[0].length>=1) {
                                            const survey_img = questionsurvey.survey[0].survey_img
                                            if(survey_img!=undefined && survey_img!="")
                                            {
                                                data = {
                                                    "survey": [{ "survey_heading": survey_heading }, { "survey_img": survey_img }]
                                                }
                                                updatequestion(data);
                                            }
                                            else
                                            {
                                                res.json({ message: "Question has no survey image to update.", code: response_codes.NO_QUESTION_SURVEY });
                                            }
                                            
                                        }
                                        else
                                        {
                                            res.json({ message: "Question has no survey to update.", code: response_codes.NO_QUESTION_SURVEY });
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
                            else if (position != undefined && position != "") {
                                try{
 
                                    if (position == "up") {
                                        try {
                                            var length
                                            const findquestion = await Question.findOne({ _id: question_id })
                                            if (findquestion) {
                                                const foundquestionlength = await Question.find({"question_type":findquestion.question_type})
                                                length = foundquestionlength.length
                                                if(length<=1)
                                                {
                                                    res.json({ message: "Only question of this type registered cannot change position.", code: response_codes.RESPONSE_FAILED });
                                                }
                                                else
                                                {
                                                    const initialposition = parseFloat(findquestion.position) - 1;
                                                    const finalposition = findquestion.position;
                                                    if (initialposition <= 0) {
                                                        res.json({ message: "Position cannot be less than 1.", code: response_codes.RESPONSE_FAILED });
                                                    }
                                                    else {
                                                        const updateposition = await Question.findOneAndUpdate({ "position": initialposition }, { "position": finalposition })
                                                        if (updateposition) {
                                                            const data = {
                                                                "position": initialposition
                                                            }
                                                            updatequestion(data)
                                                        }
                                                        else {
                                                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                                        }
                                                    }
                                                }
                                                                                               
                                            }
                                            else {
                                                res.json({ message: "NO such question registered.", code: response_codes.INVALID_QUESTION });
                                            }
                                        }
                                        catch (err) {
                                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                                        }
                                    }
                                    else if (position == "down") {
                                        try {
                                            const findquestion = await Question.findOne({ _id: question_id })
                                            if (findquestion) {
                                                const foundquestion_type = findquestion.question_type
                                                const foundquestionlength = await Question.find({ "question_type": foundquestion_type })
                                                length = foundquestionlength.length
                                                const initialposition = parseFloat(findquestion.position) + 1;
                                                const finalposition = findquestion.position;
                                                if(initialposition>length)
                                                {
                                                    res.json({ message: "Position cannot be more than the number of questions registered.", code: response_codes.RESPONSE_FAILED });
                                                }
                                                else
                                                {
                                                    const updateposition = await Question.findOneAndUpdate({ "position": initialposition, "question_type":foundquestion_type }, { "position": finalposition })
                                                    if (updateposition) {
                                                        const data = {
                                                            "position": initialposition
                                                        }
                                                        updatequestion(data)
                                                    }
                                                    else {
                                                        res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED });
                                                    }
                                                }
                                                
                                            }
                                            else {
                                                res.json({ message: "NO such question registered.", code: response_codes.INVALID_QUESTION });
                                            }
                                        }
                                        catch (err) {
                                            res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                                        }
                                    }
                                    else {
                                        res.json({ message: "Invalid type of position change.", code: response_codes.INVALID_POSITION_CHANGE });
                                    }
                                }
                                catch(err)
                                {
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                                }
                                
                            }
                            else if (status != undefined) {
                                const data = { "status": status }
                                updatequestion(data)

                            }
                            else if (removesurvey != undefined && removesurvey)
                            {
                                try{
                                    const findsurvey=await Question.findOne({_id:question_id})
                                    if(findsurvey)
                                    {
                                        if(findsurvey.survey.length>=1)
                                        {
                                            const img = findsurvey.survey[0].survey_img
                                            if(img!=undefined && img!="")
                                            {
                                                fs.unlink("./uploads/" + img, async function (err) {
                                                    console.log(img)
                                                    if (err) {
                                                        res.json({ message: "Cannot unlink or find file to delete.", code: response_codes.RESPONSE_FAILED });
                                                    }
                                                    else {
                                                        const data = { "survey": [] }
                                                        updatequestion(data)
                                                    }
                                                })
                                            }
                                            else
                                            {
                                                const data = { "survey": [] }
                                                updatequestion(data)
                                                res.json({ message: "Question has no survey image to delete.", code: response_codes.NO_QUESTION_SURVEY });
                                            }
                                            
                                        }
                                        else
                                        {
                                            res.json({ message: "Question has no survey registered to delete.", code: response_codes.NO_QUESTION_SURVEY });
                                        }   
                                    }
                                    else
                                    {
                                        res.json({ message: "NO such question registered.", code: response_codes.INVALID_QUESTION });
                                    }
                                    
                                }
                                catch(err)
                                {
                                    res.json({ message: "Response failed.", code: response_codes.RESPONSE_FAILED, error: err });
                                }
                            }
                            else {
                                res.json({ message: "Incomplete request parameters", code: response_codes.INCOMPLETE_REQ_PARAM })
                            }

                            async function updatequestion(data) {
                                try {
                                    console.log(data)
                                    const updatequestion = await Question.findOneAndUpdate({_id:question_id},  data )
                                    console.log(updatequestion)
                                    if (updatequestion) {
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



    })

}