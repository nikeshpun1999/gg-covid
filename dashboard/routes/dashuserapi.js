const express = require('express');
const router = express.Router();
const controller = require('../controllers/DashuserController');


router.post('/decode', controller.decode);
router.post('/updateuser',  controller.update_user);
router.post('/test', controller.testing_body_token);
// router.post('/message', controller.twilio);

//solved  
router.post('/registeruser', controller.registeruser);
router.post('/login', controller.user_login);
module.exports = router;