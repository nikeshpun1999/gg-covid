
const response_codes = require('../../language/responsecodes');
const Checkup = require('../models/checkup');
const jwt=require('jsonwebtoken')

module.exports = {
    registercheckup: (async (req, res) => {
        const token = req.body.token
        if (token != undefined && token != "") {
            jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, authorizedData) => {
                if (err) {
                    res.json({ message: "Invalid token, could not connect to the protected route", code: response_codes.INVALID_TOKEN })
                }
                else {
                    const usertype = authorizedData.userdata.usertype
                    const user_id=authorizedData.userdata.id
                    const answers=req.body.answers

                    if (usertype == "user") {
                        if ( answers != undefined && answers != "")
                        {
                            if(answers.length==13)
                            {
                                var healthstatus='healthy';
                                answers.forEach(async function(answer,index){
                                    if(index<=2)
                                    {
                                        if(answer==1)
                                        {
                                            healthstatus="mild"
                                        }
                                    }
                                    else if(index>2 && index<=10)
                                    {
                                        if (answer == 1) {
                                            healthstatus = "medium"
                                        }
                                    }
                                    else
                                    {
                                        if (answer == 1) {
                                            healthstatus = "critical"
                                        }
                                    }

                                    if (answers.length <= index + 1) {
                                        try {
                                            const checkup = new Checkup({
                                                "user_id": user_id, "answers": answers, "status": healthstatus
                                            })
                                            const registercheckup=await checkup.save();
                                            if(registercheckup)
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
                                });
       
                            }
                            else
                            {
                                res.json({ message: "Invalid amount of survey answers.", code: response_codes.NOT_COMPLETE_SURVEY })
                            }
                            
                        }
                        else
                        {
                            res.json({ message: "Incomplete request parameters.", code: response_codes.INCOMPLETE_REQ_PARAM })
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
