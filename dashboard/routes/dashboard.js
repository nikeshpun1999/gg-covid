const express = require('express');
const router = express.Router();
const controller = require('../controllers/DashboardController');


router.post('/getdashboarddata', controller.getdashboard_data);
router.post('/getusersdata', controller.getusers_data);
router.post('/getpanicsdata', controller.getpanics_data);
router.post('/getblooddata', controller.getblood_data);
router.post('/updateuser', controller.update_user);
router.post('/approvedonation', controller.approvedonation);
// router.post('/getdonation', controller.getdonation);
// router.post('/setdonationmargin', controller.setdonationmargin);


module.exports = router;