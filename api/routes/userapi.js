const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const { RegisterUserValidation, UserLoginValidation } = require('../validation/user/user.validation')



router.post('/registerpasswordreset', controller.registerpasswordreset);
router.post('/resetpassword', controller.resetpassword);
router.post('/getplasmadonors', controller.getplasmadonatorlist);

//jwt fixed 

router.post('/register', RegisterUserValidation, controller.register_user);
router.post('/login', UserLoginValidation, controller.user_login);
router.post('/getuserbyid', controller.getuserbyid);

//update done for plasma donation
//update done for panic button first init
router.post('/updateuser', controller.update_user);
router.post('/otpresend', controller.otp_resend);
router.post('/otpactivate', controller.otp_activate);

module.exports = router;